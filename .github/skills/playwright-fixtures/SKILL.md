---
name: playwright-fixtures
description: 'Create or extend Playwright test fixtures in this project. Use when: adding a new page object fixture, creating worker-scoped API auth fixtures, wiring up new pages into basetest.ts, setting up auto-running beforeEach navigation, adding shared API request context. Covers basetest.ts UI fixture pattern and apitest.ts worker-scoped auth token pattern. CRITICAL: Tests must only use page object methods, never access underlying page/locator objects directly.'
---

# Playwright Test Fixtures

## CRITICAL FIXTURE USAGE RULE

**Tests must ONLY call page object methods** - never access underlying `page` or create locators:

```typescript
// ✅ CORRECT - page object method calls only
test('good test', async ({ pimPage, addEmployeePage }) => {
    await pimPage.navigateToAddEmployee();        // Page method
    await addEmployeePage.fillEmployeeForm();     // Page method
    await addEmployeePage.saveEmployee();         // Page method
});

// ❌ FORBIDDEN - accessing underlying page object
test('bad test', async ({ pimPage }) => {
    const button = pimPage.page.locator('button'); // NO!
    await button.click();                           // NO!
    
    await pimPage.page.getByRole('button').click(); // NO!
});
```

If tests need new interactions, **add methods to page objects first**.

## When to Use
- Adding a new page class that needs to be injected into tests
- Creating a new API fixture with authentication
- Setting up auto-running navigation or login per test
- Adding worker-scoped shared state (token, DB connection, etc.)

## Two Fixture Files

| File | Purpose | Scope |
|------|---------|-------|
| `fixtures/basetest.ts` | UI test fixtures — page objects | `test` (per test) |
| `fixtures/apitest.ts` | API test fixtures — auth token | `worker` (shared across tests in a worker) |

Tests import `test` from the relevant fixture file, **not** from `@playwright/test` directly.

---

## UI Fixture: `fixtures/basetest.ts`

### How to Add a New Page Fixture

**Step 1** — Import the page class:
```typescript
import { MyNewPage } from '@pages/MyNewPage';
```

**Step 2** — Declare the fixture type in the `extend<>` generic:
```typescript
export const test = baseTest.extend<{
    basePage: BasePage;
    loginPage: LoginPage;
    myNewPage: MyNewPage;   // ← add here
    // ...
}, { forEachWorker: void; }>({
```

**Step 3** — Add the fixture implementation:
```typescript
myNewPage: async ({ page }, use) => {
    const myNewPage = new MyNewPage(page);
    await use(myNewPage);
},
```

### Full `basetest.ts` Pattern

```typescript
import { test as baseTest } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';

export const test = baseTest.extend<{
    basePage: BasePage;
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    forEachTest: void;      // auto fixture trigger type
}, {
    forEachWorker: void;    // worker-scoped trigger type
}>({
    // Page-scoped fixtures — new instance per test
    basePage: async ({ page }, use) => {
        await use(new BasePage(page));
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    // Auto fixture — runs for every test automatically
    forEachTest: [async ({ page }, use) => {
        const basePage = new BasePage(page);
        await basePage.navigateTo('/');   // navigate to base URL before each test
        await use();
    }, { scope: 'test', auto: true }],

    // Worker fixture — runs once per worker
    forEachWorker: [async ({ }, use) => {
        console.log('Worker started');
        await use();
        console.log('Worker finished');
    }, { scope: 'worker', auto: true }],
});

export { expect } from '@playwright/test';
```

### Auto Fixture Rules
- `auto: true` means it runs **without being listed** in the test's parameter list
- Use `forEachTest` for navigation/setup that every test needs
- Use `forEachWorker` for one-time setup (DB seed, server start, etc.)
- Declare trigger fixtures as `void` type — they have no return value

---

## API Fixture: `fixtures/apitest.ts`

### Worker-Scoped Auth Token Pattern

The token is fetched **once per worker** and shared across all tests in that worker — avoids a login call before every test.

```typescript
import { test as baseTest, APIRequestContext } from '@playwright/test';

export const test = baseTest.extend<{}, { authToken: string }>({
    authToken: [
        async ({ playwright }, use) => {
            const request: APIRequestContext = await playwright.request.newContext({
                baseURL: process.env.BASE_URL || 'http://localhost:3000/',
            });

            const response = await request.post('/auth/login', {
                data: { username: 'admin_user', password: 'admin_pass' },
            });

            const { token } = await response.json();
            await request.dispose();  // clean up after getting token

            await use(token);         // token is now available to all tests
        },
        { scope: 'worker' },          // ← worker scope: shared, not per-test
    ],
});

export { expect } from '@playwright/test';
```

### Using the API Fixture in Tests

```typescript
import { test, expect } from '../../fixtures/apitest';

test('GET /employees', async ({ request, authToken }) => {
    const response = await request.get('/employees', {
        headers: {
            Authorization: `Bearer ${authToken}`,
        },
    });
    expect(response.status()).toBe(200);
});
```

---

## Fixture Scope Reference

| Scope | Lifecycle | Use For |
|-------|-----------|---------|
| `'test'` (default) | New instance per test | Page objects, isolated state |
| `'worker'` | Shared across tests in a worker | Auth tokens, DB connections |

## Rules

- Always use `{ scope: 'worker' }` for expensive setup (auth, DB) to avoid repeating it per test
- Always `dispose()` request contexts after extracting data in worker fixtures
- `auto: true` fixtures must be `void` typed — they cannot pass values to tests
- Read `BASE_URL` from `process.env.BASE_URL` in API fixtures — never hardcode URLs
- Export `expect` from fixture files so tests only need one import
