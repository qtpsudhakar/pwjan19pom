import { test, expect } from '../../fixtures/apitest';

test.describe('JWT Token Authentication', { tag: ['@api', '@auth'] }, () => {

    test('POST /auth/login — valid credentials return a token', async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: { username: 'admin_user', password: 'admin_pass' },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.token).toBeTruthy();
        expect(typeof body.token).toBe('string');
    });

    test('POST /auth/login — invalid credentials return 401', async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: { username: 'admin_user', password: 'wrong-password' },
        });

        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body.error).toBe('Invalid credentials');
    });

    test('POST /auth/login — missing credentials return 400', async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: { username: 'admin_user' },  // password missing
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.error).toBe('username and password are required');
    });

    test('GET /employees — valid Bearer token returns 200', async ({ request }) => {
        const loginResponse = await request.post('/auth/login', {
            data: { username: 'admin_user', password: 'admin_pass' },
        });
        const { token } = await loginResponse.json();

        const response = await request.get('/employees', {
            headers: { Authorization: `Bearer ${token}` },
        });

        expect(response.status()).toBe(200);
    });

    test('GET /employees — no token returns 401', async ({ request }) => {
        const response = await request.get('/employees');

        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body.error).toBe('Missing or invalid Authorization header');
    });

    test('GET /employees — invalid token returns 401', async ({ request }) => {
        const response = await request.get('/employees', {
            headers: { Authorization: 'Bearer this.is.not.a.valid.token' },
        });

        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body.error).toBe('Invalid or expired token');
    });
});