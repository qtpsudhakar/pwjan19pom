---
name: playwright-helpers
description: 'Add or use helper methods from WebHelpers and AssertHelpers in this project. Use when: adding a new web interaction wrapper (click, fill, select, wait), adding a new assertion helper, using helpers inside page methods, handling locator errors with logging. Covers try-catch-rethrow pattern, locator.description() logging, AssertHelpers assertion library. CRITICAL: Helpers are ONLY for use inside page object methods, never directly in tests.'
---

# Playwright Helpers

## When to Use
- Adding a new action wrapper to `utils/webHelpers.ts`
- Adding a new assertion to `utils/assertHelpers.ts`
- Understanding which helper method to call inside a page action

## CRITICAL USAGE RULE

**WebHelpers and AssertHelpers are ONLY for use inside page object methods** - never use directly in tests:

```typescript
// ✅ CORRECT - helpers used inside page methods
export class PIMPage extends BasePage {
    async clickSaveButton(): Promise<void> {
        await this.webHelpers.clickElement(this.saveButton); // ✅ Inside page method
    }
}

// Test uses page method only
test('correct usage', async ({ pimPage }) => {
    await pimPage.clickSaveButton(); // ✅ Page method call
});

// ❌ FORBIDDEN - helpers in tests
test('bad test', async ({ pimPage }) => {
    const locator = pimPage.page.locator('button'); // NO!
    await pimPage.webHelpers.clickElement(locator);  // NO!
});
```

**Tests must only call page methods** - all helper usage belongs inside page objects.

## Two Helper Classes

| Class | File | Purpose |
|-------|------|---------|
| `WebHelpers` | `utils/webHelpers.ts` | Wrap Playwright actions with error handling and logging |
| `AssertHelpers` | `utils/assertHelpers.ts` | Wrap `expect()` assertions with success logging |

Both are auto-initialized in every page class via `BasePage`:
```typescript
this.webHelpers    // available in all page classes
this.assertHelpers // available in all page classes
```

---

## WebHelpers — Action Wrappers

### Existing Methods

| Method | Use For |
|--------|---------|
| `enterText(locator, value)` | Fill/clear an input (handles strict mode) |
| `clickElement(locator)` | Click any element |
| `selectOptionByText(locator, optionText)` | Select a dropdown option by visible label |

### Method Pattern (copy for new methods)

Every WebHelpers method follows this exact pattern:

```typescript
async methodName(locator: Locator, ...args): Promise<void> {
    try {
        // Playwright action here
        await locator.someAction();
        console.log(`Action succeeded on ${locator.description()}`);
    } catch (error: any) {
        console.error(`Error on ${locator.description()}: ${error.message}`);
        throw error;  // always rethrow — let the test/caller decide how to handle
    }
}
```

### Adding a New WebHelper Method

Example — `waitForElement`:
```typescript
async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    try {
        await locator.waitFor({ state: 'visible', timeout });
        console.log(`Element visible: ${locator.description()}`);
    } catch (error: any) {
        console.error(`Timeout waiting for ${locator.description()}: ${error.message}`);
        throw error;
    }
}
```

Example — `getTextContent`:
```typescript
async getTextContent(locator: Locator): Promise<string> {
    try {
        const text = await locator.innerText();
        console.log(`Got text "${text}" from ${locator.description()}`);
        return text;
    } catch (error: any) {
        console.error(`Error getting text from ${locator.description()}: ${error.message}`);
        throw error;
    }
}
```

### Key Rules for WebHelpers
- Always `clear()` before `fill()` in text input methods (avoids appending)
- Always use `locator.description()` in log messages — never hardcode element names
- Always `throw error` in the `catch` block — never silently swallow errors
- `finally` block is optional — use only for cleanup (e.g., closing modals)

---

## AssertHelpers — Assertion Wrappers

### Existing Methods

**Visibility**
```typescript
assertVisible(locator)              // expect(locator).toBeVisible()
assertHidden(locator)               // expect(locator).toBeHidden()
assertAllVisible(...locators)       // all locators visible in parallel
assertAllHidden(...locators)        // all locators hidden in parallel
assertTextVisible(expectedText)     // text visible anywhere on page
```

**Text Content**
```typescript
assertText(locator, expectedText)         // exact text match
assertContainsText(locator, substring)    // partial text match
```

**Form Fields**
```typescript
assertFieldValue(fieldLocator, expectedValue)  // input has value
assertFieldEmpty(fieldLocator)                 // input is empty
```

### Assertion Method Pattern (copy for new methods)

```typescript
async assertSomething(locator: Locator, ...args): Promise<void> {
    await expect(locator).toSomePlaywrightMatcher(...args);
    console.log(`Assertion passed: ${locator.description()} [description of what passed]`);
}
```

### Adding a New AssertHelper Method

Example — `assertEnabled`:
```typescript
async assertEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
    console.log(`Assertion passed: ${locator.description()} is enabled`);
}
```

Example — `assertCount`:
```typescript
async assertCount(locator: Locator, expectedCount: number): Promise<void> {
    await expect(locator).toHaveCount(expectedCount);
    console.log(`Assertion passed: ${locator.description()} has count ${expectedCount}`);
}
```

### Key Rules for AssertHelpers
- Always log **after** the assertion succeeds — if it fails, Playwright throws before the log
- Include `locator.description()` in the success message
- Use `Promise.all` for bulk assertions (see `assertAllVisible`) — runs checks in parallel
- No try-catch in assertions — let Playwright's built-in error messages surface naturally

---

## Using Helpers in Page Methods

```typescript
// In any page class (has access to this.webHelpers and this.assertHelpers)

async fillAndSubmitForm(name: string, email: string): Promise<void> {
    await this.webHelpers.enterText(this.nameInput, name);
    await this.webHelpers.enterText(this.emailInput, email);
    await this.webHelpers.clickElement(this.submitButton);
}

async verifyFormReset(): Promise<void> {
    await this.assertHelpers.assertFieldEmpty(this.nameInput);
    await this.assertHelpers.assertFieldEmpty(this.emailInput);
}
```

## Do NOT

- Call `locator.click()` directly in page methods — use `this.webHelpers.clickElement(locator)`
- Call `expect(locator).toBeVisible()` directly in page methods — use `this.assertHelpers.assertVisible(locator)`
- Catch errors in page methods without rethrowing — always propagate to the test
