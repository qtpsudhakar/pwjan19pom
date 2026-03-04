import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration file.
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Directory containing the tests
  testDir: './tests',

  // Glob pattern to match test files
  testMatch: '**/*.spec.ts',

  // Maximum time one test can run for (ms)
  timeout: 30_000,

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
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // Shared settings for all projects
  use: {
    headless:false,
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://vibetestq-osondemand.orangehrm.com/',

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
  },

  // Output directory for test artifacts
  outputDir: 'test-results/',

  // Browser projects
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    }
  ],
});
