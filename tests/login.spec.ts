import { expect } from '@playwright/test';
import { test } from '../fixtures/basetest';


test.describe('Login Tests', () => {
    test('Valid Login Test',{tag:['@smoke','@login']}, async ({ basePage, loginPage, dashboardPage }) => {
        // Navigate to login page and perform login
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
        // Verify that we are on the Dashboard page
        await dashboardPage.verifyDashboardPageExists();
    });

    test('Invalid Login Test', async ({ basePage, loginPage }) => {
        // Navigate to login page and perform login with invalid credentials
        await basePage.navigateTo('/');
        await loginPage.login('invaliduser', 'invalidpassword');
        // Verify that an error message is displayed
        // const errorMessage = await loginPage.getErrorMessage();
        // expect(errorMessage).toBe('Invalid credentials');
    });
});