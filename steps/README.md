# Login Steps Documentation

This directory contains the step definitions for the Cucumber BDD tests, specifically for the login feature.

## Files Created

### 1. `login.steps.ts`
- Contains all step definitions for the login feature
- Maps Gherkin steps to Playwright page object method calls
- Uses the same page objects as your existing Playwright tests

### 2. `world.ts`
- Sets up the Cucumber world context with Playwright browser integration
- Initializes all page objects (basePage, loginPage, dashboardPage, etc.)
- Provides browser lifecycle management

### 3. `hooks.ts`
- Contains Before/After scenario hooks
- Handles browser initialization and cleanup
- Ensures clean state between test scenarios

### 4. `index.ts`
- Entry point that imports all step definitions
- Exports the world for test runners

### 5. `cucumber.js`
- Configuration file for Cucumber test execution
- Specifies feature file locations, step definition paths, and output formats

## Step Definitions Mapping

| Gherkin Step | Method Called | Page Object |
|--------------|---------------|-------------|
| `Given I navigate to the login page` | `navigateTo('/')` | basePage |
| `When I login with valid credentials "x" and "y"` | `login(username, password)` | loginPage |
| `When I login with invalid credentials "x" and "y"` | `login(username, password)` | loginPage |
| `Then I should see the dashboard page exists` | `verifyDashboardPageExists()` | dashboardPage |
| `Then I should see an error message for invalid credentials` | `getErrorMessage()` | loginPage |

## Usage

1. **Install Cucumber dependencies** (if not already installed):
   ```bash
   npm install @cucumber/cucumber @cucumber/pretty-formatter ts-node --save-dev
   ```

2. **Add script to package.json**:
   ```json
   {
     "scripts": {
       "test:bdd": "cucumber-js",
       "test:bdd:login": "cucumber-js --tags '@login'"
     }
   }
   ```

3. **Run the tests**:
   ```bash
   npm run test:bdd:login
   ```

## Integration with Existing Page Objects

The step definitions use your existing page object methods:
- **BasePage**: `navigateTo('/')`
- **LoginPage**: `login(username, password)`, `getErrorMessage()`
- **DashboardPage**: `verifyDashboardPageExists()`

## Note about Error Message Verification

The `getErrorMessage()` method in LoginPage might need to be implemented if it doesn't exist yet. The original Playwright test had this verification commented out, suggesting it may need implementation in the LoginPage class.

## Browser Configuration

The browser is configured to run in non-headless mode by default. You can modify this in `world.ts`:
```typescript
this.browser = await chromium.launch({ headless: true }); // For headless mode
```