import { setWorldConstructor, World, IWorldOptions } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AddEmployeePage } from '../pages/AddEmployeePage';
import { EmployeeListPage } from '../pages/EmployeeListPage';
import { PIMPage } from '../pages/PIMPage';
import { EmployeeProfilePage } from '../pages/EmployeeProfilePage';

export interface CustomWorld extends World {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  
  // Page objects - same as in basetest.ts fixtures
  basePage?: BasePage;
  loginPage?: LoginPage;
  dashboardPage?: DashboardPage;
  addEmployeePage?: AddEmployeePage;
  employeeListPage?: EmployeeListPage;
  pimPage?: PIMPage;
  employeeProfilePage?: EmployeeProfilePage;
}

export class CustomPlaywrightWorld extends World implements CustomWorld {
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;
  
  // Page objects
  basePage?: BasePage;
  loginPage?: LoginPage;
  dashboardPage?: DashboardPage;
  addEmployeePage?: AddEmployeePage;
  employeeListPage?: EmployeeListPage;
  pimPage?: PIMPage;
  employeeProfilePage?: EmployeeProfilePage;

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // Initialize page objects - same pattern as basetest.ts
    this.basePage = new BasePage(this.page);
    this.loginPage = new LoginPage(this.page);
    this.dashboardPage = new DashboardPage(this.page);
    this.addEmployeePage = new AddEmployeePage(this.page);
    this.employeeListPage = new EmployeeListPage(this.page);
    this.pimPage = new PIMPage(this.page);
    this.employeeProfilePage = new EmployeeProfilePage(this.page);
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
}

// Enable this line when using POM approach (with page objects)
// setWorldConstructor(CustomPlaywrightWorld);