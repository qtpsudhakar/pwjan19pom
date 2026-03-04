import { expect } from '@playwright/test';
import { test } from '../fixtures/basetest';

test('Add Employee Tests', async ({ basePage, loginPage, dashboardPage }) => {
    // Navigate to login page and perform login
    await basePage.navigateTo('/');
    await loginPage.login('testadmin', 'Vibetestq@123');

    // Verify that we are on the Dashboard page
    await dashboardPage.verifyDashboardPageExists();

});