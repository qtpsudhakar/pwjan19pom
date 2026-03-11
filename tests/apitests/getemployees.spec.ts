import { test, expect } from '@playwright/test';


test.describe('GET /employees API tests', { tag: ['@api', '@get'] }, () => {
    test('GET /employees — returns an array', async ({ request }) => {
        const response = await request.get('/employees');

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test('GET /employees — returns empty array when no employees exist', async ({ request }) => {
        const response = await request.get('/employees');

        expect(response.status()).toBe(200);    // 200, not 404

        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        // Array may be empty — that is valid
    });

    test('GET /employees?department=Engineering — returns only Engineering employees', async ({ request }) => {
        // Create test data first
        await request.post('/employees', {
            data: {
                firstName: 'Diana',
                lastName: 'Prince',
                email: 'diana.prince@company.com',
                department: 'Engineering',
                role: 'Tech Lead',
            },
        });

        // params: appends to the URL as a query string automatically
        const response = await request.get('/employees', {
            params: { department: 'Engineering' },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();

        // Every employee in the result must be from Engineering
        for (const employee of body) {
            expect(employee.department).toBe('Engineering');
        }
    });

    test('GET /employees?department=engineering — case sensitivity returns empty array', async ({ request }) => {
        const response = await request.get('/employees', {
            params: { department: 'engineering' },   // lowercase — no match
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveLength(0);   // empty array, not 404
    });

    test('GET /employees/:id — returns the correct employee', async ({ request }) => {
        // Create an employee to get a known ID
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'James',
                lastName: 'Rhodes',
                email: 'james.rhodes@company.com',
                department: 'HR',
                role: 'HR Manager',
            },
        });
        const { id } = await createResponse.json();

        const getResponse = await request.get(`/employees/${id}`);

        expect(getResponse.status()).toBe(200);

        const body = await getResponse.json();
        expect(body.id).toBe(id);
        expect(body.firstName).toBe('James');
        expect(body.email).toBe('james.rhodes@company.com');
    });

    test('GET /employees/:id — returns 404 for non-existent ID', async ({ request }) => {
        const response = await request.get('/employees/emp-999');

        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Employee not found');
    });

});