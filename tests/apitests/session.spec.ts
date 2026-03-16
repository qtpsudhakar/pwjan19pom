import { test, expect } from '../../fixtures/apitest';

// Session / Cookie auth
// Flow: POST /session/login → server sets Set-Cookie: session_id=<id>
// Playwright's request context stores and re-sends cookies automatically.

test.describe('Session / Cookie Authentication', { tag: ['@api', '@session'] }, () => {

  test('POST /session/login — valid credentials return 200 and set a cookie', async ({ request }) => {
    const response = await request.post('/session/login', {
      data: { username: 'admin_user', password: 'admin_pass' },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.message).toBe('Login successful');
    expect(body.displayName).toBeTruthy();

    // Verify the Set-Cookie header contains session_id
    const setCookie = response.headers()['set-cookie'];
    expect(setCookie).toContain('session_id=');
    expect(setCookie).toContain('HttpOnly');
  });

  test('POST /session/login — invalid password returns 401', async ({ request }) => {
    const response = await request.post('/session/login', {
      data: { username: 'admin_user', password: 'wrong-password' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid credentials');
  });

  test('POST /session/login — missing credentials returns 400', async ({ request }) => {
    const response = await request.post('/session/login', {
      data: { username: 'admin_user' },   // password omitted
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('username and password are required');
  });

  test('GET /session/employees — accessible after login (cookie sent automatically)', async ({ request }) => {
    // Login — Playwright stores the session_id cookie in this request context
    await request.post('/session/login', {
      data: { username: 'admin_user', password: 'admin_pass' },
    });

    // Cookie is automatically included by Playwright on subsequent requests
    const response = await request.get('/session/employees');

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test('GET /session/employees — returns 401 with no session cookie', async ({ request }) => {
    // Fresh request context — no cookie set
    const response = await request.get('/session/employees');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Not authenticated. Please log in.');
  });

  test('POST /session/employees — can create an employee after login', async ({ request }) => {
    await request.post('/session/login', {
      data: { username: 'standard_user', password: 'secret_sauce' },
    });

    const uniqueEmail = `session.user+${Date.now()}@company.com`;
    const response = await request.post('/session/employees', {
      data: {
        firstName: 'Session',
        lastName: 'User',
        email: uniqueEmail,
        department: 'HR',
        role: 'Manager',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.email).toBe(uniqueEmail);
  });

  test('POST /session/logout — clears the session and subsequent requests return 401', async ({ request }) => {
    // Login
    await request.post('/session/login', {
      data: { username: 'admin_user', password: 'admin_pass' },
    });

    // Confirm session is active
    const beforeLogout = await request.get('/session/employees');
    expect(beforeLogout.status()).toBe(200);

    // Logout
    const logoutResponse = await request.post('/session/logout');
    expect(logoutResponse.status()).toBe(200);
    const logoutBody = await logoutResponse.json();
    expect(logoutBody.message).toBe('Logged out successfully');

    // Session is now destroyed — cookie still sent but invalid
    const afterLogout = await request.get('/session/employees');
    expect(afterLogout.status()).toBe(401);
  });

  test('GET /session/employees/:id — returns 404 for non-existent employee', async ({ request }) => {
    await request.post('/session/login', {
      data: { username: 'admin_user', password: 'admin_pass' },
    });

    const response = await request.get('/session/employees/emp-999');
    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Employee not found');
  });
});
