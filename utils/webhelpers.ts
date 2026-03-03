// Write a wraper around the fill function to handle the strict mode error and try an alternative locator
import { expect, Locator, Page } from "@playwright/test";

export async function safeFill(locator: Locator, value: string): Promise<void> {
    try {
        await locator.fill(value);
        console.log(`Filled value: ${value} in ${locator.description()}`);
    } catch (error) {
        try {
            if (error.message.includes('strict mode')) {
                console.error(`Error filling value: ${error.message}`);
                await locator.first().fill(value);
                console.log(`Filled value using first() locator: ${value} in ${locator.first().description()}`);
            } else {
                throw error; // Rethrow the error if it's not related to strict mode
            }
        } catch (innerError) {
            console.error(`Failed to fill value with first() locator: ${innerError.message}`);
            throw innerError; // Rethrow the error if it cannot be resolved
        }
    } finally {
        // Add any cleanup or logging here if needed
    }
}

// Webhealper functions for common tasks across tests can be added here, such as:
// - waitForElement(locator: Locator, timeout?: number)
// - clickWithRetry(locator: Locator, retries?: number)
// - getTextWithRetry(locator: Locator, retries?: number): Promise<string>
// - etc.

// Write wrapper for OrangeHRM specific select dropdowns if needed, for example:
export async function selectCustomDropdownOption(page: Page, label: string, optionText: string): Promise<void> {
    try {

        let filterInclude = page.locator(`//label[text()='${label}']/../..//div[@class='oxd-select-text-input']`).describe(`${label} filter dropdown`);
        let filterIncludeOption = page.locator(`//div[@role='option']//span[text()='${optionText}']`).describe(`Option for '${optionText}' in ${label} filter dropdown`);
        await filterInclude.click();
        await filterIncludeOption.click();
        console.log(`Selected option: ${optionText} from dropdown ${filterInclude.description()}`);
    } catch (error) {
        console.error(`Error selecting dropdown option: ${error.message}`);
        throw error; // Rethrow the error to be handled by the calling function
    }
}