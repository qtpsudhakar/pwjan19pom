import { test } from '../fixtures/basetest';

test.describe('PIM - Employee Search & List Tests', { tag: ['@smoke', '@pim', '@search', '@ci'] }, () => {

    test.beforeEach(async ({ basePage, loginPage }) => {
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
    });

    test.afterEach(async ({ basePage }) => {
        console.log(test.info().title);
        await basePage.closeBrowser();

        const { retry, status, title } = test.info();
        if (retry > 0 && status === 'passed') {
            console.warn(`⚠️ FLAKY TEST: "${title}" passed on retry ${retry}`);
        }
        if (retry > 0 && status === 'failed') {
            console.error(`❌ PERSISTENT FAILURE: "${title}" still failing on retry ${retry}`);
        }
    });

    test('TC-PIM-001: Display Employee List',
        {
            tag: ['@smoke', '@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-001' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.verifySearchFormDisplayed();
            await pimPage.verifyEmployeeTableDisplayed();
            await pimPage.verifyAddButtonVisible();
        }
    );

    test('TC-PIM-002: Search Employee by Name',
        {
            tag: ['@smoke', '@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-002' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.searchEmployeeByName('Test Employee');
            await pimPage.verifySearchResultsDisplayed();
        }
    );

    test('TC-PIM-003: Search Employee by ID',
        {
            tag: ['@smoke', '@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-003' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.searchEmployeeById('0001');
            await pimPage.verifySearchResultsDisplayed();
        }
    );

    test('TC-PIM-004: Search with No Results',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-004' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.searchEmployeeByName('NonExistent Employee');
            await pimPage.verifyNoRecordsFound();
        }
    );

    test('TC-PIM-005: Reset Search Filters',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-005' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.enterEmployeeName('Test Name');
            await pimPage.enterEmployeeId('123');
            await pimPage.resetAllFilters();
            await pimPage.verifySearchFormDisplayed();
        }
    );

    test('TC-PIM-006: Employment Status Filter',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-006' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.selectEmploymentStatus('Full-Time Permanent');
            await pimPage.clickSearch();
            await pimPage.verifySearchResultsDisplayed();
        }
    );

    test('TC-PIM-007: Include Filter Functionality',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-007' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            await pimPage.selectIncludeFilter('Current and Past Employees');
            await pimPage.clickSearch();
            await pimPage.verifySearchResultsDisplayed();
        }
    );
});