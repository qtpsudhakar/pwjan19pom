import { Page } from '@playwright/test';
import { AssertHelpers } from '@utils/assertHelpers';
import { WebHelpers } from '@utils/webhelpers';
export class BasePage {

    // Common properties and methods for all pages can be defined here

    protected page: Page; // Protected so that it can be accessed by derived classes
    protected webHelpers: WebHelpers; // Placeholder for WebHelpers instance, can be initialized in the constructor of derived classes
    protected assertHelpers: AssertHelpers; // Placeholder for AssertHelpers instance, can be initialized in the constructor of derived classes
    constructor(page: Page) {
        this.page = page;
        this.webHelpers = new WebHelpers(page); // Initialize WebHelpers with the page instance
        this.assertHelpers = new AssertHelpers(page); // Initialize AssertHelpers with the page instance
    }

    async navigateTo(url: string): Promise<void> {
        await this.page.goto(url);
        console.log(`Navigated to URL: ${url}`);
    }
    async getPageTitle(): Promise<string> {
        const title = await this.page.title();
        console.log(`Current page title: ${title}`);
        return title;
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('load');
        console.log(`Page has fully loaded`);
    }
    async closeBrowser(): Promise<void> {
        await this.page.close();
        console.log(`Browser closed successfully`);
    }
}