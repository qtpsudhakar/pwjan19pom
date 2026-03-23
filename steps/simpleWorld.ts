import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { chromium, expect } from '@playwright/test';
import type { Browser, BrowserContext, Page } from '@playwright/test';

export interface SimpleWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
}

export class SimplePlaywrightWorld extends World implements SimpleWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 500 // Optional: slow down actions for better visibility
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
  }

  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
  }

  // Helper method to navigate
  async navigateTo(url: string): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    await this.page.goto(url);
  }

  // Helper method for waiting
  async waitForPageLoad(): Promise<void> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }
    await this.page.waitForLoadState('load');
  }
}

// Enable this line when using Simple approach (no POM)
setWorldConstructor(SimplePlaywrightWorld);