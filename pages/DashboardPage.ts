import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
export class DashboardPage extends BasePage {
    private readonly dashboardHeader: Locator;
    private readonly lnkPIM:Locator;

    constructor(page: Page) {
        super(page); // Call the constructor of BasePage to initialize the page property
        this.dashboardHeader = this.page.getByRole('heading', { name: 'Dashboard' }).describe("Dashboard page header");
        this.lnkPIM = this.page.getByRole('link', { name: 'PIM' }).describe("PIM link");
    }

    async verifyDashboardPageExists() {
        await this.dashboardHeader.waitFor({ state: 'visible', timeout: 5000 });
        await expect(this.dashboardHeader).toBeVisible();
        console.log(`Verified that we are on the ${this.dashboardHeader.description()}`);
    }

    async navigateToEmployeeList() {
        await this.webHelpers.clickElement(this.lnkPIM);
    }

}