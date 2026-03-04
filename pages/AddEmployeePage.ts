import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
export class AddEmployeePage extends BasePage {
    private readonly txtFirstName: Locator;
    private readonly txtLastName: Locator;
    private readonly btnSave: Locator;

    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        this.txtFirstName = this.page.getByRole('textbox', { name: 'First Name' }).describe("First Name textbox");
        this.txtLastName = this.page.getByRole('textbox', { name: 'Last Name' }).describe("Last Name textbox");
        this.btnSave = this.page.getByRole('button', { name: 'Save' }).describe("Save button");
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

    async addEmployee(firstName: string, lastName: string) {
        await this.enterFirstName(firstName);
        await this.enterLastName(lastName);
        await this.clickSave();
    }

}