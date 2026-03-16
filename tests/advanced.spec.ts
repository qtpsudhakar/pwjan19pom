import { expect, test } from '@playwright/test'

// Define one Playwright test case.
test('reads text drawn on the canvas', async ({ page }) => {
    // Install a hook before any page JavaScript executes.
    await page.addInitScript(() => {
        // Extend the Window type with our temporary storage property.
        type CanvasWindow = Window & { capturedCanvasTexts?: string[] };
        // Create a typed reference to window so TypeScript knows our custom field.
        const w = window as CanvasWindow;

        // Initialize storage once so captured values can be reused across calls.
        if (!w.capturedCanvasTexts) {
            // Start with an empty array to hold every drawn text value.
            w.capturedCanvasTexts = [];
        }

        // Keep original strokeText so we can call real behavior after capturing.
        const originalStrokeText = CanvasRenderingContext2D.prototype.strokeText;
        // Keep original fillText so we can call real behavior after capturing.
        const originalFillText = CanvasRenderingContext2D.prototype.fillText;

        // Helper to convert any input into string and store it.
        const captureText = (value: unknown) => {
            // Push each detected text into our shared window array.
            w.capturedCanvasTexts?.push(String(value));
        };

        // Wrap strokeText to capture the first argument (the visible text).
        CanvasRenderingContext2D.prototype.strokeText = function (...args) {
            // args[0] is the text passed to strokeText.
            captureText(args[0]);
            // Run original drawing logic to avoid changing page behavior.
            return originalStrokeText.apply(this, args);
        };

        // Wrap fillText for pages that draw text with fillText instead.
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
            // args[0] is the text passed to fillText.
            captureText(args[0]);
            // Run original drawing logic to avoid changing page behavior.
            return originalFillText.apply(this, args);
        };
    });

    // Navigate to the page containing the target canvas.
    await page.goto('https://the-internet.herokuapp.com/challenging_dom');

    // Confirm the canvas is visible before reading captured text.
    await expect(page.locator('#canvas')).toBeVisible();

    // Run code in browser context to read captured values from window.
    const answerText = await page.evaluate(() => {
        // Read all captured strings and remove empty/falsy values.
        const canvasTexts = ((window as Window & { capturedCanvasTexts?: string[] }).capturedCanvasTexts ?? []).filter(Boolean);
        // Find the first value shaped like: Answer: 12345
        return canvasTexts.find((text) => /^Answer:\s*\d+$/.test(text));
    });

    // Assert that we successfully captured the expected answer text.
    expect(answerText).toBeTruthy();
    // Print captured value to test output for easier debugging.
    console.log('Canvas text:', answerText);

    // OCR Techniques could be used here as a fallback if the above method fails to capture text, but this approach is more direct and efficient when it works.

    await page.locator('#canvas').screenshot({ path: 'canvas.png' });
    console.log('Canvas screenshot saved as canvas.png');

    //

});
