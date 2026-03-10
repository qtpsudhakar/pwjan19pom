//Implement a base test class that initializes the browser and page objects, and provides common setup and teardown methods for all tests.
import { test as baseTest } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { EmployeeListPage } from '@pages/EmployeeListPage';
import { AddEmployeePage } from '@pages/AddEmployeePage';
// Extend the base test to include a fixture for the BasePage

export const test = baseTest.extend<{
    // Define fixture variables here
    basePage: BasePage;
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    addEmployeePage: AddEmployeePage;
    employeeListPage: EmployeeListPage;
    forEachTest: void; // Example of a fixture variable that can be used in tests
}, { forEachWorker: void; }>({
    // Define fixture functionality here
    basePage: async ({ page }, use) => {
        const basePage = new BasePage(page);
        await use(basePage);
    },
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },
    addEmployeePage: async ({ page }, use) => {
        const addEmployeePage = new AddEmployeePage(page);
        await use(addEmployeePage);
    },
    employeeListPage: async ({ page }, use) => {
        const employeeListPage = new EmployeeListPage(page);
        await use(employeeListPage);
    },

    forEachTest: [async ({ page }, use) => {
        const basePage = new BasePage(page);
        await basePage.navigateTo('/');
        // const loginPage = new LoginPage(page);
        // await loginPage.login('testadmin', 'Vibetestq@123');
        await use();
    }, { scope: 'test', auto: true }],

    forEachWorker: [async ({ }, use) => {
        console.log('This runs once per worker');
        await use();
    }, { scope: 'worker', auto: true }],
});