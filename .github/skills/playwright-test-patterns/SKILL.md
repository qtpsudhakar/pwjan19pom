---
name: playwright-test-patterns
description: 'Write Playwright UI spec files in this project. Use when: creating a new spec file, adding test.describe blocks, writing beforeEach/afterEach hooks, adding tags and annotations, writing data-driven tests from JSON, using test.info() for retry/status detection, structuring login-before-each patterns. Covers addemployee.spec.ts and addemployeeDataDriver.spec.ts patterns.'
---

# Playwright Test Patterns

## When to Use
- Writing a new `.spec.ts` file for a UI feature
- Adding lifecycle hooks (`beforeEach`, `afterEach`, `beforeAll`, `afterAll`)
- Creating data-driven tests from JSON test data
- Using tags to group tests for selective runs
- Adding annotations like issue ID or test ID to a test

## Project Structure

```
tests/
  login.spec.ts                  ← Auth tests (@smoke @login @ci)
  addemployee.spec.ts            ← CRUD UI tests (@smoke @employee @ci)
  addemployeeDataDriver.spec.ts  ← Data-driven tests (JSON-driven)
  advanced.spec.ts               ← Advanced interaction tests
  apitests/                      ← API tests (separate fixture)
test-data/
  employeeData.json              ← JSON data for data-driven tests
  users.json                     ← User credential data
```

---

## CRITICAL TEST WRITING RULES

### FORBIDDEN IN TESTS
**NEVER use locators directly in test files:**

```typescript
// ❌ FORBIDDEN - locators in tests
test('bad test', async ({ page, pimPage }) => {
    const button = page.getByRole('button', { name: 'Save' }); // NO!
    await button.click();
    
    const firstRow = pimPage.page.locator('.table-row').first(); // NO!
    await firstRow.click();
});

// ✅ REQUIRED - only page method calls
test('good test', async ({ pimPage }) => {
    await pimPage.clickSaveButton();      // Page method
    await pimPage.clickFirstEmployee();   // Page method
});
```

**Tests must only contain:**
- Page method calls (e.g., `await pimPage.searchEmployee(name)`)
- Basic assertions using page methods (e.g., `await pimPage.verifyResultsDisplayed()`)
- Test data setup/teardown
- No `page.locator()`, `page.getByRole()`, `page.click()`, etc.

## Spec File Template

```typescript
import { test } from '../fixtures/basetest';   // always use project fixture, not @playwright/test
import { expect } from '@playwright/test';

test.describe('Feature Name Tests', { tag: ['@smoke', '@featuretag', '@ci'] }, () => {

    // Runs once before all tests in this describe block
    test.beforeAll(async () => {
        console.log('Suite setup');
    });

    // Runs once after all tests in this describe block
    test.afterAll(async () => {
        console.log('Suite teardown');
    });

    // Runs before EACH test — use for login + navigation
    test.beforeEach(async ({ basePage, loginPage }) => {
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
    });

    // Runs after EACH test — use for cleanup + flakiness detection
    test.afterEach(async ({ basePage }) => {
        console.log(test.info().title);
        await basePage.closeBrowser();

        // Detect flaky tests via retry info
        const { retry, status, title } = test.info();
        if (retry > 0 && status === 'passed') {
            console.warn(`⚠️ FLAKY TEST: "${title}" passed on retry ${retry}`);
        }
        if (retry > 0 && status === 'failed') {
            console.error(`❌ PERSISTENT FAILURE: "${title}" still failing on retry ${retry}`);
        }
    });

    test('Does something successfully',
        {
            tag: ['@smoke', '@featuretag'],
            annotation: [
                { type: 'issue', description: 'JIRA-123' },
                { type: 'testId', description: 'TC-001' }
            ]
        },
        async ({ basePage, loginPage, dashboardPage }) => {
            // ✅ ONLY page method calls allowed in tests
            await dashboardPage.verifyDashboardPageExists();
            await dashboardPage.navigateToFeature();
            await featurePage.performAction();
            await featurePage.verifySuccess();
        }
    );
});
```

---

## Import Rule

**Always import `test` from the project fixture file**, not from `@playwright/test`:

```typescript
// ✅ Correct — gets all project fixtures (page objects) injected
import { test } from '../fixtures/basetest';

// ❌ Wrong — no page object fixtures available
import { test } from '@playwright/test';
```

---

## Test Structure Enforcement

**Tests must be high-level and readable:**

```typescript
// ✅ GOOD - Clear, readable, no technical details
test('Add new employee with valid data', async ({ dashboardPage, pimPage, addEmployeePage }) => {
    await dashboardPage.navigateToEmployeeManagement();
    await pimPage.clickAddEmployee();
    await addEmployeePage.fillEmployeeDetails('John', 'Doe');
    await addEmployeePage.saveEmployee();
    await addEmployeePage.verifySuccessMessage();
});

// ❌ BAD - Technical implementation details exposed
test('Add employee bad example', async ({ page, pimPage }) => {
    const addButton = page.locator('[data-testid="add-btn"]'); // NO LOCATORS!
    await addButton.click();
    const nameField = page.getByRole('textbox', { name: 'Name' }); // NO LOCATORS!
    await nameField.fill('John');
});
```

