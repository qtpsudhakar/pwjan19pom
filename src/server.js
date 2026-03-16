// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const app = express();

// Parse incoming request bodies as JSON.
// Without this line, req.body is always undefined on POST and PUT requests.
app.use(express.json());

// ---------------------------------------------------------------------------
// JWT configuration
// In production, set JWT_SECRET via an environment variable — never hard-code.
// ---------------------------------------------------------------------------
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '1h';

// In-memory user store (a real app would use a database with hashed passwords).
const USERS = [
  { username: 'standard_user', password: 'secret_sauce', displayName: 'Standard User' },
  { username: 'admin_user',    password: 'admin_pass',   displayName: 'Admin User' },
];

// ---------------------------------------------------------------------------
// AUTH 1 — JWT Bearer Token middleware
// Expects: Authorization: Bearer <token>
// Tokens are issued by POST /auth/login
// ---------------------------------------------------------------------------
function requireToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Reject OAuth tokens — they belong to /oauth/employees only
    if (payload.type === 'oauth2') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------------------------------------------------------------------------
// AUTH 2 — HTTP Basic Auth middleware
// Expects: Authorization: Basic base64(username:password)
// ---------------------------------------------------------------------------
function requireBasicAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const base64Credentials = authHeader.slice(6); // strip "Basic "
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');

  const colonIndex = decoded.indexOf(':');
  if (colonIndex === -1) {
    return res.status(401).json({ error: 'Invalid credentials format' });
  }

  const username = decoded.slice(0, colonIndex);
  const password = decoded.slice(colonIndex + 1);

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.user = { username: user.username, displayName: user.displayName };
  next();
}

// ---------------------------------------------------------------------------
// AUTH 3 — API Key middleware
// Expects: x-api-key: <key>
// ---------------------------------------------------------------------------
const API_KEYS = {
  'key-standard-abc123': 'Standard User',
  'key-admin-xyz789':    'Admin User',
};

function requireApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || !API_KEYS[apiKey]) {
    return res.status(401).json({ error: 'Missing or invalid API key' });
  }

  req.user = { displayName: API_KEYS[apiKey] };
  next();
}

// ---------------------------------------------------------------------------
// AUTH 4 — OAuth 2.0 Client Credentials middleware
// Expects: Authorization: Bearer <access_token>
// Tokens are issued by POST /oauth/token (grant_type=client_credentials)
// ---------------------------------------------------------------------------
const OAUTH_CLIENTS = [
  { clientId: 'test-client',  clientSecret: 'test-secret',  name: 'Test Application' },
  { clientId: 'admin-client', clientSecret: 'admin-secret', name: 'Admin Application' },
];

function requireOAuthToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Only accept tokens issued via /oauth/token
    if (payload.type !== 'oauth2') {
      return res.status(401).json({ error: 'Invalid token type' });
    }
    req.client = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------------------------------------------------------------------------
// AUTH 5 — Session / Cookie
// POST /session/login  → validates credentials, creates a session, sets Set-Cookie
// POST /session/logout → destroys the session
// Expects: Cookie: session_id=<id>  (sent automatically by the client after login)
// ---------------------------------------------------------------------------
const sessions = new Map(); // sessionId → { username, displayName }

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    cookies[key.trim()] = rest.join('=').trim();
  }
  return cookies;
}

function requireSession(req, res, next) {
  const cookies = parseCookies(req.headers['cookie']);
  const sessionId = cookies['session_id'];

  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Not authenticated. Please log in.' });
  }

  req.session = sessions.get(sessionId);
  next();
}

// ---------------------------------------------------------------------------
// AUTH 6 — HMAC Signature
// Client signs:  METHOD + '\n' + PATH + '\n' + TIMESTAMP  using a shared secret
// Headers required:
//   Authorization: HMAC-SHA256 Credential=<clientId>, Signature=<hex>
//   x-timestamp:   <unix timestamp in seconds>
// Server rejects requests whose timestamp is more than 5 minutes old.
// ---------------------------------------------------------------------------
const HMAC_CLIENTS = {
  'client-abc': 'secret-key-abc',
  'client-xyz': 'secret-key-xyz',
};

