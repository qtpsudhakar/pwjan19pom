import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomPlaywrightWorld } from './world';

// Step definitions using POM (Page Object Model) approach
// These steps use page object methods instead of direct Playwright API calls

Given('I navigate to the login page', async function (this: CustomPlaywrightWorld) {
    // Initialize the world with browser, context, page and all page objects
    await this.init();
    
    // Use BasePage method to navigate - no exclamation marks needed
    await this.basePage.navigateTo('https://vibetestq-osondemand.orangehrm.com/auth/login');
    await this.basePage.waitForPageLoad();
});

When('I login with valid credentials {string} and {string}', async function (this: CustomPlaywrightWorld, username: string, password: string) {
    // Use LoginPage methods - following POM principle of only calling page methods
    await this.loginPage.enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
});

When('I login with invalid credentials {string} and {string}', async function (this: CustomPlaywrightWorld, username: string, password: string) {
    // Use LoginPage methods - no direct Playwright API calls
    await this.loginPage.enterUsername(username);
    await this.loginPage.enterPassword(password);
    await this.loginPage.clickLogin();
});

Then('I should be redirected to the dashboard page', async function (this: CustomPlaywrightWorld) {
    // Use BasePage method to wait for page load
    await this.basePage.waitForPageLoad();
    
    // Verify URL using page title or URL check through BasePage
    const currentTitle = await this.basePage.getPageTitle();
    expect(currentTitle).toContain('OrangeHRM');
    
    // Could also verify URL contains dashboard - using optional chaining
    if (this.page) {
        const currentUrl = this.page.url();
        expect(currentUrl).toContain('dashboard');
    }
});

Then('I should see the dashboard page exists', async function (this: CustomPlaywrightWorld) {
    // Use DashboardPage method to verify dashboard exists
    await this.dashboardPage.verifyDashboardPageExists();
    
    // Cleanup: Close browser after successful test completion
    await this.cleanup();
});

Then('I should see an error message for invalid credentials', async function (this: CustomPlaywrightWorld) {
    // Use page object method if LoginPage has error verification method
    // If not available, we would need to add it to LoginPage first
    // For now, using direct page access but this should ideally be a LoginPage method
    
    if (this.page) {
        // Wait for error message to appear
        await this.page.waitForSelector('text=Invalid credentials', { timeout: 5000 });
        
        // Verify error message is visible
        const errorMessage = this.page.locator('text=Invalid credentials');
        await expect(errorMessage).toBeVisible();
    }
    
    // Note: Ideally this should be something like:
    // await this.loginPage.verifyInvalidCredentialsError();
    
    // Cleanup: Close browser after test completion
    await this.cleanup();
});