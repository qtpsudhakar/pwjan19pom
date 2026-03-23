import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { SimplePlaywrightWorld } from './simpleWorld';

// Simple step definitions WITHOUT POM - direct Playwright API usage

Given('I navigate to the login page', async function (this: SimplePlaywrightWorld) {
    await this.init();
    await this.navigateTo('https://vibetestq-osondemand.orangehrm.com/auth/login');
    await this.waitForPageLoad();
});

When('I login with valid credentials {string} and {string}', async function (this: SimplePlaywrightWorld, username: string, password: string) {
    // Direct Playwright API calls - no page objects
    await this.page!.fill('input[name="username"]', username);
    await this.page!.fill('input[name="password"]', password);
    await this.page!.click('button[type="submit"]');
});

When('I login with invalid credentials {string} and {string}', async function (this: SimplePlaywrightWorld, username: string, password: string) {
    // Direct Playwright API calls - no page objects
    await this.page!.fill('input[name="username"]', username);
    await this.page!.fill('input[name="password"]', password);
    await this.page!.click('button[type="submit"]');
});

Then('I should be redirected to the dashboard page', async function (this: SimplePlaywrightWorld) {
    // Wait for navigation to dashboard page
    await this.page!.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify the URL contains dashboard
    const currentUrl = this.page!.url();
    expect(currentUrl).toContain('dashboard');
    
    // Wait for dashboard content to load
    await this.page!.waitForSelector("h6:has-text('Dashboard')", { timeout: 5000 });
});

Then('I should see the dashboard page exists', async function (this: SimplePlaywrightWorld) {
    // Wait for dashboard header to be visible
    await this.page!.waitForSelector("h6:has-text('Dashboard')", { timeout: 10000 });
    
    // Assert dashboard header is visible using direct Playwright locator
    const dashboardHeader = this.page!.locator("h6:has-text('Dashboard')");
    await expect(dashboardHeader).toBeVisible();
    
    // Cleanup: Close browser after test completion
    await this.cleanup();
});

Then('I should see an error message for invalid credentials', async function (this: SimplePlaywrightWorld) {
    // Wait for and verify error message appears using direct Playwright API
    await this.page!.waitForSelector('text=Invalid credentials', { timeout: 5000 });
    const errorMessage = this.page!.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Cleanup: Close browser after test completion
    await this.cleanup();
});