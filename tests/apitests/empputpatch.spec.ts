import { test, expect } from '@playwright/test';

test.describe('PUT /employees/:id and PATCH /employees/:id API tests', { tag: ['@api', '@put', '@patch'] }, () => {
    test('PUT /employees/:id — updates the employee role', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email: 'sarah.put@company.com',
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const created = await createResponse.json();

        // PUT requires ALL fields — only role is different here
        const updateResponse = await request.put(`/employees/${created.id}`, {
            data: {
                firstName: 'Sarah',
                lastName: 'Connor',
                email: 'sarah.put@company.com',
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
            data: {
                firstName: 'Tony',
                lastName: 'Stark',
                email: 'tony.puttest@company.com',
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const { id } = await createResponse.json();

        // Only send role — all other fields will become undefined
        const updateResponse = await request.put(`/employees/${id}`, {
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
            data: {
                firstName: 'Tony',
                lastName: 'Stark',
                email: 'tony.stark@company.com',
                department: 'Engineering',
                role: 'Senior Engineer',
            },
        });
        const created = await createResponse.json();

        // PATCH — only change role
        const patchResponse = await request.patch(`/employees/${created.id}`, {
            data: { role: 'Principal Engineer' },
        });

        expect(patchResponse.status()).toBe(200);

        const body = await patchResponse.json();

        // Role changed
        expect(body.role).toBe('Principal Engineer');

        // Everything else must be unchanged — this is the PATCH guarantee
        expect(body.firstName).toBe('Tony');
        expect(body.email).toBe('tony.stark@company.com');
        expect(body.department).toBe('Engineering');
        expect(body.id).toBe(created.id);
        expect(body.createdAt).toBe(created.createdAt);
    });

    test('PATCH /employees/:id — 400 for invalid department', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'Bruce',
                lastName: 'Banner',
                email: 'bruce.banner@company.com',
                department: 'Engineering',
                role: 'Research Scientist',
            },
        });
        const { id } = await createResponse.json();

        const response = await request.patch(`/employees/${id}`, {
            data: { department: 'Quantum Physics' },   // not a valid department
        });

        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body.details[0]).toContain('department must be one of');
    });

    test('PATCH /employees/:id — 404 for non-existent employee', async ({ request }) => {
        const response = await request.patch('/employees/emp-999', {
            data: { role: 'Ghost' },
        });

        expect(response.status()).toBe(404);
    });

});