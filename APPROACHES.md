# Cucumber + Playwright: POM vs Direct API Approaches

This project provides two different approaches for writing Cucumber step definitions with Playwright:

## 🏗️ Approach 1: With Page Object Model (POM)

### Files:
- `steps/world.ts` - World setup with page object instances
- `steps/login.steps.ts` - Step definitions using page objects
- `pages/*.ts` - Page object classes

### Configuration in `cucumber.js`:
```javascript
require: ['steps/**/login.steps.ts', 'steps/world.ts'],
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
- ✅ Better maintainability
- ✅ Reusable page methods
- ✅ Cleaner test separation
- ✅ Following POM best practices

---

## 🎯 Approach 2: Direct Playwright API (Simple) 

### Files:
- `steps/simpleWorld.ts` - Basic world setup without page objects
- `steps/login-simple.steps.ts` - Step definitions with direct Playwright calls

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
    // Direct Playwright API calls
    await this.page!.fill('input[name="username"]', username);
    await this.page!.fill('input[name="password"]', password);
    await this.page!.click('button[type="submit"]');
});
```

### Benefits:
- ✅ Simpler to understand initially
- ✅ Direct control over Playwright
- ✅ Faster to write initially
- ✅ Good for learning Playwright basics

---

## 🔄 How to Switch Between Approaches

### To use **POM Approach**:
1. In `cucumber.js`: Uncomment the POM require line
2. In `steps/world.ts`: Enable `setWorldConstructor(CustomPlaywrightWorld)`  
3. In `steps/simpleWorld.ts`: Disable the setWorldConstructor line
4. Run: `npx cucumber-js features/login.feature`

### To use **Simple Approach**:
1. In `cucumber.js`: Uncomment the Simple require line
2. In `steps/simpleWorld.ts`: Enable `setWorldConstructor(SimplePlaywrightWorld)`
3. In `steps/world.ts`: Disable the setWorldConstructor line  
4. Run: `npx cucumber-js features/login.feature`

---

## 📋 Key Differences Summary

| Aspect | POM Approach | Simple Approach |
|--------|-------------|-----------------|
| **Code Structure** | Organized in page classes | All in step definitions |
| **Locator Management** | Centralized in page objects | Scattered in steps |
| **Maintainability** | High (reusable methods) | Lower (duplicate code) |
| **Learning Curve** | Steeper (requires POM understanding) | Gentler (direct API) |
| **Best for** | Production projects | Learning & prototyping |

## 💡 Recommendation

- **Start with Simple approach** to learn Cucumber + Playwright basics
- **Move to POM approach** for real projects and better maintainability
- **Use both** to understand the differences and benefits

Both approaches will help you master different aspects of test automation!