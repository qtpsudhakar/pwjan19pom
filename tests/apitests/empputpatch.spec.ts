import { test, expect } from '@playwright/test';

test.describe('PUT /employees/:id and PATCH /employees/:id API tests', { tag: ['@api', '@put', '@patch'] }, () => {
    let authToken: string;

    test.beforeAll(async ({ request }) => {
        const response = await request.post('/auth/login', {
            data: { username: 'admin_user', password: 'admin_pass' },
        });
        authToken = (await response.json()).token;
    });

    test('PUT /employees/:id — updates the employee role', async ({ request }) => {
        const email = `sarah.put.${Date.now()}@company.com`;
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email,
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const created = await createResponse.json();

        // PUT requires ALL fields — only role is different here
        const updateResponse = await request.put(`/employees/${created.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email,
                department: 'Engineering',
                role: 'Staff Engineer',
            },
        });

        expect(updateResponse.status()).toBe(200);

        const body = await updateResponse.json();
        expect(body.role).toBe('Staff Engineer');
        expect(body.id).toBe(created.id);
        expect(body.createdAt).toBe(created.createdAt);  // must not change
    });

    test('PUT /employees/:id — data loss when omitting fields', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Tony',
                lastName: 'Stark',
                email: `tony.puttest.${Date.now()}@company.com`,
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const { id } = await createResponse.json();

        // Only send role — all other fields will become undefined
        const updateResponse = await request.put(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                role: 'Staff Engineer',   // incomplete PUT — data loss
            },
        });

        // Validation catches this — firstName, lastName, email, department are all required
        expect(updateResponse.status()).toBe(400);

        const body = await updateResponse.json();
        expect(body.error).toBe('Validation failed');
    });

    test('PUT /employees/:id — 404 for non-existent employee', async ({ request }) => {
        const response = await request.put('/employees/emp-999', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Ghost',
                lastName: 'Employee',
                email: 'ghost@company.com',
                department: 'Finance',
                role: 'Analyst',
            },
        });

        expect(response.status()).toBe(404);
    });

    test('PATCH /employees/:id — updates only the specified field', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Tony',
                lastName: 'Stark',
                email: `tony.stark.${Date.now()}@company.com`,
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const created = await createResponse.json();

        // PATCH — only change role
        const patchResponse = await request.patch(`/employees/${created.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
            data: { role: 'Principal Engineer' },
        });

        expect(patchResponse.status()).toBe(200);

        const body = await patchResponse.json();

        // Role changed
        expect(body.role).toBe('Principal Engineer');

        // Everything else must be unchanged — this is the PATCH guarantee
        expect(body.firstName).toBe('Tony');
        expect(body.email).toBe(created.email);
        expect(body.department).toBe('Engineering');
        expect(body.id).toBe(created.id);
        expect(body.createdAt).toBe(created.createdAt);
    });

    test('PATCH /employees/:id — 400 for invalid department', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Bruce',
                lastName: 'Banner',
                email: `bruce.banner.${Date.now()}@company.com`,
                department: 'Engineering',
                role: 'Research Scientist',
            },
        });
        const { id } = await createResponse.json();

        const response = await request.patch(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
            data: { department: 'Quantum Physics' },   // not a valid department
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.details[0]).toContain('department must be one of');
    });

    test('PATCH /employees/:id — 404 for non-existent employee', async ({ request }) => {
        const response = await request.patch('/employees/emp-999', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: { role: 'Ghost' },
        });

        expect(response.status()).toBe(404);
    });

});