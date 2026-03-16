import { expect, test } from '@playwright/test';
import { createWorker } from 'tesseract.js';

test('reads canvas text using OCR', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://the-internet.herokuapp.com/challenging_dom');

  const canvas = page.locator('#canvas');
  await expect(canvas).toBeVisible();

  const imageBuffer = await canvas.screenshot({ type: 'png' });

  const worker = await createWorker('eng');

  try {
    const {
      data: { text },
    } = await worker.recognize(imageBuffer);

    const normalizedText = text.replace(/\s+/g, ' ').trim();

    expect(normalizedText).toMatch(/Answer:\s*\d+/);
    console.log('OCR canvas text:', normalizedText);

    await page.waitForTimeout(5000); // Wait to ensure all logs are printed before test ends.
  } finally {
    await worker.terminate();
  }
});
