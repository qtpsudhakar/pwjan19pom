import { test } from '../fixtures/basetest';
import * as employeeData from '../test-data/pimEmployeeData.json';

test.describe('PIM - Data-Driven Search Tests', { tag: ['@pim', '@search', '@datadriven'] }, () => {
    
    test.beforeEach(async ({ basePage, loginPage }) => {
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
    });

    test.afterEach(async ({ basePage }) => {
        await basePage.closeBrowser();
        
        const { retry, status, title } = test.info();
        if (retry > 0 && status === 'passed') {
            console.warn(`⚠️ FLAKY TEST: "${title}" passed on retry ${retry}`);
        }
        if (retry > 0 && status === 'failed') {
            console.error(`❌ PERSISTENT FAILURE: "${title}" still failing on retry ${retry}`);
        }
    });

    employeeData.searchCriteria.forEach((criteria, index) => {
        test(`TC-PIM-015-${index + 1}: Search by ${criteria.type} - ${criteria.value}`, 
            { 
                tag: ['@pim', '@search'], 
                annotation: [{ type: 'testId', description: `TC-PIM-015-${index + 1}` }] 
            },
            async ({ dashboardPage, pimPage }) => {
                await dashboardPage.verifyDashboardPageExists();
                await pimPage.navigateToEmployeeList();
                
                if (criteria.type === 'employeeName') {
                    await pimPage.searchEmployeeByName(criteria.value);
                } else if (criteria.type === 'employeeId') {
                    await pimPage.searchEmployeeById(criteria.value);
                } else if (criteria.type === 'invalidName' || criteria.type === 'partialName') {
                    await pimPage.searchEmployeeByName(criteria.value);
                }
                
                // Verify results based on expected count
                if (criteria.expectedResults === 0) {
                    await pimPage.verifyNoRecordsFound();
                } else {
                    await pimPage.verifySearchResultsDisplayed();
                }
                
                // Reset filters for next iteration
                await pimPage.resetAllFilters();
        });
    });

    test('TC-PIM-016: Multiple Filter Combination Search',
        {
            tag: ['@pim', '@search'],
            annotation: [{ type: 'testId', description: 'TC-PIM-016' }]
        },
        async ({ dashboardPage, pimPage }) => {
            await dashboardPage.verifyDashboardPageExists();
            await pimPage.navigateToEmployeeList();
            
            // Test combination of multiple search filters
            await pimPage.enterEmployeeName('Test');
            await pimPage.selectIncludeFilter('Current and Past Employees');
            await pimPage.clickSearch();
            
            // Verify search results or no results message
            try {
                await pimPage.verifySearchResultsDisplayed();
            } catch {
                await pimPage.verifyNoRecordsFound();
            }
            
            await pimPage.resetAllFilters();
        }
    );
});