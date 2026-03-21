import { before, beforeEach } from 'node:test';
import { test } from '../fixtures/basetest';
import * as data from '../test-data/employeeData.json';

// test.describe.configure({ mode: 'serial' });

test.describe('Add Employee Tests', () => {

    test.beforeAll(async ({ }) => {
        console.log('This runs once before all tests in this describe block');
    });

    test.afterAll(async ({ }) => {
        console.log('This runs once after all tests in this describe block');
    });

    // Login before each test in this describe block
    test.beforeEach(async ({basePage, loginPage }) => {
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
    });

    test.afterEach(async ({ basePage }) => {
        await basePage.closeBrowser();
        const info = test.info();
        const retry = info.retry;
        const status = info.status;

        if (retry > 0 && status === 'passed') {
            // The test was flaky — it failed at least once but eventually passed
            console.warn(`⚠️ FLAKY TEST: "${info.title}" passed on retry ${retry}`);
            // You might want to log this to a flakiness dashboard
        }

        if (retry > 0 && status === 'failed') {
            // Still failing after retries — definitely a real problem
            console.error(`❌ PERSISTENT FAILURE: "${info.title}" still failing on retry ${retry}`);
        }
    });

    data.employees.forEach(employee => {
        test(`Add Employee: ${employee.firstName} ${employee.lastName}`, { tag: ['@smoke', '@employee'] }, async ({ basePage, loginPage, dashboardPage, employeeListPage, addEmployeePage }) => {
            // Navigate to login page and perform login
            // await basePage.navigateTo('/');
            // await loginPage.login('testadmin', 'Vibetestq@123');

            // Verify that we are on the Dashboard page
            await dashboardPage.verifyDashboardPageExists();

            // Navigate to Employee List
            await dashboardPage.navigateToEmployeeList();

            // Click on Add button to go to Add Employee page
            await employeeListPage.navigateToAddEmployee();

            // Fill in employee details and save
            await addEmployeePage.addEmployee(employee.firstName, employee.lastName);

            await addEmployeePage.verifySuccessMessage('Successfully Saved');
        });
    });

    test('Search Employee Test', { tag: ['@smoke', '@employee'] }, async ({ basePage, loginPage, dashboardPage, employeeListPage }) => {
        // Navigate to login page and perform login
        // await basePage.navigateTo('/');
        // await loginPage.login('testadmin', 'Vibetestq@123');
        // Verify that we are on the Dashboard page
        await dashboardPage.verifyDashboardPageExists();
        // Navigate to Employee List
        await dashboardPage.navigateToEmployeeList();
        // Search for the employee we just added
        await employeeListPage.searchEmployee('John');
    });
});