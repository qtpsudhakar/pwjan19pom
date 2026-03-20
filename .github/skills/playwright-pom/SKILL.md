---
name: playwright-pom
description: 'Create or extend Playwright Page Object Model classes in this project. Use when: adding a new page object, creating page locators, adding page actions, extending BasePage, writing page methods that wrap locator interactions. Covers BasePage inheritance, locator .describe() pattern, WebHelpers/AssertHelpers composition, TypeScript path aliases.'
---

# Playwright Page Object Model (POM)

## When to Use
- Creating a new page class (e.g., `ProfilePage.ts`)
- Adding locators or action methods to an existing page
- Extending `BasePage` for a new section of the app
- Wrapping UI interactions into reusable page methods

## Project Structure

```
pages/
  BasePage.ts           ← Base class: page, webHelpers, assertHelpers
  LoginPage.ts          ← Auth page
  DashboardPage.ts      ← Post-login landing
  EmployeeListPage.ts   ← List/search page
  AddEmployeePage.ts    ← Form page
  index.ts              ← Re-exports all pages
utils/
  webHelpers.ts         ← Action wrappers (click, fill, select)
  assertHelpers.ts      ← Assertion wrappers (visible, text, value)
```

## TypeScript Path Aliases (tsconfig.json)

Always use these aliases — never use relative `../../` imports:

```typescript
import { BasePage }      from '@pages/BasePage';
import { WebHelpers }    from '@utils/webHelpers';
import { AssertHelpers } from '@utils/assertHelpers';
```

## BasePage Contract

Every page class MUST extend `BasePage`. It provides three protected properties automatically initialized in its constructor:

```typescript
protected page: Page;
protected webHelpers: WebHelpers;
protected assertHelpers: AssertHelpers;
```

`BasePage` built-in methods:
- `navigateTo(url)` — `page.goto(url)`
- `getPageTitle()` — returns `page.title()`
- `waitForPageLoad()` — waits for `'load'` state
- `closeBrowser()` — closes the page

## Page Class Template

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class ExamplePage extends BasePage {
    // Step 1 — declare all locators as private readonly
    private readonly saveButton: Locator;
    private readonly nameInput: Locator;

    constructor(page: Page) {
        super(page); // Required: initializes this.page, this.webHelpers, this.assertHelpers

        // Step 2 — prefer getByRole; always call .describe() with a human label
        this.saveButton = this.page
            .getByRole('button', { name: 'Save' })
            .describe('Save button');

        this.nameInput = this.page
            .getByRole('textbox', { name: 'Name' })
            .describe('Name input field');
    }

    // Step 3 — one public method per user action; delegate to helpers
    async enterName(name: string): Promise<void> {
        await this.webHelpers.enterText(this.nameInput, name);
    }

    async clickSave(): Promise<void> {
        await this.webHelpers.clickElement(this.saveButton);
    }

    // Step 4 — composite action methods for common flows
    async saveName(name: string): Promise<void> {
        await this.enterName(name);
        await this.clickSave();
    }

    // Step 5 — verification methods using assertHelpers
    async verifySaveSuccess(expectedMessage: string): Promise<void> {
        await this.assertHelpers.assertTextVisible(expectedMessage);
    }
}
```

## Locator Strategy (Priority Order)

1. **Role-based** (preferred): `getByRole('button', { name: 'Submit' })`
2. **Label-based**: `getByLabel('Email address')`
3. **Text-based**: `getByText('Dashboard')`
4. **Test ID**: `getByTestId('submit-btn')`
5. **XPath** (last resort): `locator("//label[text()='Id']/../..//input")`

**Always call `.describe('...')` on every locator** — used in WebHelpers error/success logging.

## Composite Locators (OR pattern)

```typescript
// When element may have different names/roles across environments:
this.signInButton = this.page
    .getByRole('button', { name: 'Sign In' })
    .or(this.page.getByRole('button', { name: 'Submit' }))
    .describe('Sign In / Submit button');
```

## Verification Method Patterns

Use `assertHelpers` for all assertions inside page methods:

```typescript
// Visibility
await this.assertHelpers.assertVisible(this.header);

// Text content
await this.assertHelpers.assertText(this.header, 'Dashboard');
await this.assertHelpers.assertContainsText(this.header, 'Dash');

// Form fields
await this.assertHelpers.assertFieldValue(this.nameInput, 'John');
await this.assertHelpers.assertFieldEmpty(this.nameInput);

