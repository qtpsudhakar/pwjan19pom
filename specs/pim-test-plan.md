# PIM (Employee Management) Test Plan

## Overview
Personnel Information Management (PIM) is a core module in OrangeHRM that handles all employee-related operations including employee records creation, search, updates, and management. This plan covers comprehensive test automation scenarios for the PIM module.

## Module Scope
- Employee List & Search
- Add Employee (Personal Details & Login Creation)
- Employee Profile Management 
- Employee Information Updates
- Employee Reports
- Profile Picture Management
- Employee Status Management

## Test Environment Setup

### Required Page Objects
Following `playwright-pom` skill patterns:

#### 1. `PIMPage.ts` - Main PIM navigation and employee list
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class PIMPage extends BasePage {
    private readonly employeeSearchForm: Locator;
    private readonly employeeNameInput: Locator;
    private readonly employeeIdInput: Locator;
    private readonly employmentStatusDropdown: Locator;
    private readonly includeDropdown: Locator;
    private readonly supervisorNameInput: Locator;
    private readonly jobTitleDropdown: Locator;
    private readonly subUnitDropdown: Locator;
    private readonly searchButton: Locator;
    private readonly resetButton: Locator;
    private readonly addButton: Locator;
    private readonly employeeTable: Locator;
    private readonly recordsFoundText: Locator;
    private readonly noRecordsFoundMessage: Locator;
}
```

#### 2. `AddEmployeePage.ts` - Already exists, may need extension
```typescript
// Extend existing AddEmployeePage with additional methods:
async selectEmploymentStatus(status: string): Promise<void>
async uploadProfilePicture(filePath: string): Promise<void>
async enableCreateLoginDetails(): Promise<void>
async enterLoginCredentials(username: string, password: string): Promise<void>
async verifyProfilePictureUploaded(): Promise<void>
```

#### 3. `EmployeeProfilePage.ts` - Employee details view/edit
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class EmployeeProfilePage extends BasePage {
    private readonly personalDetailsTab: Locator;
    private readonly contactDetailsTab: Locator;
    private readonly emergencyContactsTab: Locator;
    private readonly dependentsTab: Locator;
    private readonly immigrationTab: Locator;
    private readonly jobTab: Locator;
    private readonly salaryTab: Locator;
    private readonly reportToTab: Locator;
    private readonly qualificationsTab: Locator;
    private readonly membershipTab: Locator;
    private readonly editButton: Locator;
    private readonly saveButton: Locator;
    private readonly cancelButton: Locator;
}
```

### Required Test Data Files
Following `playwright-test-patterns` skill for data-driven tests:

#### `test-data/pimEmployeeData.json`
```json
{
  "employees": [
    {
      "firstName": "John",
      "lastName": "Doe",
      "employeeId": "EMP001",
      "createLogin": true,
      "username": "johndoe",
      "password": "Test@123"
    },
    {
      "firstName": "Jane", 
      "lastName": "Smith",
      "middleName": "Mary",
      "employeeId": "EMP002",
      "createLogin": false
    },
    {
      "firstName": "Michael",
      "lastName": "Johnson",
      "employeeId": "EMP003",
      "createLogin": true,
      "username": "mjohnson",
      "password": "Secure@456"
    }
  ],
  "searchCriteria": [
    {
      "type": "employeeName",
      "value": "John Doe",
      "expectedResults": 1
    },
    {
      "type": "employeeId", 
      "value": "EMP001",
      "expectedResults": 1
    },
    {
      "type": "invalidName",
      "value": "NonExistent User",
      "expectedResults": 0
    }
  ]
}
```

#### `test-data/profilePictures.json`
```json
{
  "validImages": [
    {
      "name": "profile1.jpg",
      "path": "./test-data/images/profile1.jpg",
      "size": "500KB",
      "format": "JPEG"
    }
  ],
  "invalidImages": [
    {
      "name": "large_image.jpg", 
      "path": "./test-data/images/large_image.jpg",
      "size": "2MB",
      "expectedError": "File size exceeds limit"
    }
  ]
}
```

## Test Suites

### 1. Employee Search & List Tests
**File:** `tests/pim-employee-search.spec.ts`  
**Tags:** `@smoke @pim @search @ci`

#### Test Cases:

**TC-PIM-001: Display Employee List**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-001' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Navigate to PIM > Employee List
  2. Verify employee search form is displayed with all fields
  3. Verify employee table is displayed
  4. Verify Add button is visible
  5. Verify search and reset buttons are present
- **Expected:** All UI elements render correctly