const HMAC_TOLERANCE_SECONDS = 300; // 5-minute replay-attack window

function requireHmac(req, res, next) {
  const authHeader = req.headers['authorization'];
  const timestamp  = req.headers['x-timestamp'];

  if (!authHeader || !authHeader.startsWith('HMAC-SHA256 ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  if (!timestamp) {
    return res.status(401).json({ error: 'Missing x-timestamp header' });
  }

  // Parse  Credential=<id>, Signature=<hex>  from the header value
  const params = {};
  for (const part of authHeader.slice('HMAC-SHA256 '.length).split(',')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx !== -1) {
      params[part.slice(0, eqIdx).trim()] = part.slice(eqIdx + 1).trim();
    }
  }

  const clientId  = params['Credential'];
  const signature = params['Signature'];

  if (!clientId || !signature) {
    return res.status(401).json({ error: 'Malformed Authorization header' });
  }

  const secret = HMAC_CLIENTS[clientId];
  if (!secret) {
    return res.status(401).json({ error: 'Unknown client' });
  }

  // Reject requests whose timestamp is too far from the server clock
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp, 10)) > HMAC_TOLERANCE_SECONDS) {
    return res.status(401).json({ error: 'Request timestamp expired' });
  }

  // Recompute the expected signature and compare
  const path = req.originalUrl.split('?')[0];
  const stringToSign = `${req.method}\n${path}\n${timestamp}`;
  const expected = crypto.createHmac('sha256', secret).update(stringToSign).digest('hex');

  if (signature !== expected) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  req.client = { clientId };
  next();
}

// ---------------------------------------------------------------------------
// POST /auth/login — exchange user credentials for a JWT (AUTH 1)
// ---------------------------------------------------------------------------
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { username: user.username, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(200).json({ token });
});

// ---------------------------------------------------------------------------
// POST /oauth/token — exchange client credentials for an access token (AUTH 4)
// Supports grant_type=client_credentials only
// ---------------------------------------------------------------------------
app.post('/oauth/token', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body || {};

  if (grant_type !== 'client_credentials') {
    return res.status(400).json({ error: 'unsupported_grant_type' });
  }

  if (!client_id || !client_secret) {
    return res.status(400).json({ error: 'client_id and client_secret are required' });
  }

  const client = OAUTH_CLIENTS.find(c => c.clientId === client_id && c.clientSecret === client_secret);
  if (!client) {
    return res.status(401).json({ error: 'invalid_client' });
  }

  const accessToken = jwt.sign(
    { clientId: client.clientId, name: client.name, type: 'oauth2' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(200).json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
  });
});

// ---------------------------------------------------------------------------
// POST /session/login — create a session and set a cookie (AUTH 5)
// ---------------------------------------------------------------------------
app.post('/session/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = USERS.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const sessionId = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, { username: user.username, displayName: user.displayName });

  res.setHeader('Set-Cookie', `session_id=${sessionId}; HttpOnly; Path=/`);
  res.status(200).json({ message: 'Login successful', displayName: user.displayName });
});

// POST /session/logout — destroy the session (AUTH 5)
app.post('/session/logout', (req, res) => {
  const cookies = parseCookies(req.headers['cookie']);
  const sessionId = cookies['session_id'];

  if (sessionId) {
    sessions.delete(sessionId);
  }

  res.setHeader('Set-Cookie', 'session_id=; HttpOnly; Path=/; Max-Age=0');
  res.status(200).json({ message: 'Logged out successfully' });
});

// ---------------------------------------------------------------------------
// In-memory storage — shared across all auth route groups.
// Resets every time the server restarts.
// ---------------------------------------------------------------------------
let employees = [];
let nextId = 1;

// Valid department names — any other value is rejected during validation.
const VALID_DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing'];

