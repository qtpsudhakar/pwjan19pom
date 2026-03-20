import { test } from '../fixtures/basetest';

test.describe('PIM - Employee Profile Management Tests', { tag: ['@pim', '@profile', '@crud'] }, () => {

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

    test('TC-PIM-017: View Employee Profile Details',
        {
            tag: ['@smoke', '@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-017' }]
        },
        async ({ dashboardPage, pimPage, employeeProfilePage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            
            // Search for an existing employee
            await pimPage.searchEmployeeByName('Test');
            
            // Click on first employee in results using page method
            await pimPage.clickFirstEmployeeWithVerification();
            
            // Verify profile page elements
            await employeeProfilePage.verifyProfileHeaderDisplayed();
            await employeeProfilePage.verifyPersonalDetailsTabDisplayed();
            await employeeProfilePage.verifyAllTabsAccessible();
        }
    );

    test('TC-PIM-018: Edit Employee Personal Details',
        {
            tag: ['@smoke', '@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-018' }]
        },
        async ({ dashboardPage, pimPage, employeeProfilePage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            
            // Search for an existing employee
            await pimPage.searchEmployeeByName('Test');
            
            // Navigate to employee profile using page method
            await pimPage.clickFirstEmployeeWithVerification();
            
            // Click edit button and verify edit mode
            await employeeProfilePage.clickEditWithVerification();
            
            // Save changes with verification
            await employeeProfilePage.clickSaveWithVerification();
            console.log('Successfully tested employee edit functionality');
        }
    );

    test('TC-PIM-019: Navigate Between Profile Tabs',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-019' }]
        },
        async ({ dashboardPage, pimPage, employeeProfilePage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            
            // Search for an existing employee
            await pimPage.searchEmployeeByName('Test');
            
            // Navigate to employee profile using page method
            await pimPage.clickFirstEmployeeWithVerification();
            
            // Navigate through all profile tabs with verification
            await employeeProfilePage.navigateToAllTabsWithVerification();
            
            // Verify we can navigate back to personal details
            await employeeProfilePage.clickPersonalDetailsTab();
            await employeeProfilePage.verifyPersonalDetailsTabDisplayed();
        }
    );

    test('TC-PIM-020: Employee Profile Validation',
        {
            tag: ['@pim'],
            annotation: [{ type: 'testId', description: 'TC-PIM-020' }]
        },
        async ({ dashboardPage, pimPage, employeeProfilePage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            
            // Create a new employee using page methods with ACTION + VERIFICATION
            const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
            await pimPage.createTestEmployee('ProfileTest' + uniqueId, 'User');
            
            // Verify profile information is displayed correctly
            await employeeProfilePage.verifyProfileHeaderDisplayed();
            console.log('Successfully validated employee profile information');
        }
    );
});