If a test needs specific element interaction, **create a page method first:**

1. Add method to appropriate page object
2. Use the method in test
3. Never create locators in test files

---

## Tagging Conventions

Tags are defined at `test.describe` level and/or individual `test` level:

| Tag | Meaning |
|-----|---------|
| `@smoke` | Critical path, always run on CI |
| `@ci` | Must pass in CI pipeline |
| `@login` | Login-related tests |
| `@employee` | Employee CRUD tests |
| `@api` | API tests (apitests/ folder) |

**Run by tag:**
```bash
npx playwright test --grep @smoke
npx playwright test --grep "@smoke and @employee"
npx playwright test --grep-invert @ci   # exclude CI tests
```

---

## Annotations

Attach metadata to individual tests for reporting (Allure, ReportPortal, etc.):

```typescript
test('Test name', {
    tag: ['@smoke'],
    annotation: [
        { type: 'issue',      description: 'JIRA-456' },
        { type: 'testId',     description: 'TC-042' },
        { type: 'owner',      description: 'QA Team' },
        { type: 'priority',   description: 'P1' },
    ]
}, async ({ ... }) => { ... });
```

---

## Data-Driven Tests (JSON)

Read test data from `test-data/*.json` and generate one `test()` per record:

```typescript
import { test } from '../fixtures/basetest';
import * as data from '../test-data/employeeData.json';

// employeeData.json shape: { "employees": [ { "firstName": "...", "lastName": "..." } ] }

test.describe('Data-Driven Employee Tests', () => {

    test.afterEach(async ({ basePage }) => {
        await basePage.closeBrowser();
    });

    // Creates one test per employee record
    data.employees.forEach(employee => {
        test(
            `Add Employee: ${employee.firstName} ${employee.lastName}`,
            { tag: ['@smoke', '@employee'] },
            async ({ basePage, loginPage, dashboardPage, employeeListPage, addEmployeePage }) => {
                await dashboardPage.verifyDashboardPageExists();
                await dashboardPage.navigateToEmployeeList();
                await employeeListPage.navigateToAddEmployee();
                await addEmployeePage.addEmployee(employee.firstName, employee.lastName);
                await addEmployeePage.verifySuccessMessage('Successfully Saved');
            }
        );
    });
});
```

**JSON data file** (`test-data/employeeData.json`):
```json
{
  "employees": [
    { "firstName": "Alice", "lastName": "Smith" },
    { "firstName": "Bob",   "lastName": "Jones" }
  ]
}
```

---

## Lifecycle Hook Reference

| Hook | Scope | Use For |
|------|-------|---------|
| `test.beforeAll` | All tests in describe | Suite-level setup (seed DB, start server) |
| `test.afterAll` | All tests in describe | Suite-level teardown (clean DB) |
| `test.beforeEach` | Each test | Login, navigation, reset state |
| `test.afterEach` | Each test | Close browser, log flakiness, cleanup |

### Login in beforeEach Pattern

```typescript
test.beforeEach(async ({ basePage, loginPage }) => {
    await basePage.navigateTo('/');
    await loginPage.login('testadmin', 'Vibetestq@123');
});
```

All tests in the describe block then start already authenticated. Individual tests do NOT need to call `navigateTo` or `login`.

---

## Serial vs Parallel Execution

By default tests run in parallel across workers. For tests with dependencies:

```typescript
// Force sequential execution within a describe block
test.describe.configure({ mode: 'serial' });

test.describe('Sequential Feature Tests', () => {
    // tests run in order, second test doesn't start until first finishes
});
```

---

## Retry and Flakiness Detection

`test.info()` exposes runtime metadata inside hooks and tests:

```typescript
const info = test.info();
info.retry      // 0 = first run, 1+ = retry number
info.status     // 'passed' | 'failed' | 'timedOut' | 'skipped'
info.title      // test title string
info.annotations // array of annotation objects
```

Use in `afterEach` to log flaky tests:
```typescript
test.afterEach(async () => {
    const { retry, status, title } = test.info();
    if (retry > 0 && status === 'passed') console.warn(`⚠️ FLAKY: "${title}" on retry ${retry}`);
    if (retry > 0 && status === 'failed') console.error(`❌ FAILING: "${title}" retry ${retry}`);
});
```

---

## File Naming and Location

| Test type | Location | Import fixture from |
|-----------|----------|---------------------|
| UI tests | `tests/*.spec.ts` | `../fixtures/basetest` |
| API tests | `tests/apitests/*.spec.ts` | `../../fixtures/apitest` |
