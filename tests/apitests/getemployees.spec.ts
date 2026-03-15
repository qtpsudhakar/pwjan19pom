import { test, expect } from '../../fixtures/apitest';


test.describe('GET /employees API tests', { tag: ['@api', '@get'] }, () => {

    test('GET /employees — returns an array', async ({ request, authToken }) => {
        const response = await request.get('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
    });

    test('GET /employees — returns empty array when no employees exist', async ({ request, authToken }) => {
        const response = await request.get('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status()).toBe(200);    // 200, not 404

        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
        // Array may be empty — that is valid
    });

    test('GET /employees?department=Engineering — returns only Engineering employees', async ({ request, authToken }) => {
        // Create test data first
        await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Diana',
                lastName: 'Prince',
                email: `diana.prince.${Date.now()}@company.com`,
                department: 'Engineering',
                role: 'Tech Lead',
            },
        });

        // params: appends to the URL as a query string automatically
        const response = await request.get('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { department: 'Engineering' },
        });

        expect(response.status()).toBe(200);

        const body = await response.json();

        // Every employee in the result must be from Engineering
        for (const employee of body) {
            expect(employee.department).toBe('Engineering');
        }
    });

    test('GET /employees?department=engineering — case sensitivity returns empty array', async ({ request, authToken }) => {
        const response = await request.get('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            params: { department: 'engineering' },   // lowercase — no match
        });

        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body).toHaveLength(0);   // empty array, not 404
    });

    test('GET /employees/:id — returns the correct employee', async ({ request, authToken }) => {
        // Create an employee to get a known ID
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'James',
                lastName: 'Rhodes',
                email: `james.rhodes.${Date.now()}@company.com`,
                department: 'HR',
                role: 'HR Manager',
            },
        });
        const created = await createResponse.json();

        const getResponse = await request.get(`/employees/${created.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(getResponse.status()).toBe(200);

        const body = await getResponse.json();
        expect(body.id).toBe(created.id);
        expect(body.firstName).toBe('James');
        expect(body.email).toBe(created.email);
    });

    test('GET /employees/:id — returns 404 for non-existent ID', async ({ request, authToken }) => {
        const response = await request.get('/employees/emp-999', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Employee not found');
    });

});