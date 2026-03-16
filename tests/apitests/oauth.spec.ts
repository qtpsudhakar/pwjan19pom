import { test, expect } from '../../fixtures/apitest';

// OAuth client credentials defined in server.js
const TEST_CLIENT    = { client_id: 'test-client',  client_secret: 'test-secret' };
const ADMIN_CLIENT   = { client_id: 'admin-client', client_secret: 'admin-secret' };

// Helper: obtain an OAuth access token for a given client
async function getOAuthToken(request: any, client = TEST_CLIENT): Promise<string> {
  const response = await request.post('/oauth/token', {
    data: { grant_type: 'client_credentials', ...client },
  });
  const body = await response.json();
  return body.access_token;
}

test.describe('OAuth 2.0 — Token Endpoint (POST /oauth/token)', { tag: ['@api', '@oauth'] }, () => {

  test('returns access_token for valid client_credentials', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'client_credentials', ...TEST_CLIENT },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
    expect(body.token_type).toBe('Bearer');
    expect(body.expires_in).toBe(3600);
  });

  test('returns access_token for admin client', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'client_credentials', ...ADMIN_CLIENT },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.access_token).toBeTruthy();
  });

  test('returns 400 for unsupported grant_type', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'authorization_code', ...TEST_CLIENT },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('unsupported_grant_type');
  });

  test('returns 400 when client_id or client_secret is missing', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'client_credentials', client_id: 'test-client' },
      // client_secret omitted
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('client_id and client_secret are required');
  });

  test('returns 401 for invalid client credentials', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'client_credentials', client_id: 'test-client', client_secret: 'wrong-secret' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('invalid_client');
  });

  test('returns 401 for unknown client_id', async ({ request }) => {
    const response = await request.post('/oauth/token', {
      data: { grant_type: 'client_credentials', client_id: 'unknown-client', client_secret: 'test-secret' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('invalid_client');
  });
});

test.describe('OAuth 2.0 — Protected Routes (GET /oauth/employees)', { tag: ['@api', '@oauth'] }, () => {

  test('GET /oauth/employees — valid access token returns 200', async ({ request }) => {
    const accessToken = await getOAuthToken(request);

    const response = await request.get('/oauth/employees', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test('GET /oauth/employees — no token returns 401', async ({ request }) => {
    const response = await request.get('/oauth/employees');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });

  test('GET /oauth/employees — invalid token returns 401', async ({ request }) => {
    const response = await request.get('/oauth/employees', {
      headers: { Authorization: 'Bearer this.is.not.valid' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid or expired token');
  });

  test('GET /oauth/employees — JWT login token rejected (wrong token type)', async ({ request }) => {
    // Get a regular JWT from /auth/login
    const loginResponse = await request.post('/auth/login', {
      data: { username: 'admin_user', password: 'admin_pass' },
    });
    const { token } = await loginResponse.json();

    // JWT login token should NOT work on /oauth/employees
    const response = await request.get('/oauth/employees', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid token type');
  });

  test('GET /employees — OAuth access token rejected on JWT-protected route', async ({ request }) => {
    const accessToken = await getOAuthToken(request);

    // OAuth token should NOT work on /employees (JWT route)
    const response = await request.get('/employees', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid token type');
  });

  test('POST /oauth/employees — creates employee with valid OAuth token', async ({ request }) => {
    const accessToken = await getOAuthToken(request, ADMIN_CLIENT);
    const uniqueEmail = `oauth.user+${Date.now()}@company.com`;

    const response = await request.post('/oauth/employees', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        firstName: 'OAuth',
        lastName: 'Client',
        email: uniqueEmail,
        department: 'Marketing',
        role: 'Manager',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.firstName).toBe('OAuth');
    expect(body.email).toBe(uniqueEmail);
  });

  test('GET /oauth/employees/:id — returns 404 for non-existent employee', async ({ request }) => {
    const accessToken = await getOAuthToken(request);

    const response = await request.get('/oauth/employees/emp-999', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Employee not found');
  });
});