// Page-level text (no locator needed)
await this.assertHelpers.assertTextVisible('Successfully Saved');
```

## CRITICAL PRINCIPLE: ACTION + VERIFICATION

**Every action must be followed by verification** to ensure it completed successfully. Actions without verification can lead to flaky tests.

### Examples of Incomplete Methods (❌ BAD):

```typescript
// ❌ BAD - action without verification
async navigateToAllTabs(): Promise<void> {
    await this.clickPersonalDetailsTab();
    await this.clickContactDetailsTab();
    await this.clickJobTab();
    // No verification that navigation succeeded!
}

async selectDropdownOption(value: string): Promise<void> {
    await this.webHelpers.selectOptionByText(this.dropdown, value);
    // No verification that option was actually selected!
}
```

### Correct Pattern (✅ GOOD):

```typescript
// ✅ GOOD - action + verification
async navigateToAllTabsWithVerification(): Promise<void> {
    await this.clickPersonalDetailsTab();
    await this.verifyPersonalDetailsTabActive();
    
    await this.clickContactDetailsTab();
    await this.verifyContactDetailsTabActive();
    
    await this.clickJobTab();
    await this.verifyJobTabActive();
}

async selectDropdownOptionWithVerification(value: string): Promise<void> {
    await this.webHelpers.selectOptionByText(this.dropdown, value);
    await this.assertHelpers.assertFieldValue(this.dropdown, value); // Verify selection
}

// Individual tab verification methods
async verifyPersonalDetailsTabActive(): Promise<void> {
    await this.assertHelpers.assertVisible(this.personalDetailsContent);
    // Or check if tab has 'active' class/attribute
}
```

### When to Add Verification:

- **Navigation actions**: Verify page/section loaded correctly
- **Form interactions**: Verify field values were set
- **Dropdown selections**: Verify option was selected  
- **Button clicks**: Verify expected result occurred (modal opened, form submitted, etc.)
- **Tab switching**: Verify tab became active and content is visible

### Action-Verification Method Patterns:

```typescript
// Pattern 1: Combined action + verification method
async fillAndVerifyEmployeeName(name: string): Promise<void> {
    await this.webHelpers.enterText(this.nameInput, name);
    await this.assertHelpers.assertFieldValue(this.nameInput, name);
}

// Pattern 2: Separate action and verification methods  
async clickSaveButton(): Promise<void> {
    await this.webHelpers.clickElement(this.saveButton);
}

async verifySaveSuccess(): Promise<void> {
    await this.assertHelpers.assertTextVisible('Successfully Saved');
    await this.assertHelpers.assertHidden(this.saveButton); // Button disabled after save
}

// Pattern 3: Composite flow with intermediate verifications
async completeEmployeeForm(firstName: string, lastName: string): Promise<void> {
    await this.fillAndVerifyEmployeeName(firstName);
    await this.fillAndVerifyEmployeeLastName(lastName);
    await this.clickSaveButton();
    await this.verifySaveSuccess();
}
```

## CRITICAL RULES

### NO LOCATORS IN TESTS
**NEVER create locators directly in test files.** Tests must only call page methods. All locator interactions belong in page objects.

```typescript
// ❌ WRONG - locators in test
test('bad example', async ({ page, pimPage }) => {
    const firstRow = page.locator('.table-row').first(); // FORBIDDEN!
    await firstRow.click();
});

// ✅ CORRECT - only page method calls in test
test('good example', async ({ pimPage }) => {
    await pimPage.clickFirstEmployee(); // Page method handles all locators
});
```

If test needs to interact with elements, create page methods:

```typescript
// In PIMPage.ts
async clickFirstEmployee(): Promise<void> {
    const firstRow = this.page.locator('.oxd-table-body .oxd-table-row').first().describe('First employee row');
    await this.webHelpers.clickElement(firstRow);
}

async selectEmployeeByIndex(index: number): Promise<void> {
    const employeeRow = this.page.locator('.oxd-table-body .oxd-table-row').nth(index).describe(`Employee row ${index}`);
    await this.webHelpers.clickElement(employeeRow);
}
```

### Page Object Rules
- All locators: `private readonly` in class body, initialized in constructor
- Never use `page.locator` in action methods — locators belong in constructor only
- Tests call page methods ONLY — no `page.locator()`, `page.getByRole()`, etc. in tests
- All public methods return `Promise<void>` unless returning data
- Log messages are handled inside `webHelpers` and `assertHelpers` — no extra `console.log` in action methods
- Register new pages in `pages/index.ts` after creating them:
  ```typescript
  export { ExamplePage } from './ExamplePage';
  ```
- Register new page fixtures in `fixtures/basetest.ts` after creating the page class
