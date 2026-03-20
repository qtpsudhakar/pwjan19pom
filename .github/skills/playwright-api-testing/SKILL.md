---
name: playwright-api-testing
description: 'Write or extend Playwright API tests in this project. Use when: creating REST API tests, testing POST/GET/PUT/PATCH/DELETE endpoints, validating response status and body, using Bearer token auth, testing error responses (400/401/404), generating unique test data for API calls. All API tests live in tests/apitests/ and use fixtures/apitest.ts.'
---

# Playwright API Testing

## When to Use
- Writing a new API test for any REST endpoint
- Testing authentication flows (Bearer token, API key, OAuth)
- Validating response status codes and response body fields
- Testing error/validation scenarios (400, 401, 404, 422)

## Project Structure

```
tests/apitests/
  createemployee.spec.ts    ← POST tests
  getemployees.spec.ts      ← GET tests
  empputpatch.spec.ts       ← PUT/PATCH tests
  empdelete.spec.ts         ← DELETE tests
  auth.spec.ts              ← Auth flow tests
  apikey.spec.ts            ← API key tests
  basicauth.spec.ts         ← Basic auth tests
  hmac.spec.ts              ← HMAC signing tests
  oauth.spec.ts             ← OAuth tests
  session.spec.ts           ← Session cookie tests

fixtures/
  apitest.ts                ← Worker-scoped auth token fixture
```

## Always Import From apitest Fixture

```typescript
// ✅ Correct — use project fixture, gets authToken injected
import { test, expect } from '../../fixtures/apitest';

// ❌ Wrong — misses authToken, misses worker-scoped optimization
import { test, expect } from '@playwright/test';
```

---

## API Test File Template

```typescript
import { test, expect } from '../../fixtures/apitest';

test.describe('Resource API — Verb Description', { tag: ['@api', '@post'] }, () => {

    test('POST /resource — success case description', async ({ request, authToken }) => {
        // Generate unique data to avoid conflicts between test runs
        const uniqueEmail = `user+${Date.now()}@company.com`;

        const response = await request.post('/resource', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                field1: 'value1',
                email: uniqueEmail,
            },
        });

        // Assert status FIRST — if this fails, body assertions are skipped (avoid confusing errors)
        expect(response.status()).toBe(201);

        const body = await response.json();

        // Assert server-generated fields exist
        expect(body.id).toBeTruthy();
        expect(body.createdAt).toBeTruthy();

        // Assert sent data is echoed back correctly
        expect(body.field1).toBe('value1');
        expect(body.email).toBe(uniqueEmail);
    });

    test('POST /resource — returns 400 when required field is missing', async ({ request, authToken }) => {
        const response = await request.post('/resource', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            data: {
                // intentionally omit required field
            },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBeTruthy();  // error field must be present
    });
});
```

---

## HTTP Method Patterns

### GET
```typescript
const response = await request.get('/employees', {
    headers: { Authorization: `Bearer ${authToken}` },
});
expect(response.status()).toBe(200);
const body = await response.json();
expect(Array.isArray(body)).toBeTruthy();
```

### POST
```typescript
const response = await request.post('/employees', {
    headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
    },
    data: { firstName: 'John', lastName: 'Doe', email: `john+${Date.now()}@co.com` },
});
expect(response.status()).toBe(201);
```

### PUT / PATCH
```typescript
const response = await request.put(`/employees/${id}`, {
    headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
    },
    data: { firstName: 'Updated' },
});
expect(response.status()).toBe(200);
```

### DELETE
```typescript
const response = await request.delete(`/employees/${id}`, {
    headers: { Authorization: `Bearer ${authToken}` },
});
expect(response.status()).toBe(204);
```

---

## Assertion Order Rule

**Always assert status code before body fields.** If the status assertion fails, Playwright marks the test failed immediately with a clear message. If status passes but you parse an error body as success body, you get confusing field-not-found errors.

```typescript
// ✅ Correct order
expect(response.status()).toBe(201);
const body = await response.json();
expect(body.id).toBeTruthy();

// ❌ Wrong — parsing body before checking status
const body = await response.json();  // body may be error shape!
expect(body.id).toBeTruthy();
expect(response.status()).toBe(201);
```

---

## Unique Test Data

For POST tests, generate unique values to avoid duplicate-key errors across runs:

```typescript
// Email
const email = `user+${Date.now()}@company.com`;

// Username
const username = `testuser_${Date.now()}`;

// ID / reference number
const refNumber = `REF-${Date.now()}`;
```

---

## Tagging Conventions for API Tests

```typescript
test.describe('...', { tag: ['@api', '@post'] }, () => { ... });   // POST suite
test.describe('...', { tag: ['@api', '@get'] }, () => { ... });    // GET suite
test.describe('...', { tag: ['@api', '@auth'] }, () => { ... });   // Auth suite
```

Run only API tests:
```bash
npx playwright test --grep @api
```

---

## Auth Variants

| File | Auth Type | Header Pattern |
|------|-----------|----------------|
| `auth.spec.ts` | Bearer JWT | `Authorization: Bearer ${token}` |
| `apikey.spec.ts` | API Key | `X-API-Key: ${key}` |
| `basicauth.spec.ts` | Basic Auth | `Authorization: Basic ${btoa('user:pass')}` |
| `hmac.spec.ts` | HMAC signature | Custom `X-Signature` header |
| `oauth.spec.ts` | OAuth2 token | `Authorization: Bearer ${oauthToken}` |
| `session.spec.ts` | Cookie session | Cookie header from login response |

## Base URL

Base URL is set in `playwright.config.ts` and read from environment:
```
process.env.BASE_URL || 'http://localhost:3000/'
```

Never hardcode the base URL in test files — it is applied automatically to all `request.*` calls.
