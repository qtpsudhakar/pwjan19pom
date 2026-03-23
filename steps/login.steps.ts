import { Given, When, Then } from '@cucumber/cucumber';
import { chromium, expect } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';

// Step definitions for login.feature
let browser: Browser;
let context: BrowserContext;
let page: Page;
Given('I navigate to the login page', async function () {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto('https://vibetestq-osondemand.orangehrm.com/auth/login');
});

When('I login with valid credentials {string} and {string}', async function (username: string, password: string) {
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
});

When('I login with invalid credentials {string} and {string}', async function (username: string, password: string) {
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
});

Then('I should be redirected to the dashboard page', async function () {
    // Wait for navigation to dashboard page
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verify the URL contains dashboard
    const currentUrl = page.url();
    expect(currentUrl).toContain('dashboard');
    
    // Wait for dashboard content to load
    await page.waitForSelector("h6:has-text('Dashboard')", { timeout: 5000 });
});

Then('I should see the dashboard page exists', async function () {
    // Wait for dashboard header to be visible
    await page.waitForSelector("h6:has-text('Dashboard')", { timeout: 10000 });
    
    // Assert dashboard header is visible
    const dashboardHeader = page.locator("h6:has-text('Dashboard')");
    await expect(dashboardHeader).toBeVisible();
    
    // Cleanup: Close browser after test completion
    await context.close();
    await browser.close();
});

Then('I should see an error message for invalid credentials', async function () {
    // Wait for and verify error message appears
    await page.waitForSelector('text=Invalid credentials', { timeout: 5000 });
    const errorMessage = page.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();
    
    // Cleanup: Close browser after test completion
    await context.close();
    await browser.close();
});