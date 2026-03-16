import { test, expect } from '../../fixtures/apitest';
import { createHmac } from 'crypto';

// HMAC Signature auth
// The client signs: METHOD + '\n' + PATH + '\n' + TIMESTAMP  using a shared secret.
// Headers sent:
//   Authorization: HMAC-SHA256 Credential=<clientId>, Signature=<hex>
//   x-timestamp:   <unix timestamp in seconds>

// HMAC clients defined in server.js
const CLIENTS = {
  'client-abc': 'secret-key-abc',
  'client-xyz': 'secret-key-xyz',
};

// Helper: compute HMAC-SHA256 and build the required headers for a request
function hmacAuthHeaders(
  method: string,
  path: string,
  clientId: string,
  secret: string,
  overrideTimestamp?: number
): Record<string, string> {
  const timestamp = (overrideTimestamp ?? Math.floor(Date.now() / 1000)).toString();
  const stringToSign = `${method}\n${path}\n${timestamp}`;
  const signature = createHmac('sha256', secret).update(stringToSign).digest('hex');

  return {
    'Authorization': `HMAC-SHA256 Credential=${clientId}, Signature=${signature}`,
    'x-timestamp': timestamp,
  };
}

test.describe('HMAC Signature Authentication', { tag: ['@api', '@hmac'] }, () => {

  test('GET /hmac/employees — valid signature returns 200', async ({ request }) => {
    const response = await request.get('/hmac/employees', {
      headers: hmacAuthHeaders('GET', '/hmac/employees', 'client-abc', CLIENTS['client-abc']),
    });

    expect(response.status()).toBe(200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test('GET /hmac/employees — second client key also works', async ({ request }) => {
    const response = await request.get('/hmac/employees', {
      headers: hmacAuthHeaders('GET', '/hmac/employees', 'client-xyz', CLIENTS['client-xyz']),
    });

    expect(response.status()).toBe(200);
  });

  test('GET /hmac/employees — missing Authorization header returns 401', async ({ request }) => {
    const response = await request.get('/hmac/employees', {
      headers: { 'x-timestamp': Math.floor(Date.now() / 1000).toString() },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing or invalid Authorization header');
  });

  test('GET /hmac/employees — missing x-timestamp header returns 401', async ({ request }) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = createHmac('sha256', CLIENTS['client-abc'])
      .update(`GET\n/hmac/employees\n${timestamp}`)
      .digest('hex');

    const response = await request.get('/hmac/employees', {
      headers: { 'Authorization': `HMAC-SHA256 Credential=client-abc, Signature=${signature}` },
      // x-timestamp intentionally omitted
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Missing x-timestamp header');
  });

  test('GET /hmac/employees — unknown client_id returns 401', async ({ request }) => {
    const response = await request.get('/hmac/employees', {
      headers: hmacAuthHeaders('GET', '/hmac/employees', 'client-unknown', 'any-secret'),
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Unknown client');
  });

  test('GET /hmac/employees — wrong secret produces invalid signature (401)', async ({ request }) => {
    const response = await request.get('/hmac/employees', {
      headers: hmacAuthHeaders('GET', '/hmac/employees', 'client-abc', 'wrong-secret'),
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid signature');
  });

  test('GET /hmac/employees — expired timestamp returns 401', async ({ request }) => {
    // Timestamp from 10 minutes ago — exceeds the 5-minute tolerance
    const staleTimestamp = Math.floor(Date.now() / 1000) - 600;

    const response = await request.get('/hmac/employees', {
      headers: hmacAuthHeaders('GET', '/hmac/employees', 'client-abc', CLIENTS['client-abc'], staleTimestamp),
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Request timestamp expired');
  });

  test('GET /hmac/employees — signature for wrong path is rejected', async ({ request }) => {
    // Sign for /hmac/employees but send to a different path concept —
    // to simulate a MITM that replays a captured request against a different endpoint
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const tamperedSignature = createHmac('sha256', CLIENTS['client-abc'])
      .update(`GET\n/different/path\n${timestamp}`)
      .digest('hex');

    const response = await request.get('/hmac/employees', {
      headers: {
        'Authorization': `HMAC-SHA256 Credential=client-abc, Signature=${tamperedSignature}`,
        'x-timestamp': timestamp,
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid signature');
  });

  test('POST /hmac/employees — creates employee with valid HMAC signature', async ({ request }) => {
    const uniqueEmail = `hmac.user+${Date.now()}@company.com`;

    const response = await request.post('/hmac/employees', {
      headers: hmacAuthHeaders('POST', '/hmac/employees', 'client-abc', CLIENTS['client-abc']),
      data: {
        firstName: 'Hmac',
        lastName: 'Signed',
        email: uniqueEmail,
        department: 'Engineering',
        role: 'Engineer',
      },
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBeTruthy();
    expect(body.email).toBe(uniqueEmail);
  });

  test('GET /hmac/employees/:id — returns 404 for non-existent employee', async ({ request }) => {
    const response = await request.get('/hmac/employees/emp-999', {
      headers: hmacAuthHeaders('GET', '/hmac/employees/emp-999', 'client-abc', CLIENTS['client-abc']),
    });

    expect(response.status()).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Employee not found');
  });
});
