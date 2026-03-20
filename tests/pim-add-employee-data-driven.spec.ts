import { test } from '../fixtures/basetest';
import * as employeeData from '../test-data/pimEmployeeData.json';

test.describe('PIM - Data-Driven Employee Creation', { tag: ['@pim', '@employee', '@datadriven'] }, () => {
    
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

    employeeData.employees.forEach((employee, index) => {
        test(`Create Employee: ${employee.firstName} ${employee.lastName}`, 
            { 
                tag: ['@smoke', '@pim'], 
                annotation: [{ type: 'testId', description: `TC-PIM-DD-${index + 1}` }] 
            },
            async ({ dashboardPage, pimPage, addEmployeePage }) => {
                await dashboardPage.verifyDashboardPageExists();
                await pimPage.navigateToEmployeeList();
                await pimPage.clickAddEmployee();
                
                // Generate unique ID for each test run to avoid conflicts
                const uniqueId = Math.floor(100000 + Math.random() * 900000).toString();
                const firstName = employee.firstName + uniqueId;
                const lastName = employee.lastName + uniqueId;
                
                if (employee.createLogin) {
                    // Add employee with login credentials
                    await addEmployeePage.enterFirstName(firstName);
                    await addEmployeePage.enterLastName(lastName);
                    
                    // Note: Login credential functionality may need to be implemented
                    // For now, just create the basic employee
                    await addEmployeePage.clickSave();
                } else {
                    await addEmployeePage.addEmployee(firstName, lastName);
                }
                
                await addEmployeePage.verifySuccessMessage('Successfully Saved');
        });
    });
});