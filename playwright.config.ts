import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration file.
 * See https://playwright.dev/docs/test-configuration
 */

const runId = new Date().toISOString().replace(/[:.]/g, '-');
const runOutputDir = `test-results/pwreport-${runId}`;

export default defineConfig({
  // Directory containing the tests
  testDir: './tests',
  // tag: ['@smoke', '@employee', '@login'], // Example of global tags that can be used in tests
  // Glob pattern to match test files
  testMatch: '**/*.spec.ts',

  // Maximum time one test can run for (ms)
  timeout: 60_000,

  // Expect timeout (ms)
  expect: {
    timeout: 5_000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    // ['list',{printSteps: true}],
    // ['line'],
    // ['dot', { outputFile: `${runOutputDir}/dot-reporter.txt` }],
    // ['html', { outputFolder: `${runOutputDir}/html-report`, open: 'never' }],
    //  ['blob',{ outputFile: `${runOutputDir}/blob-reporter.txt` }],
    // ['json', { outputFile: `${runOutputDir}/json-reporter.json` }],
    // ['junit', { outputFile: `${runOutputDir}/junit-reporter.xml` }],
    // ['./my-awesome-reporter.ts'],
    // ['allure-playwright'],
    ['monocart-reporter', {  
            name: "My Test Report",
            outputFile: './monocart-report/index.html'
        }]
  ],

  outputDir: `${runOutputDir}/artifacts`,
  // Shared settings for all projects
  use: {
    headless: false,
    // Base URL for all tests
    // baseURL: process.env.BASE_URL || 'https://vibetestq-osondemand.orangehrm.com/',
    baseURL: process.env.BASE_URL || 'http://localhost:3000/',
    // Collect trace on first retry
    trace: 'on-first-retry',

    // Capture screenshot on failure
    screenshot: 'only-on-failure',

    // Record video on first retry
    video: 'on-first-retry',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // Default action timeout (ms)
    actionTimeout: 10_000,

    // Default navigation timeout (ms)
    navigationTimeout: 30_000,
    storageState: '.auth/admin.json', // Use the saved auth state for all tests
  },


  // globalSetup: './global-setup.ts',
  // globalTeardown: './global-teardown.ts',

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run start',
    timeout: 120 * 1000,
  },

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: {
        // channel: 'chrome',
        ...devices['Desktop Chrome'],
        // storageState: '.auth/admin.json', // Use the saved auth state for Chromium
      }
    }
  ],
});
