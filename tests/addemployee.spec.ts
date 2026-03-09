import { before, beforeEach } from 'node:test';
import { test } from '../fixtures/basetest';

// test.describe.configure({ mode: 'serial' });

test.describe('Add Employee Tests', () => {

    test.beforeAll(async ({ }) => {
        console.log('This runs once before all tests in this describe block');
    });

    test.afterAll(async ({ }) => {
        console.log('This runs once after all tests in this describe block');
    });

    // Login before each test in this describe block
    // test.beforeEach(async ({basePage, loginPage }) => {
    //     await basePage.navigateTo('/');
    //     await loginPage.login('testadmin', 'Vibetestq@123');
    // });

    test.afterEach(async ({ basePage }) => {
        
        console.log(test.info().title);
        await basePage.closeBrowser();
    });

    test('Add Employee Tests', 
        { tag: ['@smoke', '@employee'], 
            annotation:[{type: 'issue', description: 'Add Employee Test'},{type: 'testId', description: 'EMP-001'}] 
        },
         async ({ basePage, loginPage, dashboardPage, employeeListPage, addEmployeePage }) => {
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
        await addEmployeePage.addEmployee('John', 'Doe');

        await addEmployeePage.verifySuccessMessage('Successfully Saved');
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