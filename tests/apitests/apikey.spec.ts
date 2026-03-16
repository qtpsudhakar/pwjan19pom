import { test, expect } from '../../fixtures/apitest';

// Valid API keys defined in server.js
const VALID_STANDARD_KEY = 'key-standard-abc123';
const VALID_ADMIN_KEY    = 'key-admin-xyz789';

test.describe('API Key Authentication', { tag: ['@api', '@apikey'] }, () => {

  test('GET /apikey/employees — valid standard key returns 200', async ({ request }) => {
    const response = await request.get('/apikey/employees', {
      headers: { 'x-api-key': VALID_STANDARD_KEY },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('GET /apikey/employees — valid admin key returns 200', async ({ request }) => {
    const response = await request.get('/apikey/employees', {
      headers: { 'x-api-key': VALID_ADMIN_KEY },
    });

    expect(response.status()).toBe(200);
  });

  test('GET /apikey/employees — missing x-api-key header returns 401', async ({ request }) => {
    const response = await request.get('/apikey/employees');

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid API key');
  });

  test('GET /apikey/employees — invalid API key returns 401', async ({ request }) => {
    const response = await request.get('/apikey/employees', {
      headers: { 'x-api-key': 'not-a-real-key' },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid API key');
  });

  test('GET /apikey/employees — empty API key returns 401', async ({ request }) => {
    const response = await request.get('/apikey/employees', {
      headers: { 'x-api-key': '' },
    });

    expect(response.status()).toBe(401);
  });

  test('POST /apikey/employees — creates employee with valid API key', async ({ request }) => {
    const uniqueEmail = `apikey.user+${Date.now()}@company.com`;

    const response = await request.post('/apikey/employees', {
      headers: { 'x-api-key': VALID_STANDARD_KEY },
      data: {
        firstName: 'Api',
        lastName: 'Key',
        email: uniqueEmail,
        department: 'Finance',
        role: 'Analyst',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.firstName).toBe('Api');
    expect(body.email).toBe(uniqueEmail);
  });

  test('POST /apikey/employees — returns 400 for invalid department', async ({ request }) => {
    const response = await request.post('/apikey/employees', {
      headers: { 'x-api-key': VALID_ADMIN_KEY },
      data: {
        firstName: 'Bad',
        lastName: 'Dept',
        email: 'bad.dept.apikey@company.com',
        department: 'Sales',   // not a valid department
        role: 'Manager',
      },
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Validation failed');
    expect(body.details[0]).toContain('department must be one of');
  });

  test('GET /apikey/employees/:id — returns 404 for non-existent employee', async ({ request }) => {
    const response = await request.get('/apikey/employees/emp-999', {
      headers: { 'x-api-key': VALID_ADMIN_KEY },
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Employee not found');
  });
});
