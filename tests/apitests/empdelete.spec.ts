import { test, expect } from '../../fixtures/apitest';


test.describe('DELETE /employees/:id API tests', { tag: ['@api', '@delete'] }, () => {

    test('DELETE /employees/:id — removes the employee', async ({ request, authToken }) => {
        const createResponse = await request.post('/employees', {
            
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Temp',
                lastName: 'Employee',
                email: `temp.delete.${Date.now()}@company.com`,
                department: 'Finance',
                role: 'Analyst',
            },
        });
        const { id } = await createResponse.json();

        // Delete the employee
        const deleteResponse = await request.delete(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        // 204 = success. Do NOT call response.json() here — there is no body.
        expect(deleteResponse.status()).toBe(204);

        // Confirm the record is actually gone
        const getResponse = await request.get(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(getResponse.status()).toBe(404);
    });

    test('DELETE /employees/:id — 404 for non-existent ID', async ({ request, authToken }) => {
        const response = await request.delete('/employees/emp-999', {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body.error).toBe('Employee not found');
    });

    test('DELETE /employees/:id — 404 on second delete attempt', async ({ request, authToken }) => {
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'Once',
                lastName: 'Only',
                email: `once.only.${Date.now()}@company.com`,
                department: 'Marketing',
                role: 'Designer',
            },
        });
        const { id } = await createResponse.json();

        // First delete — succeeds
        const firstDelete = await request.delete(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(firstDelete.status()).toBe(204);

        // Second delete — employee is already gone
        const secondDelete = await request.delete(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        expect(secondDelete.status()).toBe(404);
    });

    test('DELETE /employees/:id — employee is gone from GET /employees list', async ({ request, authToken }) => {
        const createResponse = await request.post('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
            data: {
                firstName: 'List',
                lastName: 'Test',
                email: `list.delete.${Date.now()}@company.com`,
                department: 'HR',
                role: 'Coordinator',
            },
        });
        const { id } = await createResponse.json();

        await request.delete(`/employees/${id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
        });

        // Confirm it no longer appears in the list
        const listResponse = await request.get('/employees', {
            headers: { Authorization: `Bearer ${authToken}` },
        });
        const allEmployees = await listResponse.json();

        const stillExists = allEmployees.some((emp: { id: string }) => emp.id === id);
        expect(stillExists).toBe(false);
    });

});