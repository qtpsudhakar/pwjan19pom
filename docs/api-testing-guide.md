# API Testing Guide — Playwright with TypeScript

This guide covers every concept demonstrated in this project: authentication testing, CRUD operations, response assertions, test structure, fixtures, and common patterns. All examples map directly to the test files in `tests/apitests/`.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [How Playwright API Testing Works](#2-how-playwright-api-testing-works)
3. [Fixtures — Shared Setup](#3-fixtures--shared-setup)
4. [Authentication Testing](#4-authentication-testing)
   - [4.1 JWT Bearer Token](#41-jwt-bearer-token)
   - [4.2 HTTP Basic Auth](#42-http-basic-auth)
   - [4.3 API Key](#43-api-key)
   - [4.4 OAuth 2.0 Client Credentials](#44-oauth-20-client-credentials)
   - [4.5 Token Isolation — Cross-Route Rejection](#45-token-isolation--cross-route-rejection)
5. [CRUD Testing](#5-crud-testing)
   - [5.1 POST — Create](#51-post--create)
   - [5.2 GET — Read All](#52-get--read-all)
   - [5.3 GET — Read One](#53-get--read-one)
   - [5.4 PUT — Full Replace](#54-put--full-replace)
   - [5.5 PATCH — Partial Update](#55-patch--partial-update)
   - [5.6 DELETE — Remove](#56-delete--remove)
6. [Assertion Patterns](#6-assertion-patterns)
7. [Test Data Strategies](#7-test-data-strategies)
8. [Negative Testing](#8-negative-testing)
9. [Test Tags and Filtering](#9-test-tags-and-filtering)
10. [Running Tests](#10-running-tests)

---

## 1. Project Structure

```
tests/
  apitests/
    auth.spec.ts            # JWT auth — login + token validation
    createemployee.spec.ts  # POST /employees
    getemployees.spec.ts    # GET /employees, GET /employees/:id
    empputpatch.spec.ts     # PUT and PATCH /employees/:id
    empdelete.spec.ts       # DELETE /employees/:id
    basicauth.spec.ts       # HTTP Basic Auth
    apikey.spec.ts          # API Key auth
    oauth.spec.ts           # OAuth 2.0 client credentials

fixtures/
  apitest.ts                # Custom test fixture — shared authToken

src/
  server.js                 # Express API with 4 auth types + employee CRUD
```

---

## 2. How Playwright API Testing Works

Playwright provides a built-in HTTP client via `request` that you use in tests directly — no third-party library (e.g. axios or supertest) is needed.

```typescript
import { test, expect } from '@playwright/test';

test('example GET request', async ({ request }) => {
  const response = await request.get('http://localhost:3000/employees');
  expect(response.status()).toBe(200);
});
```

The `request` fixture is the API request context. It supports all HTTP methods: `get`, `post`, `put`, `patch`, `delete`.

### Base URL

The `baseURL` is set in `playwright.config.ts` so you never repeat the host:

```typescript
use: {
  baseURL: 'http://localhost:3000/',
}
```

From that point on, all paths in tests are relative:

```typescript
await request.get('/employees')       // → http://localhost:3000/employees
await request.post('/auth/login')     // → http://localhost:3000/auth/login
```

---

## 3. Fixtures — Shared Setup

**File:** `fixtures/apitest.ts`

A fixture is reusable setup code that Playwright injects into your tests. Instead of calling `POST /auth/login` at the top of every test, a worker-scoped fixture does it once and shares the token across all tests in that worker.

```typescript
// fixtures/apitest.ts
import { test as baseTest, APIRequestContext } from '@playwright/test';

export const test = baseTest.extend<{}, { authToken: string }>({
  authToken: [
    async ({ playwright }, use) => {
      const request: APIRequestContext = await playwright.request.newContext({
        baseURL: 'http://localhost:3000/',
      });

      const response = await request.post('/auth/login', {
        data: { username: 'admin_user', password: 'admin_pass' },
      });

      const { token } = await response.json();
      await request.dispose();

      await use(token);   // inject the token into the test
    },
    { scope: 'worker' }, // run once per worker, not once per test
  ],
});

export { expect } from '@playwright/test';
```

### Using the fixture in a test

```typescript
import { test, expect } from '../../fixtures/apitest';

test('GET /employees — returns 200', async ({ request, authToken }) => {
  const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(response.status()).toBe(200);
});
```

**Key concepts:**
- `{ scope: 'worker' }` — the token is fetched once per Playwright worker, not before every test. This is far more efficient in parallel test runs.
- `await use(token)` — everything before `use()` is setup; everything after `use()` would be teardown.
- Tests that do NOT need auth (e.g. auth tests that intentionally test the login flow) import from `@playwright/test` directly instead.

---

## 4. Authentication Testing

### Authentication Types — Quick Reference

| Auth Type | How It Works | Header / Example | Security Level | Common Use Cases |
|-----------|-------------|-----------------|---------------|-----------------|
| **JWT Bearer Token** | Client logs in once to receive a signed token. Token is sent with every request. Server verifies the signature without hitting a database. | `Authorization: Bearer eyJhbGci...` | Medium–High | Modern REST APIs, single-page apps, mobile apps |
| **HTTP Basic Auth** | Username and password concatenated with `:`, base64-encoded, and sent in the `Authorization` header with every request. | `Authorization: Basic YWRtaW46cGFzcw==` | Low (must use HTTPS) | Legacy systems, simple internal tools, HTTP-authenticated feeds |
| **API Key** | A pre-shared secret string sent in a custom header. Server validates against a known list. | `x-api-key: key-abc-123` | Low–Medium | Internal services, simple third-party integrations, public APIs with rate limiting |
| **OAuth 2.0 — Client Credentials** | Machine-to-machine flow. A client app exchanges its `client_id` + `client_secret` for a short-lived access token. No user involved. | `POST /oauth/token` → `Authorization: Bearer <access_token>` | High | Backend services, daemons, CI/CD pipelines, server-to-server communication |
| **Session / Cookie** | After login, the server creates a session and sends a `Set-Cookie` header. The client automatically includes the cookie on every subsequent request. | `POST /session/login` → `Cookie: session_id=abc123` (sent automatically) | Medium (CSRF risk without HTTPS) | Traditional web apps, server-rendered pages, admin dashboards |
| **HMAC Signature** | Client signs the request method, path, and timestamp using a shared secret key. Server recomputes the same signature to verify integrity and freshness. | `Authorization: HMAC-SHA256 Credential=client-abc, Signature=<hex>` + `x-timestamp: <unix>` | Very High | Payment gateways (Stripe, AWS), webhook verification, financial APIs |

> **Route prefixes in this project** — `/employees` (JWT) · `/basic/employees` (Basic Auth) · `/apikey/employees` (API Key) · `/oauth/employees` (OAuth 2.0) · `/session/employees` (Session/Cookie) · `/hmac/employees` (HMAC)

---

### 4.1 JWT Bearer Token

**File:** `tests/apitests/auth.spec.ts`  
**Route prefix:** `/employees`

#### Flow
1. `POST /auth/login` with `username` + `password`
2. Extract `token` from the response body
3. Send `Authorization: Bearer <token>` on every subsequent request

#### Testing the login endpoint

```typescript
// Happy path — valid credentials return a token
test('POST /auth/login — valid credentials return a token', async ({ request }) => {
  const response = await request.post('/auth/login', {
    data: { username: 'admin_user', password: 'admin_pass' },
  });

  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.token).toBeTruthy();        // token exists
  expect(typeof body.token).toBe('string'); // and is a string
});

// Wrong password — expect 401
test('POST /auth/login — invalid credentials return 401', async ({ request }) => {
  const response = await request.post('/auth/login', {
    data: { username: 'admin_user', password: 'wrong-password' },
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Invalid credentials');
});

// Missing field — expect 400
test('POST /auth/login — missing password returns 400', async ({ request }) => {
  const response = await request.post('/auth/login', {
    data: { username: 'admin_user' },   // password omitted
  });

  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBe('username and password are required');
});
```

#### Testing token protection

```typescript
// No token at all
test('GET /employees — no token returns 401', async ({ request }) => {
  const response = await request.get('/employees');
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Missing or invalid Authorization header');
});

// Malformed token
test('GET /employees — invalid token returns 401', async ({ request }) => {
  const response = await request.get('/employees', {
    headers: { Authorization: 'Bearer this.is.not.a.valid.token' },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Invalid or expired token');
});
```

---

### 4.2 HTTP Basic Auth

**File:** `tests/apitests/basicauth.spec.ts`  
**Route prefix:** `/basic/employees`

#### How it works
Credentials are sent with every request. There is no login step.

```
Authorization: Basic base64("username:password")
```

#### Encoding in TypeScript

```typescript
function basicAuthHeader(username: string, password: string): string {
  return 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
}
```

Example — `admin_user:admin_pass` → `YWRtaW5fdXNlcjphZG1pbl9wYXNz`

#### Tests

```typescript
// Valid credentials
test('GET /basic/employees — valid credentials return 200', async ({ request }) => {
  const response = await request.get('/basic/employees', {
    headers: { Authorization: basicAuthHeader('admin_user', 'admin_pass') },
  });
  expect(response.status()).toBe(200);
});

// Wrong password
test('GET /basic/employees — invalid password returns 401', async ({ request }) => {
  const response = await request.get('/basic/employees', {
    headers: { Authorization: basicAuthHeader('admin_user', 'wrong-password') },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Invalid credentials');
});

// Missing header entirely
test('GET /basic/employees — no auth header returns 401', async ({ request }) => {
  const response = await request.get('/basic/employees');
  expect(response.status()).toBe(401);
});

// Wrong scheme — Bearer instead of Basic
test('Bearer token rejected on Basic Auth route', async ({ request }) => {
  const response = await request.get('/basic/employees', {
    headers: { Authorization: 'Bearer some-jwt-token' },
  });
  expect(response.status()).toBe(401);
});
```

---

### 4.3 API Key

**File:** `tests/apitests/apikey.spec.ts`  
**Route prefix:** `/apikey/employees`

#### How it works
A pre-shared secret key is sent in a custom header. No login, no encoding.

```
x-api-key: key-admin-xyz789
```

#### Available keys

| Key | Identity |
|-----|----------|
| `key-standard-abc123` | Standard User |
| `key-admin-xyz789` | Admin User |

#### Tests

```typescript
const VALID_KEY = 'key-standard-abc123';

// Valid key
test('GET /apikey/employees — valid key returns 200', async ({ request }) => {
  const response = await request.get('/apikey/employees', {
    headers: { 'x-api-key': VALID_KEY },
  });
  expect(response.status()).toBe(200);
});

// Missing header
test('GET /apikey/employees — missing x-api-key returns 401', async ({ request }) => {
  const response = await request.get('/apikey/employees');
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Missing or invalid API key');
});

// Wrong key value
test('GET /apikey/employees — invalid key returns 401', async ({ request }) => {
  const response = await request.get('/apikey/employees', {
    headers: { 'x-api-key': 'not-a-real-key' },
  });
  expect(response.status()).toBe(401);
});
```

---

### 4.4 OAuth 2.0 Client Credentials

**File:** `tests/apitests/oauth.spec.ts`  
**Route prefix:** `/oauth/employees`

#### Flow
1. `POST /oauth/token` with `grant_type`, `client_id`, `client_secret`
2. Extract `access_token` from the response
3. Send `Authorization: Bearer <access_token>` on every request to `/oauth/employees`

This is the simplest OAuth 2.0 flow — no browser, no redirects, no user login. It is used for machine-to-machine communication.

#### Helper function

```typescript
async function getOAuthToken(request: any, client = TEST_CLIENT): Promise<string> {
  const response = await request.post('/oauth/token', {
    data: { grant_type: 'client_credentials', ...client },
  });
  const body = await response.json();
  return body.access_token;
}
```

#### Testing the token endpoint

```typescript
// Successful token issuance
test('returns access_token for valid client_credentials', async ({ request }) => {
  const response = await request.post('/oauth/token', {
    data: {
      grant_type: 'client_credentials',
      client_id: 'test-client',
      client_secret: 'test-secret',
    },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.access_token).toBeTruthy();
  expect(body.token_type).toBe('Bearer');
  expect(body.expires_in).toBe(3600);
});

// Wrong grant type
test('returns 400 for unsupported grant_type', async ({ request }) => {
  const response = await request.post('/oauth/token', {
    data: { grant_type: 'authorization_code', client_id: 'test-client', client_secret: 'test-secret' },
  });
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toBe('unsupported_grant_type');
});

// Wrong secret
test('returns 401 for invalid client credentials', async ({ request }) => {
  const response = await request.post('/oauth/token', {
    data: { grant_type: 'client_credentials', client_id: 'test-client', client_secret: 'wrong' },
  });
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('invalid_client');
});
```

---

### 4.5 Token Isolation — Cross-Route Rejection

A key testing concept: tokens issued for one auth type must be rejected by routes protected by a different auth type.

```typescript
// OAuth access token must NOT work on the JWT route
test('OAuth token rejected on JWT-protected /employees', async ({ request }) => {
  const accessToken = await getOAuthToken(request);

  const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Invalid token type');
});

// JWT login token must NOT work on the OAuth route
test('JWT login token rejected on /oauth/employees', async ({ request }) => {
  const loginResponse = await request.post('/auth/login', {
    data: { username: 'admin_user', password: 'admin_pass' },
  });
  const { token } = await loginResponse.json();

  const response = await request.get('/oauth/employees', {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.error).toBe('Invalid token type');
});
```

---

## 5. CRUD Testing

All CRUD tests use the JWT `authToken` fixture. The same patterns apply to `/basic/employees`, `/apikey/employees`, and `/oauth/employees`.

### 5.1 POST — Create

**File:** `tests/apitests/createemployee.spec.ts`

```typescript
test('POST /employees — creates a new employee', async ({ request, authToken }) => {
  const uniqueEmail = `sarah.connor+${Date.now()}@company.com`;

  const response = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {
      firstName: 'Sarah',
      lastName: 'Connor',
      email: uniqueEmail,
      department: 'Engineering',
      role: 'Senior Engineer',
    },
  });

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
```

**Why `Date.now()` in the email?**  
The server rejects duplicate emails. Using `Date.now()` guarantees a unique email per test run, preventing false failures when tests run in parallel or the server state persists between runs.

---

### 5.2 GET — Read All

**File:** `tests/apitests/getemployees.spec.ts`

```typescript
// Returns an array (never null, never 404, even when empty)
test('GET /employees — returns an array', async ({ request, authToken }) => {
  const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body)).toBe(true);
});

// Filter by department using query params
test('GET /employees?department=Engineering', async ({ request, authToken }) => {
  const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    params: { department: 'Engineering' },  // Playwright appends ?department=Engineering
  });

  expect(response.status()).toBe(200);
  const body = await response.json();

  // Every result must be from Engineering
  for (const employee of body) {
    expect(employee.department).toBe('Engineering');
  }
});

// Department filter is case-sensitive — lowercase returns empty array, not 404
test('GET /employees?department=engineering — empty array (case-sensitive)', async ({ request, authToken }) => {
  const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    params: { department: 'engineering' },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body).toHaveLength(0);
});
```

---

### 5.3 GET — Read One

```typescript
test('GET /employees/:id — returns correct employee', async ({ request, authToken }) => {
  // Step 1: Create an employee so we have a known ID
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

  // Step 2: Fetch by the ID that was just created
  const getResponse = await request.get(`/employees/${created.id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  expect(getResponse.status()).toBe(200);

  const body = await getResponse.json();
  expect(body.id).toBe(created.id);
  expect(body.firstName).toBe('James');
  expect(body.email).toBe(created.email);
});

// Non-existent ID
test('GET /employees/:id — 404 for non-existent ID', async ({ request, authToken }) => {
  const response = await request.get('/employees/emp-999', {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(response.status()).toBe(404);
  const body = await response.json();
  expect(body.error).toBe('Employee not found');
});
```

**The create-then-read pattern** is the standard approach in API testing. You never hard-code an ID like `emp-001` because in-memory data resets on server restart — always create the data you need, then use the IDs from the response.

---

### 5.4 PUT — Full Replace

**File:** `tests/apitests/empputpatch.spec.ts`

`PUT` replaces the entire resource. All fields must be supplied.

```typescript
test('PUT /employees/:id — updates the employee role', async ({ request, authToken }) => {
  const email = `sarah.put.${Date.now()}@company.com`;

  // Step 1: Create
  const createResponse = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Sarah', lastName: 'Connor', email, department: 'Engineering', role: 'Senior Engineer' },
  });
  const created = await createResponse.json();

  // Step 2: PUT — only role is different, but ALL fields must still be provided
  const updateResponse = await request.put(`/employees/${created.id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Sarah', lastName: 'Connor', email, department: 'Engineering', role: 'Staff Engineer' },
  });

  expect(updateResponse.status()).toBe(200);

  const body = await updateResponse.json();
  expect(body.role).toBe('Staff Engineer');
  expect(body.id).toBe(created.id);          // id must not change
  expect(body.createdAt).toBe(created.createdAt); // createdAt must not change
});
```

#### Testing the PUT vs PATCH difference

This is a critical distinction to understand and test explicitly:

```typescript
// PUT with only one field fails — because all other fields become missing
test('PUT /employees/:id — data loss when omitting fields', async ({ request, authToken }) => {
  const createResponse = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Tony', lastName: 'Stark', email: `tony.${Date.now()}@company.com`, department: 'Engineering', role: 'Engineer' },
  });
  const { id } = await createResponse.json();

  const updateResponse = await request.put(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { role: 'Staff Engineer' },   // incomplete — all other fields omitted
  });

  // Validation rejects this — it's a PUT, so ALL fields are required
  expect(updateResponse.status()).toBe(400);
  const body = await updateResponse.json();
  expect(body.error).toBe('Validation failed');
});
```

---

### 5.5 PATCH — Partial Update

`PATCH` only changes the fields you send. All other fields remain exactly as they were.

```typescript
test('PATCH /employees/:id — updates only the specified field', async ({ request, authToken }) => {
  const createResponse = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Tony', lastName: 'Stark', email: `tony.${Date.now()}@company.com`, department: 'Engineering', role: 'Senior Engineer' },
  });
  const created = await createResponse.json();

  // PATCH — only send the field you want to change
  const patchResponse = await request.patch(`/employees/${created.id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { role: 'Principal Engineer' },
  });

  expect(patchResponse.status()).toBe(200);

  const body = await patchResponse.json();

  // The changed field
  expect(body.role).toBe('Principal Engineer');

  // All other fields must still be exactly the same as before
  expect(body.firstName).toBe('Tony');
  expect(body.email).toBe(created.email);
  expect(body.department).toBe('Engineering');
  expect(body.id).toBe(created.id);
  expect(body.createdAt).toBe(created.createdAt);
});
```

**Key assertion:** After a PATCH, always assert both the changed field AND the unchanged fields. This confirms the patch did not accidentally overwrite or clear data.

---

### 5.6 DELETE — Remove

**File:** `tests/apitests/empdelete.spec.ts`

```typescript
test('DELETE /employees/:id — removes the employee', async ({ request, authToken }) => {
  // Step 1: Create
  const createResponse = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Temp', lastName: 'Employee', email: `temp.${Date.now()}@company.com`, department: 'Finance', role: 'Analyst' },
  });
  const { id } = await createResponse.json();

  // Step 2: Delete
  const deleteResponse = await request.delete(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  // 204 = success with NO body — do NOT call .json() here
  expect(deleteResponse.status()).toBe(204);

  // Step 3: Verify the record is gone
  const getResponse = await request.get(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(getResponse.status()).toBe(404);
});

// Delete the same resource twice — second attempt must return 404
test('DELETE /employees/:id — 404 on second delete', async ({ request, authToken }) => {
  const createResponse = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'Once', lastName: 'Only', email: `once.${Date.now()}@company.com`, department: 'Marketing', role: 'Designer' },
  });
  const { id } = await createResponse.json();

  await request.delete(`/employees/${id}`, { headers: { Authorization: `Bearer ${authToken}` } });

  const secondDelete = await request.delete(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  expect(secondDelete.status()).toBe(404);
});
```

**Important:** `204 No Content` means the server returns no body. Never call `response.json()` on a 204 — it will fail.

---

## 6. Assertion Patterns

### Status code first

Always assert the status code before asserting the body. If the status is wrong, the body shape will likely be wrong too — asserting status first gives a clearer failure message.

```typescript
expect(response.status()).toBe(201);  // check status
const body = await response.json();  // then parse body
expect(body.id).toBeTruthy();        // then check body fields
```

### Checking body shape

```typescript
// Field exists and is truthy (not null, undefined, 0, or empty string)
expect(body.token).toBeTruthy();

// Exact value match
expect(body.firstName).toBe('Alice');

// Array check
expect(Array.isArray(body)).toBe(true);

// Array length
expect(body).toHaveLength(0);

// Field contains a substring
expect(body.details[0]).toContain('department must be one of');

// Field is a string
expect(typeof body.token).toBe('string');
```

### Asserting error responses

```typescript
expect(response.status()).toBe(400);

const body = await response.json();
expect(body.error).toBe('Validation failed');
expect(body.details).toContain('email is required');
```

### Asserting immutable fields

After a PUT or PATCH, `id` and `createdAt` must never change:

```typescript
expect(body.id).toBe(created.id);
expect(body.createdAt).toBe(created.createdAt);
```

---

## 7. Test Data Strategies

### Use `Date.now()` for unique emails

The server rejects duplicate emails. Using `Date.now()` in the email ensures uniqueness even when tests run in parallel:

```typescript
const uniqueEmail = `alice.smith+${Date.now()}@company.com`;
```

### Create your own test data

Never rely on data that might not exist. Always create the resource first, then operate on it:

```typescript
// Create → then Get/Put/Patch/Delete using the returned ID
const createResponse = await request.post('/employees', { ... });
const { id } = await createResponse.json();

const getResponse = await request.get(`/employees/${id}`, { ... });
```

### Use `params` for query strings

Playwright appends `params` as a query string automatically — you don't need to build the URL manually:

```typescript
// Playwright builds: /employees?department=Engineering
const response = await request.get('/employees', {
  headers: { Authorization: `Bearer ${authToken}` },
  params: { department: 'Engineering' },
});
```

---

## 8. Negative Testing

Negative tests verify the API rejects bad input correctly. They are equally important as happy-path tests.

### Common negative test scenarios

| Scenario | Expected Status |
|----------|----------------|
| Missing required field | `400` |
| Invalid field value (e.g. bad department) | `400` |
| Duplicate email on create | `400` |
| Non-existent resource ID | `404` |
| No auth credentials | `401` |
| Wrong password / invalid key | `401` |
| Expired or malformed token | `401` |
| Wrong token type on a route | `401` |
| Wrong grant type in OAuth | `400` |

### Example — validating the error details array

```typescript
test('POST — returns 400 when email is missing', async ({ request, authToken }) => {
  const response = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: { firstName: 'No', lastName: 'Email', department: 'HR', role: 'Manager' },
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.error).toBe('Validation failed');
  expect(body.details).toContain('email is required');
});
```

### Testing multiple validation errors at once

The server collects all errors and returns them together:

```typescript
test('POST — returns all validation errors at once', async ({ request, authToken }) => {
  const response = await request.post('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
    data: {},  // empty body — all fields missing
  });

  expect(response.status()).toBe(400);

  const body = await response.json();
  expect(body.details.length).toBeGreaterThan(1);  // multiple errors returned
});
```

---

## 9. Test Tags and Filtering

Tags are added to `test.describe` to allow filtering from the command line.

```typescript
test.describe('GET /employees API tests', { tag: ['@api', '@get'] }, () => {
  // ...
});
```

### Running filtered sets

```bash
# All API tests
npx playwright test --grep "@api"

# Only auth tests
npx playwright test --grep "@auth"

# Only GET tests
npx playwright test --grep "@get"

# Only POST tests
npx playwright test --grep "@post"

# Only PUT and PATCH tests
npx playwright test --grep "@put|@patch"

# Basic Auth tests only
npx playwright test --grep "@basicauth"

# API Key tests only
npx playwright test --grep "@apikey"

# OAuth tests only
npx playwright test --grep "@oauth"

# A specific file
npx playwright test tests/apitests/auth.spec.ts
```

### Tag reference

| Tag | File(s) |
|-----|---------|
| `@api` | All API test files |
| `@auth` | `auth.spec.ts` |
| `@post` | `createemployee.spec.ts` |
| `@get` | `getemployees.spec.ts` |
| `@put` | `empputpatch.spec.ts` |
| `@patch` | `empputpatch.spec.ts` |
| `@delete` | `empdelete.spec.ts` |
| `@basicauth` | `basicauth.spec.ts` |
| `@apikey` | `apikey.spec.ts` |
| `@oauth` | `oauth.spec.ts` |

---

## 10. Running Tests

### Start the server first

```bash
node src/server.js
```

### Run all tests

```bash
npx playwright test
```

### Run all API tests

```bash
npx playwright test --grep "@api"
```

### Run a specific file

```bash
npx playwright test tests/apitests/oauth.spec.ts
```

### Run with list reporter (verbose output)

```bash
npx playwright test --grep "@api" --reporter=list
```

### Run in headed mode (shows browser for UI tests)

```bash
npx playwright test --headed
```

### Run with a specific number of workers

```bash
npx playwright test --workers=2
```

---

## Key Concepts Summary

| Concept | What to Remember |
|---------|-----------------|
| `request` fixture | Built-in Playwright HTTP client — no extra library needed |
| `baseURL` in config | Set once; all test paths are relative |
| Worker-scoped fixture | `authToken` is fetched once per worker; much faster than per-test login |
| `await use(value)` | The fixture pattern — setup before, teardown after |
| Assert status before body | Gives clearer failure messages |
| `Date.now()` in emails | Unique email per test run; avoids duplicate-email rejections |
| Create-then-operate | Never hard-code IDs; always create test data then use the returned ID |
| `params` for query strings | Playwright builds the query string automatically |
| `204` has no body | Never call `.json()` on a 204 response |
| PUT vs PATCH | PUT requires all fields; PATCH only changes what you send |
| Token isolation | Tokens for one auth type are rejected on routes for another |
| Negative tests | Test every invalid input and auth failure, not just the happy path |
