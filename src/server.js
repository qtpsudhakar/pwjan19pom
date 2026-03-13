// server.js

const express = require('express');
const jwt = require('jsonwebtoken');
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
// Token authentication middleware
// Expects:  Authorization: Bearer <token>
// ---------------------------------------------------------------------------
function requireToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7); // strip "Bearer "

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ---------------------------------------------------------------------------
// POST /auth/login — exchange credentials for a JWT
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

// Protect all /employees routes with token authentication.
app.use('/employees', requireToken);

// In-memory storage.
// This array resets every time you restart the server.
// A real application would use a database.
let employees = [];
// sample employee object:
// {
//   id: 'emp-001',
//   firstName: 'Alice',
//   lastName: 'Smith',
//   email: 'alice.smith@company.com',
//   department: 'Engineering',
//   role: 'Engineer',
//   createdAt: '2024-01-01T00:00:00.000Z'
// }

// employees.push({
//   id: 'emp-001',
//   firstName: 'Alice',
//   lastName: 'Smith',
//   email: 'test@gmail.com',
//   department: 'Engineering',
//   role: 'Engineer',
//   createdAt: new Date().toISOString(),
// });


let nextId = 1;

// Valid department names.
// Any other value is rejected during validation.
const VALID_DEPARTMENTS = ['Engineering', 'HR', 'Finance', 'Marketing'];

// Shared validation function.
// Called by POST and PUT before saving anything.
// Returns an array of error messages. An empty array means all fields are valid.
function validateEmployee(data) {
  const errors = [];

  if (!data.firstName) errors.push('firstName is required');
  if (!data.lastName) errors.push('lastName is required');
  if (!data.email) errors.push('email is required');
  if (!data.department) errors.push('department is required');
  if (!data.role) errors.push('role is required');

  if (data.department && !VALID_DEPARTMENTS.includes(data.department)) {
    errors.push(`department must be one of: ${VALID_DEPARTMENTS.join(', ')}`);
  }

  return errors;
}


// POST /employees — create a new employee
app.post('/employees', (req, res) => {
  const data = req.body;

  // Step 1: Validate all required fields
  const errors = validateEmployee(data);
  if (errors.length > 0) {
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Step 2: Reject duplicate email addresses
  const emailExists = employees.some(emp => emp.email === data.email);
  if (emailExists) {
    return res.status(400).json({
      error: 'Validation failed',
      details: ['email already exists'],
    });
  }

  // Step 3: Build the full employee object with server-generated fields
  const newEmployee = {
    id: `emp-${String(nextId).padStart(3, '0')}`,  // emp-001, emp-002, ...
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    department: data.department,
    role: data.role,
    createdAt: new Date().toISOString(),
  };

  nextId++;
  employees.push(newEmployee); // Here we are mutating the in-memory array, which is fine for this simple example. In a real app, this would be a database insert.
  // In real applications we store data in databases, and the database would generate the ID and createdAt fields for us. Here we are simulating that logic in our server code.
  // Store data in DB: db.insert(newEmployee).then(saved => res.status(201).json(saved)).catch(err => res.status(500).json({ error: 'Database error', details: err.message }))

  // Step 4: Return 201 with the created employee
  res.status(201).json(newEmployee);
});


// GET /employees — return all employees, with an optional department filter
app.get('/employees', (req, res) => {
  const { department } = req.query;

  if (department) {
    const filtered = employees.filter(emp => emp.department === department);
    return res.status(200).json(filtered);
  }

  res.status(200).json(employees);
});

// GET /employees/:id — return a single employee by ID
app.get('/employees/:id', (req, res) => {
  const { id } = req.params;

  const employee = employees.find(emp => emp.id === id);

  if (!employee) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  res.status(200).json(employee);
});

// PUT /employees/:id — replace an employee record entirely
app.put('/employees/:id', (req, res) => {
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

  // Full replacement — every field comes from the request body
  // Only id and createdAt are preserved from the original record
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

// PATCH /employees/:id — update only the fields provided
app.patch('/employees/:id', (req, res) => {
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
    ...employees[index],   // keep everything
    ...updates,            // overwrite only what was sent
    id: employees[index].id,        // id can never change
    createdAt: employees[index].createdAt, // createdAt can never change
  };

  res.status(200).json(employees[index]);
});

// DELETE /employees/:id — remove an employee record
app.delete('/employees/:id', (req, res) => {
  const { id } = req.params;

  const index = employees.findIndex(emp => emp.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Employee not found', id });
  }

  employees.splice(index, 1);  // remove the employee from the array

  res.status(204).send();      // 204 = success, no body
});


app.listen(3000, () => {
  console.log('Employee API running at http://localhost:3000');
});


