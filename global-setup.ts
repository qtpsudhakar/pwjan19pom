// global-setup.ts
import { chromium, FullConfig } from '@playwright/test';
import path from 'path'; // Node.js path module to handle file paths
import fs from 'fs'; // Node.js file system module to handle file operations

export default async function globalSetup(config: FullConfig) {

  console.log('Starting global setup...');
  // Read baseURL from the config — not hardcoded
  const { baseURL } = config.projects[0].use;

  // Ensure the .auth directory exists
  fs.mkdir(path.join(process.cwd(), '.auth'), { recursive: true }, (err) => {
    if (err) {
      console.error('Error creating .auth directory:', err);
    } else {
      console.log('.auth directory is ready');
    }
  });

  console.log('Ensured .auth directory exists');

  // Manually launch a browser — no fixtures available here
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Log in
  await page.goto(`${baseURL}`);
  console.log(`Navigating to ${baseURL} for login...`);

  await page.getByPlaceholder('Username').fill('testadmin');
  await page.getByPlaceholder('Password').fill('Vibetestq@123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/dashboard/);
  console.log('Login successful, dashboard loaded');
  // Save the session — cookies, localStorage, sessionStorage
  await context.storageState({ path: '.auth/admin.json' });

  // Always close the browser manually — no automatic cleanup
  await browser.close();

  console.log('Global setup complete — auth state saved to .auth/admin.json');
}
