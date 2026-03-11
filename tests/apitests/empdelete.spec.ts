import { test, expect } from '@playwright/test';


test.describe('DELETE /employees/:id API tests', { tag: ['@api', '@delete'] }, () => {
    test('DELETE /employees/:id — removes the employee', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'Temp',
                lastName: 'Employee',
                email: 'temp.delete@company.com',
                department: 'Finance',
                role: 'Analyst',
            },
        });
        const { id } = await createResponse.json();

        // Delete the employee
        const deleteResponse = await request.delete(`/employees/${id}`);

        // 204 = success. Do NOT call response.json() here — there is no body.
        expect(deleteResponse.status()).toBe(204);

        // Confirm the record is actually gone
        const getResponse = await request.get(`/employees/${id}`);
        expect(getResponse.status()).toBe(404);
    });

    test('DELETE /employees/:id — 404 for non-existent ID', async ({ request }) => {
        const response = await request.delete('/employees/emp-999');

        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Employee not found');
    });

    test('DELETE /employees/:id — 404 on second delete attempt', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'Once',
                lastName: 'Only',
                email: 'once.only@company.com',
                department: 'Marketing',
                role: 'Designer',
            },
        });
        const { id } = await createResponse.json();

        // First delete — succeeds
        const firstDelete = await request.delete(`/employees/${id}`);
        expect(firstDelete.status()).toBe(204);

        // Second delete — employee is already gone
        const secondDelete = await request.delete(`/employees/${id}`);
        expect(secondDelete.status()).toBe(404);
    });

    test('DELETE /employees/:id — employee is gone from GET /employees list', async ({ request }) => {
        const createResponse = await request.post('/employees', {
            data: {
                firstName: 'List',
                lastName: 'Test',
                email: 'list.delete@company.com',
                department: 'HR',
                role: 'Coordinator',
            },
        });
        const { id } = await createResponse.json();

        await request.delete(`/employees/${id}`);

        // Confirm it no longer appears in the list
        const listResponse = await request.get('/employees');
        const allEmployees = await listResponse.json();

        const stillExists = allEmployees.some((emp: { id: string }) => emp.id === id);
        expect(stillExists).toBe(false);
    });

});