import { test, expect } from '../../fixtures/apitest';

// Helper: encode credentials to a Basic Auth header value
function basicAuthHeader(username: string, password: string): string {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
}

test.describe('Basic Auth Authentication', { tag: ['@api', '@basicauth'] }, () => {

  test('GET /basic/employees — valid credentials return 200', async ({ request }) => {
    const response = await request.get('/basic/employees', {
      headers: { Authorization: basicAuthHeader('admin_user', 'admin_pass') },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /basic/employees — invalid password returns 401', async ({ request }) => {
    const response = await request.get('/basic/employees', {
      headers: { Authorization: basicAuthHeader('admin_user', 'wrong-password') },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('GET /basic/employees — wrong username returns 401', async ({ request }) => {
    const response = await request.get('/basic/employees', {
      headers: { Authorization: basicAuthHeader('unknown_user', 'admin_pass') },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('GET /basic/employees — no auth header returns 401', async ({ request }) => {
    const response = await request.get('/basic/employees');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });

  test('GET /basic/employees — Bearer scheme instead of Basic returns 401', async ({ request }) => {
    const response = await request.get('/basic/employees', {
      headers: { Authorization: 'Bearer some-jwt-token' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });

  test('POST /basic/employees — creates employee with valid Basic Auth', async ({ request }) => {
    const uniqueEmail = `basic.user+${Date.now()}@company.com`;

    const response = await request.post('/basic/employees', {
      headers: { Authorization: basicAuthHeader('standard_user', 'secret_sauce') },
      data: {
        firstName: 'Basic',
        lastName: 'Auth',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Engineer',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.email).toBe(uniqueEmail);
  });

  test('POST /basic/employees — returns 401 without credentials', async ({ request }) => {
    const response = await request.post('/basic/employees', {
      data: {
        firstName: 'No',
        lastName: 'Auth',
        email: 'no.auth@company.com',
        department: 'HR',
        role: 'Manager',
      },
    });

    expect(response.status()).toBe(401);
  });

  test('GET /basic/employees/:id — returns 404 for non-existent employee', async ({ request }) => {
    const response = await request.get('/basic/employees/emp-999', {
      headers: { Authorization: basicAuthHeader('admin_user', 'admin_pass') },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Employee not found');
  });
});