**TC-PIM-002: Search Employee by Name**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-002' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Enter employee name in search field
  2. Click Search button
  3. Verify filtered results are displayed
  4. Verify search results match entered criteria
- **Expected:** Employee found and displayed in results

**TC-PIM-003: Search Employee by ID**  
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-003' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Enter employee ID in search field
  2. Click Search button
  3. Verify employee record is found
  4. Verify employee details match the ID
- **Expected:** Correct employee record displayed

**TC-PIM-004: Search with No Results**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-004' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Enter non-existent employee name
  2. Click Search button
  3. Verify "No Records Found" message is displayed
  4. Verify empty table state
- **Expected:** No records message shown appropriately

**TC-PIM-005: Reset Search Filters**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-005' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Fill in multiple search criteria
  2. Click Reset button
  3. Verify all search fields are cleared
  4. Verify table shows all employees
- **Expected:** All filters cleared, full employee list shown

**TC-PIM-006: Employment Status Filter**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-006' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Select specific employment status from dropdown
  2. Click Search button  
  3. Verify only employees with that status are shown
  4. Verify filter functionality works correctly
- **Expected:** Results filtered by employment status

**TC-PIM-007: Include Filter Functionality**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-007' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Select "Current and Past Employees" from Include dropdown
  2. Click Search button
  3. Verify both active and inactive employees are shown
  4. Change to "Current Employees Only" and verify filter
- **Expected:** Include filter works correctly

### 2. Add Employee Tests
**File:** `tests/pim-add-employee.spec.ts`  
**Tags:** `@smoke @pim @employee @crud @ci`

#### Test Cases:

**TC-PIM-008: Add Employee - Required Fields Only**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-008' }`  
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Click Add button from Employee List
  2. Fill First Name and Last Name (required)
  3. Verify Employee ID is auto-generated
  4. Click Save button
  5. Verify success message is displayed
  6. Verify employee appears in employee list
- **Expected:** Employee created with minimum required data

**TC-PIM-009: Add Employee - All Personal Details** 
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-009' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Click Add button
  2. Fill First Name, Middle Name, Last Name
  3. Verify Employee ID auto-generation
  4. Click Save button
  5. Verify employee creation success
  6. Navigate to employee profile and verify all details saved
- **Expected:** Employee created with all personal details

**TC-PIM-010: Add Employee with Login Details**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-010' }`
- **Priority:** P1 (Smoke)  
- **Steps:**
  1. Fill employee personal details
  2. Check "Create Login Details" checkbox
  3. Verify login credential fields appear
  4. Fill username and password
  5. Click Save button
  6. Verify employee and login created successfully
- **Expected:** Employee created with system login access

**TC-PIM-011: Add Employee - Profile Picture Upload**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-011' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Fill required employee details  
  2. Click profile picture upload area
  3. Select valid image file (JPG/PNG under 1MB)
  4. Verify image preview is shown
  5. Click Save button
  6. Verify employee created with profile picture
- **Expected:** Profile picture uploaded and saved successfully

**TC-PIM-012: Required Field Validation**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-012' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Click Add button
  2. Leave First Name empty
  3. Click Save button
  4. Verify required field error message
  5. Verify employee is not created
  6. Fill First Name and verify error clears
- **Expected:** Required field validation prevents submission

**TC-PIM-013: Invalid Profile Picture Upload**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-013' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Fill employee details
  2. Attempt to upload invalid file (>1MB or unsupported format)
  3. Verify error message is displayed
  4. Verify upload is rejected
  5. Try with valid image and verify it works
- **Expected:** Invalid files rejected with appropriate error message

**TC-PIM-014: Duplicate Employee ID Handling**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-014' }`
- **Priority:** P2 (Regression)
- **Steps:**
  1. Create employee with specific Employee ID
  2. Attempt to create another employee with same ID
  3. Verify duplicate ID error message
  4. Verify second employee creation is prevented
- **Expected:** Duplicate Employee ID prevented with error message

### 3. Data-Driven Employee Creation Tests
**File:** `tests/pim-add-employee-data-driven.spec.ts`  
**Tags:** `@pim @employee @datadriven @ci`

Following `playwright-test-patterns` data-driven approach:

