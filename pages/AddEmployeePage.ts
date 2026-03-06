import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
export class AddEmployeePage extends BasePage {
    private readonly txtFirstName: Locator;
    private readonly txtLastName: Locator;
    private readonly btnSave: Locator;
    private readonly successMessage: Locator;
    private readonly employeeId: Locator;
    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        this.txtFirstName = this.page.getByRole('textbox', { name: 'First Name' }).describe("First Name textbox");
        this.txtLastName = this.page.getByRole('textbox', { name: 'Last Name' }).describe("Last Name textbox");
        this.btnSave = this.page.getByRole('button', { name: 'Save' }).describe("Save button");
        this.successMessage = this.page.getByRole('alert').describe("Success message");
        this.employeeId = this.page.locator("//label[text()='Employee Id']/../..//input").describe("Employee ID field");
    }
    async enterFirstName(firstName: string) {
        await this.webHelpers.enterText(this.txtFirstName, firstName);
    }

    async enterLastName(lastName: string) {
        await this.webHelpers.enterText(this.txtLastName, lastName);
    }
    async clickSave() {
        await this.webHelpers.clickElement(this.btnSave);
    }

    async enterEmployeeId(employeeId: string) {
        await this.webHelpers.enterText(this.employeeId, employeeId);
    }

    async verifySuccessMessage(expectedMessage: string) {
        await this.assertHelpers.assertTextVisible(expectedMessage);
    }

    async addEmployee(firstName: string, lastName: string) {
        await this.enterFirstName(firstName);
        await this.enterLastName(lastName);
        //Generate 6 digit random employee ID
        const randomEmployeeId = Math.floor(100000 + Math.random() * 900000).toString();

        await this.enterEmployeeId(`EMP${randomEmployeeId}`); // Generate a unique employee ID using the current timestamp
        await this.clickSave();
    }

}