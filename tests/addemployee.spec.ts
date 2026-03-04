import { test } from '../fixtures/basetest';

test('Add Employee Tests', async ({ basePage, loginPage, dashboardPage, employeeListPage, addEmployeePage }) => {
    // Navigate to login page and perform login
    await basePage.navigateTo('/');
    await loginPage.login('testadmin', 'Vibetestq@123');

    // Verify that we are on the Dashboard page
    await dashboardPage.verifyDashboardPageExists();

    // Navigate to Employee List
    await dashboardPage.navigateToEmployeeList();

    // Click on Add button to go to Add Employee page
    await employeeListPage.navigateToAddEmployee();

    // Fill in employee details and save
    await addEmployeePage.addEmployee('bharath', 'jayam');

});