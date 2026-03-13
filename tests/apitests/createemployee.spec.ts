// tests/employees.spec.ts
import { test, expect } from '@playwright/test';

// test.use({ baseURL: 'http://localhost:3000/' }); // Override baseURL for these tests if needed
test.describe('Employee API - Create Employee', { tag: ['@api', '@post'] }, () => {
    let authToken: string;

    test.beforeAll(async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: { username: 'admin_user', password: 'admin_pass' },
        });
        authToken = (await response.json()).token;
    });

    test('POST /employees — creates a new employee', async ({ request }) => {

        // Create new email to avoid conflicts with existing data
        const uniqueEmail = `sarah.connor+${Date.now()}@company.com`;
        const response = await request.post('/employees', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
                // 'X-API-Key': 'key-abc-123'
            },
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email: uniqueEmail,
                department: 'Engineering',
                role: 'Senior Engineer'
            },
        });

        console.log('Response status:', response.status());
        console.log('Response body:', await response.text());
        // Assert status FIRST — if this fails, the body may not have the right shape
        expect(response.status()).toBe(201);

        const body = await response.json();

        // Server-generated fields must exist
        expect(body.id).toBeTruthy();
        expect(body.createdAt).toBeTruthy();

        // Fields we sent must come back correctly
        expect(body.firstName).toBe('Sarah');
        expect(body.email).toBe(uniqueEmail);
        expect(body.department).toBe('Engineering');
    });

    test('POST /employees — returns 400 when email is missing', async ({ request }) => {
        const response = await request.post('/employees', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                firstName: 'No',
                lastName: 'Email',
                department: 'HR',
                role: 'Manager',
                // email intentionally omitted
            },
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.error).toBe('Validation failed');
        expect(body.details).toContain('email is required');
    });

    test('POST /employees — returns 400 for invalid department', async ({ request }) => {
        const response = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Bad',
                lastName: 'Dept',
                email: 'bad.dept@company.com',
                department: 'Sales',    // not a valid value
                role: 'Manager',
            },
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.details[0]).toContain('department must be one of');
    });

    test('POST /employees — returns 400 for duplicate email', async ({ request }) => {
        const sharedEmail = 'duplicate@company.com';

        // Create the first employee
        await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'First',
                lastName: 'Employee',
                email: sharedEmail,
                department: 'HR',
                role: 'Manager',
            },
        });

        // Attempt to create a second with the same email
        const response = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Second',
                lastName: 'Employee',
                email: sharedEmail,
                department: 'Finance',
                role: 'Analyst',
            },
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.details).toContain('email already exists');
    });

});