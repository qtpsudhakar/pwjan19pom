import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
export class EmployeeListPage extends BasePage {
    private readonly btnAdd: Locator;

    private readonly filterInclude: Locator;
    private readonly filterIncludeOption: Locator;
    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        this.btnAdd = this.page.getByRole('button', { name: 'Add' }).describe("Add button");
        this.filterInclude = this.page.locator("//label[text()='Include']/../..//div[@class='oxd-select-text-input']").describe("Include filter dropdown");
        this.filterIncludeOption = this.page.locator("//div[@role='option']//span[text()='Current and Past Employees']").describe("Option for 'Current and Past Employees' in Include filter dropdown");
    }

    async clickAddButton() {
        await this.btnAdd.click();
        console.log(`Clicked on ${this.btnAdd.description()}`);
    }

    async navigateToAddEmployee() {
        await this.clickAddButton();
    }

}