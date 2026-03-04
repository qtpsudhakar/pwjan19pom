// Write a wraper around the fill function to handle the strict mode error and try an alternative locator
import { expect, Locator, Page } from "@playwright/test";

export class WebHelpers {
    private page: Page;
    constructor(page: Page) {
        this.page = page;
    }
    // This class can contain various helper functions for web interactions, such as filling inputs, clicking buttons, selecting options, etc.
    // For example:
    async enterText(locator: Locator, value: string): Promise<void> {
        // This is a wrapper function for entering text
        try {
            await locator.fill(value);
            console.log(`Filled value: ${value} in ${locator.description()}`);
        } catch (error: any) {
            // Any customization for handling errors can be done here, for example, trying an alternative locator or logging additional information
            console.error(`Error filling value: ${error.message} in ${locator.description()}`);
            throw error; // Rethrow the error to be handled by the calling function
        } finally {
            // Add any cleanup or logging here if needed
        }
    }

    async clickElement(locator: Locator): Promise<void> {
        try {
            await locator.click();
            console.log(`Clicked on ${locator.description()}`);
        } catch (error: any) {
            console.error(`Error clicking on ${locator.description()}: ${error.message}`);
            throw error; // Rethrow the error to be handled by the calling function
        }
    }

    async selectOptionByText(locator: Locator, optionText: string): Promise<void> {
        try {
            await locator.selectOption({ label: optionText });
            console.log(`Selected option: ${optionText} in ${locator.description()}`);
        } catch (error: any) {
            console.error(`Error selecting option: ${optionText} in ${locator.description()}: ${error.message}`);
            throw error; // Rethrow the error to be handled by the calling function
        }
    }

    // Webhealper functions for common tasks across tests can be added here, such as:
    // - waitForElement(locator: Locator, timeout?: number)
    // - clickWithRetry(locator: Locator, retries?: number)
    // - getTextWithRetry(locator: Locator, retries?: number): Promise<string>
    // - etc.

    // Write wrapper for OrangeHRM specific select dropdowns if needed, for example:
    async selectCustomDropdownOption(label: string, optionText: string): Promise<void> {
        try {

            let filterInclude = this.page.locator(`//label[text()='${label}']/../..//div[@class='oxd-select-text-input']`).describe(`${label} filter dropdown`);
            let filterIncludeOption = this.page.locator(`//div[@role='option']//span[text()='${optionText}']`).describe(`Option for '${optionText}' in ${label} filter dropdown`);
            await filterInclude.click();
            await filterIncludeOption.click();
            console.log(`Selected option: ${optionText} from dropdown ${filterInclude.description()}`);
        } catch (error: any) {
            console.error(`Error selecting dropdown option: ${error.message}`);
            throw error; // Rethrow the error to be handled by the calling function
        }
    }
}