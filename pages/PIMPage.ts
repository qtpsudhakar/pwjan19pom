import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class PIMPage extends BasePage {
    // Search form locators
    private readonly employeeSearchForm: Locator;
    private readonly employeeNameInput: Locator;
    private readonly employeeIdInput: Locator;
    private readonly employmentStatusDropdown: Locator;
    private readonly includeDropdown: Locator;
    private readonly supervisorNameInput: Locator;
    private readonly jobTitleDropdown: Locator;
    private readonly subUnitDropdown: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    
    // Action buttons
    private readonly addButton: Locator;
    
    // Table and results
    private readonly employeeTable: Locator;
    private readonly recordsFoundText: Locator;
    private readonly noRecordsFoundMessage: Locator;
    private readonly firstEmployeeRow: Locator;
    
    // Navigation
    private readonly pimMenuLink: Locator;
    private readonly employeeListMenuLink: Locator;

    constructor(page: Page) {
        super(page);
        
        // Search form elements
        this.employeeSearchForm = this.page.locator('form').describe('Employee search form');
        this.employeeNameInput = this.page.getByPlaceholder('Type for hints...').first().describe('Employee name input field');
        this.employeeIdInput = this.page.locator("//label[text()='Employee Id']/../..//input").describe('Employee ID input field');
        this.employmentStatusDropdown = this.page.locator("//label[text()='Employment Status']/../..//div[@class='oxd-select-text-input']").describe('Employment Status dropdown');
        this.includeDropdown = this.page.locator("//label[text()='Include']/../..//div[@class='oxd-select-text-input']").describe('Include filter dropdown');
        this.supervisorNameInput = this.page.getByPlaceholder('Type for hints...').nth(1).describe('Supervisor name input field');
        this.jobTitleDropdown = this.page.locator("//label[text()='Job Title']/../..//div[@class='oxd-select-text-input']").describe('Job Title dropdown');
        this.subUnitDropdown = this.page.locator("//label[text()='Sub Unit']/../..//div[@class='oxd-select-text-input']").describe('Sub Unit dropdown');
        
        // Action buttons
        this.searchButton = this.page.getByRole('button', { name: 'Search' }).describe('Search button');
        this.resetButton = this.page.getByRole('button', { name: 'Reset' }).describe('Reset button');
        this.addButton = this.page.getByRole('button', { name: 'Add' }).describe('Add employee button');
        
        // Results and table
        this.employeeTable = this.page.locator('.oxd-table').describe('Employee table');
        this.recordsFoundText = this.page.locator('.orangehrm-paper-container .oxd-text--span').filter({ hasText: 'Records Found' }).describe('Records found text');
        this.noRecordsFoundMessage = this.page.locator('.orangehrm-paper-container .oxd-text--span').filter({ hasText: 'No Records Found' }).describe('No records found message');
        this.firstEmployeeRow = this.page.locator('.oxd-table-body .oxd-table-row').first().describe('First employee row');
        
        // Navigation
        this.pimMenuLink = this.page.getByRole('link', { name: 'PIM' }).describe('PIM menu link');
        this.employeeListMenuLink = this.page.getByRole('link', { name: 'Employee List' }).describe('Employee List menu item');
    }

    async navigateToPIM(): Promise<void> {
        await this.webHelpers.clickElement(this.pimMenuLink);
    }

    async navigateToEmployeeList(): Promise<void> {
        await this.navigateToPIM();
        await this.webHelpers.clickElement(this.employeeListMenuLink);
    }

    async enterEmployeeName(name: string): Promise<void> {
        await this.webHelpers.enterText(this.employeeNameInput, name);
    }

    async enterEmployeeId(id: string): Promise<void> {
        await this.webHelpers.enterText(this.employeeIdInput, id);
    }

    async selectEmploymentStatus(status: string): Promise<void> {
        await this.webHelpers.clickElement(this.employmentStatusDropdown);
        
        // Check if dropdown has options or shows "No Records Found"
        const noRecordsOption = this.page.locator('//div[@role="option" and contains(text(), "No Records Found")]');
        const noRecordsExists = await noRecordsOption.isVisible().catch(() => false);
        
        if (noRecordsExists) {
            console.log(`[err] Employment Status dropdown shows "No Records Found" - no employment statuses configured in system`);
            // Click elsewhere to close the dropdown
            await this.page.locator('h5:has-text("Employee Information")').click();
            throw new Error(`Employment Status dropdown shows "No Records Found" - system not configured with employment status data`);
        }
        
        const option = this.page.locator(`//div[@role='option']//span[text()='${status}']`).describe(`Employment status option: ${status}`);
        await this.webHelpers.clickElement(option);
    }

    async selectIncludeFilter(filter: string): Promise<void> {
        await this.webHelpers.clickElement(this.includeDropdown);
        const option = this.page.locator(`//div[@role='option']//span[text()='${filter}']`).describe(`Include filter option: ${filter}`);
        await this.webHelpers.clickElement(option);
    }

    async enterSupervisorName(name: string): Promise<void> {
        await this.webHelpers.enterText(this.supervisorNameInput, name);
    }

    async selectJobTitle(title: string): Promise<void> {
        await this.webHelpers.clickElement(this.jobTitleDropdown);
        const option = this.page.locator(`//div[@role='option']//span[text()='${title}']`).describe(`Job title option: ${title}`);
        await this.webHelpers.clickElement(option);
    }

    async selectSubUnit(unit: string): Promise<void> {
        await this.webHelpers.clickElement(this.subUnitDropdown);
        const option = this.page.locator(`//div[@role='option']//span[text()='${unit}']`).describe(`Sub unit option: ${unit}`);
        await this.webHelpers.clickElement(option);
    }

    async clickSearch(): Promise<void> {
        await this.webHelpers.clickElement(this.searchButton);
    }

    async clickReset(): Promise<void> {
        await this.webHelpers.clickElement(this.resetButton);
    }

    async clickAddEmployee(): Promise<void> {
        await this.webHelpers.clickElement(this.addButton);
    }

    async verifySearchFormDisplayed(): Promise<void> {
        await this.assertHelpers.assertVisible(this.employeeSearchForm);
        await this.assertHelpers.assertVisible(this.employeeNameInput);
        await this.assertHelpers.assertVisible(this.searchButton);
        await this.assertHelpers.assertVisible(this.resetButton);
    }

    async verifyEmployeeTableDisplayed(): Promise<void> {
        await this.assertHelpers.assertVisible(this.employeeTable);
    }

    async verifyAddButtonVisible(): Promise<void> {
        await this.assertHelpers.assertVisible(this.addButton);
    }

    async verifyNoRecordsFound(): Promise<void> {
        await this.assertHelpers.assertVisible(this.noRecordsFoundMessage);
    }

    async verifySearchResultsDisplayed(): Promise<void> {
        await this.assertHelpers.assertVisible(this.employeeTable);
        await this.assertHelpers.assertVisible(this.recordsFoundText);
    }

    async searchEmployeeByName(name: string): Promise<void> {
        await this.enterEmployeeName(name);
        await this.clickSearch();
    }

    async searchEmployeeById(id: string): Promise<void> {
        await this.enterEmployeeId(id);
        await this.clickSearch();
    }

    async resetAllFilters(): Promise<void> {
        await this.clickReset();
    }

    // Employee row interactions with ACTION + VERIFICATION
    async clickFirstEmployee(): Promise<void> {
        await this.webHelpers.clickElement(this.firstEmployeeRow);
    }

    async verifyEmployeeRowExists(): Promise<void> {
        await this.assertHelpers.assertVisible(this.firstEmployeeRow);
    }

    async clickFirstEmployeeWithVerification(): Promise<void> {
        await this.verifyEmployeeRowExists();
        await this.clickFirstEmployee();
        // Verification would need to check if profile page loaded - 
        // this would be handled by calling page's verification method
    }

    // Quick employee creation for testing (with ACTION + VERIFICATION)
    async createTestEmployee(firstName: string, lastName: string): Promise<void> {
        await this.clickAddEmployee();
        await this.fillEmployeeForm(firstName, lastName);
        await this.saveEmployee();
        await this.verifyEmployeeSaved();
    }

    async fillEmployeeForm(firstName: string, lastName: string): Promise<void> {
        const firstNameField = this.page.getByRole('textbox', { name: 'First Name' }).describe('First Name field');
        const lastNameField = this.page.getByRole('textbox', { name: 'Last Name' }).describe('Last Name field');
        
        await this.webHelpers.enterText(firstNameField, firstName);
        await this.webHelpers.enterText(lastNameField, lastName);
        
        // Verify values were entered
        await this.assertHelpers.assertFieldValue(firstNameField, firstName);
        await this.assertHelpers.assertFieldValue(lastNameField, lastName);
    }

    async saveEmployee(): Promise<void> {
        const saveButton = this.page.getByRole('button', { name: 'Save' }).describe('Save button');
        await this.webHelpers.clickElement(saveButton);
    }

    async verifyEmployeeSaved(): Promise<void> {
        // Wait for profile page to load by checking for profile header
        const profileHeader = this.page.locator('h6').first().describe('Profile header section');
        await this.assertHelpers.assertVisible(profileHeader);
        
        // Also verify we're on the profile page by checking the employee name header is shown
        const employeeNameHeader = this.page.locator('h6').first().describe('Employee name in header');
        await this.assertHelpers.assertVisible(employeeNameHeader);
    }
}