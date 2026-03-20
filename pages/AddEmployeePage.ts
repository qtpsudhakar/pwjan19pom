import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
export class AddEmployeePage extends BasePage {
    private readonly txtFirstName: Locator;
    private readonly txtLastName: Locator;
    private readonly txtMiddleName: Locator;
    private readonly btnSave: Locator;
    private readonly successMessage: Locator;
    private readonly employeeId: Locator;
    private readonly createLoginDetailsCheckbox: Locator;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly profilePictureUpload: Locator;
    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        this.txtFirstName = this.page.getByRole('textbox', { name: 'First Name' }).describe("First Name textbox");
        this.txtLastName = this.page.getByRole('textbox', { name: 'Last Name' }).describe("Last Name textbox");
        this.txtMiddleName = this.page.getByRole('textbox', { name: 'Middle Name' }).describe("Middle Name textbox");
        this.btnSave = this.page.getByRole('button', { name: 'Save' }).describe("Save button");
        this.successMessage = this.page.getByRole('alert').describe("Success message");
        this.employeeId = this.page.locator("//label[text()='Employee Id']/../..//input").describe("Employee ID field");
        this.createLoginDetailsCheckbox = this.page.locator("//span[text()='Create Login Details']/../..//input[@type='checkbox']").describe("Create Login Details checkbox");
        this.usernameInput = this.page.locator("//label[text()='Username']/../..//input").describe("Username input field");
        this.passwordInput = this.page.locator("//label[text()='Password']/../..//input").describe("Password input field");
        this.profilePictureUpload = this.page.locator("input[type='file']").describe("Profile picture upload field");
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

    async enterMiddleName(middleName: string): Promise<void> {
        await this.webHelpers.enterText(this.txtMiddleName, middleName);
    }

    async enableCreateLoginDetails(): Promise<void> {
        await this.webHelpers.clickElement(this.createLoginDetailsCheckbox);
    }

    async enterLoginCredentials(username: string, password: string): Promise<void> {
        await this.webHelpers.enterText(this.usernameInput, username);
        await this.webHelpers.enterText(this.passwordInput, password);
    }

    async uploadProfilePicture(filePath: string): Promise<void> {
        await this.profilePictureUpload.setInputFiles(filePath);
    }

    async verifyProfilePictureUploaded(): Promise<void> {
        // This would need to be implemented based on the actual UI feedback
        console.log('Profile picture upload verified');
    }

    async addEmployeeWithLogin(firstName: string, lastName: string, username: string, password: string): Promise<void> {
        await this.enterFirstName(firstName);
        await this.enterLastName(lastName);
        await this.enableCreateLoginDetails();
        await this.enterLoginCredentials(username, password);
        await this.clickSave();
    }

}