// Shared validation — called by POST and PUT before saving.
// Returns an array of error messages; empty array means valid.
function validateEmployee(data) {
  const errors = [];

  if (!data.firstName)  errors.push('firstName is required');
  if (!data.lastName)   errors.push('lastName is required');
  if (!data.email)      errors.push('email is required');
  if (!data.department) errors.push('department is required');
  if (!data.role)       errors.push('role is required');

  if (data.department && !VALID_DEPARTMENTS.includes(data.department)) {
    errors.push(`department must be one of: ${VALID_DEPARTMENTS.join(', ')}`);
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Employee CRUD router — mounted at four paths, each protected by a
// different auth middleware so students can practice each auth type
// independently against the same API logic.
// ---------------------------------------------------------------------------
const employeeRouter = express.Router();

// POST / — create a new employee
employeeRouter.post('/', (req, res) => {
  const data = req.body;

  const errors = validateEmployee(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  const emailExists = employees.some(emp => emp.email === data.email);
  if (emailExists) {
    return res.status(400).json({ error: 'Validation failed', details: ['email already exists'] });
  }

  const newEmployee = {
    id: `emp-${String(nextId).padStart(3, '0')}`,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    department: data.department,
    role: data.role,
    createdAt: new Date().toISOString(),
  };

  nextId++;
  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

// GET / — return all employees, with an optional ?department= filter
employeeRouter.get('/', (req, res) => {
  const { department } = req.query;

  if (department) {
    return res.status(200).json(employees.filter(emp => emp.department === department));
  }

  res.status(200).json(employees);
});

// GET /:id — return a single employee by ID
employeeRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  const employee = employees.find(emp => emp.id === id);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  res.status(200).json(employee);
});

// PUT /:id — replace an employee record entirely
employeeRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const index = employees.findIndex(emp => emp.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  const errors = validateEmployee(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Full replacement — only id and createdAt are preserved from the original
  employees[index] = {
    id: employees[index].id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    department: data.department,
    role: data.role,
    createdAt: employees[index].createdAt,
  };

  res.status(200).json(employees[index]);
});

// PATCH /:id — update only the fields provided
employeeRouter.patch('/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const index = employees.findIndex(emp => emp.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  if (updates.department && !VALID_DEPARTMENTS.includes(updates.department)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [`department must be one of: ${VALID_DEPARTMENTS.join(', ')}`],
    });
  }

  // Spread merge — keep all existing fields, overwrite only what was sent
  employees[index] = {
    ...employees[index],
    ...updates,
    id: employees[index].id,            // id can never change
    createdAt: employees[index].createdAt, // createdAt can never change
  };

  res.status(200).json(employees[index]);
});

// DELETE /:id — remove an employee record
employeeRouter.delete('/:id', (req, res) => {
  const { id } = req.params;

  const index = employees.findIndex(emp => emp.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  employees.splice(index, 1);
  res.status(204).send();
});

// ---------------------------------------------------------------------------
// Mount the employee router with each auth middleware
//   /employees         → AUTH 1: JWT Bearer token  (POST /auth/login)
//   /basic/employees   → AUTH 2: HTTP Basic Auth
//   /apikey/employees  → AUTH 3: API Key            (x-api-key header)
//   /oauth/employees   → AUTH 4: OAuth 2.0          (POST /oauth/token)
//   /session/employees → AUTH 5: Session / Cookie   (POST /session/login)
//   /hmac/employees    → AUTH 6: HMAC Signature     (x-timestamp + Authorization: HMAC-SHA256)
// ---------------------------------------------------------------------------
app.use('/employees',         requireToken,      employeeRouter);
app.use('/basic/employees',   requireBasicAuth,  employeeRouter);
app.use('/apikey/employees',  requireApiKey,     employeeRouter);
app.use('/oauth/employees',   requireOAuthToken, employeeRouter);
app.use('/session/employees', requireSession,    employeeRouter);
app.use('/hmac/employees',    requireHmac,       employeeRouter);


app.listen(3000, () => {
  console.log('Employee API running at http://localhost:3000');
});