```typescript
import { test } from '../fixtures/basetest';
import * as employeeData from '../test-data/pimEmployeeData.json';

test.describe('PIM - Data-Driven Employee Creation', { tag: ['@pim', '@employee', '@datadriven'] }, () => {
    
    test.beforeEach(async ({ basePage, loginPage }) => {
        await basePage.navigateTo('/');
        await loginPage.login('testadmin', 'Vibetestq@123');
    });

    test.afterEach(async ({ basePage }) => {
        await basePage.closeBrowser();
    });

    employeeData.employees.forEach((employee, index) => {
        test(`Create Employee: ${employee.firstName} ${employee.lastName}`, 
            { 
                tag: ['@smoke', '@pim'], 
                annotation: [{ type: 'testId', description: `TC-PIM-DD-${index + 1}` }] 
            },
            async ({ dashboardPage, pimPage, addEmployeePage }) => {
                await dashboardPage.verifyDashboardPageExists();
                await dashboardPage.navigateToEmployeeList();
                await pimPage.clickAddEmployee();
                
                if (employee.createLogin) {
                    await addEmployeePage.addEmployeeWithLogin(
                        employee.firstName, 
                        employee.lastName, 
                        employee.username, 
                        employee.password
                    );
                } else {
                    await addEmployeePage.addEmployee(employee.firstName, employee.lastName);
                }
                
                await addEmployeePage.verifySuccessMessage('Successfully Saved');
        });
    });
});
```

### 4. Employee Search Data-Driven Tests  
**File:** `tests/pim-search-data-driven.spec.ts`  
**Tags:** `@pim @search @datadriven`

#### Test Cases:

**TC-PIM-015: Multiple Search Criteria Validation**
- **Data-Driven:** Use `searchCriteria` array from JSON
- **Steps:**
  1. For each search criterion in test data
  2. Enter search value
  3. Click Search button  
  4. Verify expected number of results
  5. Reset filters
- **Expected:** Each search criterion returns expected results

### 5. Employee Profile Management Tests
**File:** `tests/pim-employee-profile.spec.ts`  
**Tags:** `@pim @profile @crud`

#### Test Cases:

**TC-PIM-016: View Employee Profile Details**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-016' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Search and select an employee
  2. Click on employee name to view profile
  3. Verify personal details tab is displayed
  4. Verify all employee information is shown correctly
  5. Verify all profile tabs are accessible
- **Expected:** Employee profile displays complete information

**TC-PIM-017: Edit Employee Personal Details** 
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-017' }`
- **Priority:** P1 (Smoke)
- **Steps:**
  1. Navigate to employee profile
  2. Click Edit button on personal details
  3. Update employee information
  4. Click Save button
  5. Verify changes are saved and displayed
- **Expected:** Employee details updated successfully

**TC-PIM-018: Navigate Between Profile Tabs**
- **Annotation:** `{ type: 'testId', description: 'TC-PIM-018' }`  
- **Priority:** P2 (Regression)
- **Steps:**
  1. Open employee profile
  2. Click through each tab: Personal Details, Contact Details, Emergency Contacts, etc.
  3. Verify each tab loads correctly
  4. Verify tab content is relevant to the section
- **Expected:** All profile tabs function correctly

## Test Execution Strategy

### Smoke Tests (Priority P1)  
Run on each deployment:
- TC-PIM-001, TC-PIM-002, TC-PIM-003
- TC-PIM-008, TC-PIM-009, TC-PIM-010  
- TC-PIM-012, TC-PIM-016, TC-PIM-017

### Regression Tests (Priority P2)
Run on release cycles:  
- All remaining test cases
- Data-driven test suites
- Profile management tests

### Test Tags for Execution

```bash
# Run all PIM tests
npx playwright test --grep @pim

# Run only smoke tests
npx playwright test --grep "@pim and @smoke"

# Run CRUD operations only  
npx playwright test --grep "@pim and @crud"

# Run data-driven tests
npx playwright test --grep "@pim and @datadriven"
```

## Implementation Requirements

### Fixture Updates Needed in `basetest.ts`:
```typescript
pimPage: async ({ page }, use) => {
    await use(new PIMPage(page));
},
employeeProfilePage: async ({ page }, use) => {
    await use(new EmployeeProfilePage(page));
},
```

### Helper Method Extensions:
- `WebHelpers`: Add file upload wrapper method
- `AssertHelpers`: Add table data validation methods  

### Test Data Management:
- Create employee test data with unique identifiers
- Manage test data cleanup between runs
- Handle employee ID generation and conflicts

## Success Criteria
- 100% test automation coverage for core PIM workflows
- All smoke tests pass consistently 
- Data-driven tests cover edge cases and variations
- Tests follow project standards and patterns
- Page objects are reusable across test suites
- Clear test reporting and failure diagnostics