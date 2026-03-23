import { Before, After, BeforeAll, AfterAll } from '@cucumber/cucumber';
import { CustomPlaywrightWorld } from './world';

// Hooks for Playwright setup and teardown

BeforeAll(async function () {
  // Global setup before all tests
  console.log('Starting Cucumber test suite with Playwright');
});

AfterAll(async function () {
  // Global cleanup after all tests
  console.log('Cucumber test suite completed');
});

Before(async function (this: CustomPlaywrightWorld) {
  // Initialize Playwright browser and page objects before each scenario
  await this.init();
});

After(async function (this: CustomPlaywrightWorld) {
  // Clean up browser and page objects after each scenario
  await this.cleanup();
});