import { Page, Locator, expect, errors } from '@playwright/test';
import { DashboardPage } from './DashboardPage';
import { BasePage } from './BasePage';
import { safeFill } from '@utils/webhelpers';

/**
 * LoginPage - encapsulates all interactions on the Login page.
 */
export class LoginPage extends BasePage {

    // private page: Page;
    private readonly usernameInput: Locator;
    private readonly passwordInput: Locator;
    private readonly loginButton: Locator;
    private readonly errorMessage: Locator;
    private readonly submitButton: Locator;
    private readonly signInButton: Locator;

    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        // Locators for the login page elements
        this.usernameInput = this.page.getByRole('textbox').describe("Username input field");
        this.passwordInput = this.page.getByRole('textbox', { name: 'Password' }).describe("Password input field");
        this.loginButton = this.page.getByRole('button', { name: 'Login' }).describe("Login button");
        this.errorMessage = this.page.getByText('Invalid credentials').describe("Error message for invalid login");

        this.submitButton = this.page.locator("//input[@id='Login'] | //input[@id='Submit']")
            .describe("Submit button on Dashboard page");

        this.signInButton = this.page.getByRole('button', { name: 'Submit' })
            .or(this.page.getByRole('button', { name: 'Sign In' }))
            .describe("Sign In button for login");
    }

    async enterUsername(username: string): Promise<void> {
        await safeFill(this.usernameInput, username);
    }

    async enterPassword(password: string): Promise<void> {
        await this.passwordInput.fill(password);
        console.log(`Filled password: ${password} in ${this.passwordInput.description()}`);
    }

    async clickLogin(): Promise<void> {
        await this.loginButton.click();
        console.log(`Clicked on ${this.loginButton.description()}`);
    }

    // Actions
    async login(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
        // assertions here to verify successful login
        console.log(`Attempted login with credentials: ${username} / ${password}`);
    }

    // Negative test for invalid login
    async loginWithInvalidCredentials(username: string, password: string): Promise<void> {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
        // assertions here to verify the error message
        expect(this.errorMessage).toBeVisible({ timeout: 5000 });
        console.log(`Attempted login with invalid credentials: ${username} / ${password}`);
    }

}
