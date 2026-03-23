# Cucumber + Playwright: Three Different Approaches

This project provides three different approaches for writing Cucumber step definitions with Playwright:

## 🏗️ Approach 1: With Page Object Model (POM)

### Files:
- `steps/world.ts` - World setup with page object instances
- `steps/login-pom.steps.ts` - Step definitions using page objects
- `pages/*.ts` - Page object classes

### Configuration in `cucumber.js`:
```javascript
require: ['steps/login-pom.steps.ts', 'steps/world.ts'],
```

### World Setup (`world.ts`):
```typescript
// Enable this line when using POM approach
setWorldConstructor(CustomPlaywrightWorld);
```

### Step Definition Example:
```typescript
When('I login with valid credentials {string} and {string}', async function (this: CustomPlaywrightWorld, username: string, password: string) {
    // Uses page object methods
    await this.loginPage!.enterUsername(username);
    await this.loginPage!.enterPassword(password);
    await this.loginPage!.clickLogin();
});
```

### Benefits:
- ✅ Best maintainability and scalability
- ✅ Reusable page methods across tests
- ✅ Clean separation of concerns
- ✅ Professional test automation approach
- ✅ Follows industry best practices

---

## 🎯 Approach 2: Direct Playwright with World (Simple World)

### Files:
- `steps/simpleWorld.ts` - Basic world setup without page objects
- `steps/login-simple.steps.ts` - Step definitions with direct Playwright calls using world

### Configuration in `cucumber.js`:
```javascript
require: ['steps/login-simple.steps.ts', 'steps/simpleWorld.ts'],
```

### World Setup (`simpleWorld.ts`):
```typescript
// Enable this line when using Simple approach
setWorldConstructor(SimplePlaywrightWorld);
```

### Step Definition Example:
```typescript
When('I login with valid credentials {string} and {string}', async function (this: SimplePlaywrightWorld, username: string, password: string) {
    // Direct Playwright API calls with world context
    await this.page!.fill('input[name="username"]', username);
    await this.page!.fill('input[name="password"]', password);
    await this.page!.click('button[type="submit"]');
});
```

### Benefits:
- ✅ Structured world management
- ✅ Better than basic approach
- ✅ Direct Playwright control
- ✅ Good for learning Playwright basics

---

## 🧩 Approach 3: Basic Direct Playwright (No World)

### Files:
- `steps/login.steps.ts` - Step definitions with direct Playwright calls and module variables

### Configuration in `cucumber.js`:
```javascript
require: ['steps/**/login.steps.ts'],
```

### Step Definition Example:
```typescript
let browser: Browser;
let page: Page;

When('I login with valid credentials {string} and {string}', async function (username: string, password: string) {
    // Direct Playwright API calls with module-level variables
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
});
```

### Benefits:
- ✅ Simplest to understand initially
- ✅ Fastest to write for quick prototypes
- ✅ No additional abstractions

---

## 🔄 How to Switch Between Approaches

### To use **POM Approach** (Recommended for production):
1. In `cucumber.js`: Uncomment `require: ['steps/login-pom.steps.ts', 'steps/world.ts']`
2. In `steps/world.ts`: Enable `setWorldConstructor(CustomPlaywrightWorld)`  
3. In `steps/simpleWorld.ts`: Disable the setWorldConstructor line
4. Run: `npx cucumber-js features/login.feature`

### To use **Simple World Approach**:
1. In `cucumber.js`: Uncomment `require: ['steps/login-simple.steps.ts', 'steps/simpleWorld.ts']`
2. In `steps/simpleWorld.ts`: Enable `setWorldConstructor(SimplePlaywrightWorld)`
3. In `steps/world.ts`: Disable the setWorldConstructor line  
4. Run: `npx cucumber-js features/login.feature`

### To use **Basic Approach** (No world):
1. In `cucumber.js`: Uncomment `require: ['steps/**/login.steps.ts']`
2. In both world files: Disable setWorldConstructor lines
3. Run: `npx cucumber-js features/login.feature`

---

## 📋 Key Differences Summary

| Aspect | POM Approach | Simple World Approach | Basic Approach |
|--------|-------------|-----------------|----------------|
| **Code Structure** | Organized in page classes | World + direct Playwright | Module variables + direct Playwright |
| **Locator Management** | Centralized in page objects | Scattered in steps | Scattered in steps |
| **Browser Management** | World-managed lifecycle | World-managed lifecycle | Module-level variables |
| **Maintainability** | Highest (reusable methods) | Medium | Lowest (duplicate code) |
| **Learning Curve** | Steepest (requires POM) | Medium (world concepts) | Gentlest (direct API) |
| **Best for** | Production projects | Learning structured approach | Quick prototyping & learning |
| **Scalability** | Excellent | Good | Poor |

## 💡 Learning Path Recommendation

1. **Start with Basic approach** (`login.steps.ts`) to understand Cucumber + Playwright fundamentals
2. **Move to Simple World approach** (`login-simple.steps.ts`) to learn world management
3. **Graduate to POM approach** (`login-pom.steps.ts`) for production-ready test automation

Each approach builds on concepts from the previous one, providing a complete learning journey!