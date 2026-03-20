# OrangeHRM Comprehensive Test Plan

## Application Overview

OrangeHRM is a comprehensive Human Resource Management System with multiple modules including Dashboard, Admin (user management, job configuration), PIM (Personnel Information Management), Leave Management, Time Tracking, Recruitment, Performance Management, Directory, and Buzz (social features). The application requires authentication and provides role-based access to different functionality areas.

## Test Scenarios

### 1. Login & Authentication

**Seed:** `tests/seed.spec.ts`

#### 1.1. Valid Login

**File:** `tests/login.spec.ts`

**Steps:**
  1. Navigate to login page
    - expect: Login form is displayed with username, password fields and login button
  2. Enter valid credentials (testadmin / Vibetestq@123)
    - expect: Credentials are accepted
    - expect: Dashboard page is displayed
    - expect: User is redirected to /dashboard/index

#### 1.2. Invalid Login - Wrong Password

**File:** `tests/login.spec.ts`

**Steps:**
  1. Enter username 'testadmin' and invalid password 'wrongpass'
    - expect: Error message is displayed
    - expect: User remains on login page

#### 1.3. Invalid Login - Empty Fields

**File:** `tests/login.spec.ts`

**Steps:**
  1. Click login button with empty username and password
    - expect: Required field validation messages are shown
    - expect: Login is prevented

#### 1.4. Forgot Password Link

**File:** `tests/login.spec.ts`

**Steps:**
  1. Click 'Forgot your password?' link
    - expect: User is redirected to password reset page

### 2. Dashboard

**Seed:** `tests/seed.spec.ts`

#### 2.1. Dashboard Widgets Display

**File:** `tests/dashboard.spec.ts`

**Steps:**
  1. Navigate to dashboard after login
    - expect: All dashboard widgets are displayed: Time at Work, My Actions, Quick Launch, Buzz Latest Posts, Employees on Leave Today, Employee Distribution widgets

#### 2.2. Navigation Menu Visibility

**File:** `tests/dashboard.spec.ts`

**Steps:**
  1. Check sidebar navigation menu
    - expect: All modules are visible: Admin, PIM, Leave, Time, Recruitment, My Info, Performance, Dashboard, Directory, Maintenance, Claim, Buzz

#### 2.3. Profile Dropdown

**File:** `tests/dashboard.spec.ts`

**Steps:**
  1. Click on profile dropdown in top right
    - expect: User profile menu options are displayed

### 3. Admin Module

**Seed:** `tests/seed.spec.ts`

#### 3.1. System Users List

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Navigate to Admin > User Management > System Users
    - expect: System users table is displayed
    - expect: Search form has Username, User Role, Employee Name, Status fields
    - expect: Add button is visible

#### 3.2. Search System Users

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Enter search criteria and click Search button
    - expect: Filtered results are displayed in table
    - expect: Search filters work correctly

#### 3.3. User Role Dropdown Options

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Click User Role dropdown
    - expect: Options displayed: Admin, ESS

#### 3.4. Status Dropdown Options

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Click Status dropdown
    - expect: Options displayed: Enabled, Disabled

#### 3.5. Add New System User

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Click Add button to create new system user
    - expect: Add system user form is displayed
    - expect: Form contains required fields for user creation

#### 3.6. Job Titles Management

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Navigate to Admin > Job > Job Titles
    - expect: Job Titles page is displayed
    - expect: Job titles table and Add button are visible

#### 3.7. Job Module Navigation

**File:** `tests/admin.spec.ts`

**Steps:**
  1. Click Job in admin top navigation
    - expect: Dropdown shows: Job Titles, Pay Grades, Employment Status, Job Categories, Work Shifts

### 4. PIM (Employee Management)

**Seed:** `tests/seed.spec.ts`

#### 4.1. Employee List Display

**File:** `tests/pim.spec.ts`

**Steps:**
  1. Navigate to PIM > Employee List
    - expect: Employee Information search form is displayed
    - expect: Search fields include: Employee Name, Employee Id, Employment Status, Include, Supervisor Name, Job Title, Sub Unit
    - expect: Employee table is displayed
    - expect: Add button is visible

#### 4.2. Employee Search Functionality

**File:** `tests/pim.spec.ts`

**Steps:**
  1. Use various search filters and click Search
    - expect: Search results are filtered correctly
    - expect: Reset button clears all filters

#### 4.3. Add Employee Form Validation

**File:** `tests/addemployee.spec.ts`

**Steps:**
  1. Navigate to PIM > Add Employee
    - expect: Add Employee form displays with: Profile picture upload, First Name* (required), Middle Name, Last Name, Employee Id (auto-generated), Create Login Details checkbox
    - expect: Save and Cancel buttons are present

#### 4.4. Add Employee - Valid Data

**File:** `tests/addemployee.spec.ts`

**Steps:**
  1. Fill required fields (First Name, Last Name) and click Save
    - expect: Employee is created successfully
    - expect: Success message is displayed
    - expect: Employee appears in employee list

#### 4.5. Add Employee - Missing Required Fields

**File:** `tests/addemployee.spec.ts`

**Steps:**
  1. Click Save without filling First Name
    - expect: Required field validation error is displayed
    - expect: Employee is not created

#### 4.6. Add Employee with Login Details

**File:** `tests/addemployee.spec.ts`

**Steps:**
  1. Fill employee details, check 'Create Login Details', and fill login credentials
    - expect: Employee is created with login access
    - expect: Login credentials are set up correctly

#### 4.7. Profile Picture Upload

**File:** `tests/addemployee.spec.ts`

**Steps:**
  1. Click Choose File and upload a valid image (jpg/png/gif under 1MB)
    - expect: Image is uploaded successfully
    - expect: Profile picture preview is displayed

#### 4.8. PIM Reports Access

**File:** `tests/pim.spec.ts`

**Steps:**
  1. Navigate to PIM > Reports
    - expect: Reports section is accessible
    - expect: Available reports are displayed

### 5. Leave Management

**Seed:** `tests/seed.spec.ts`

#### 5.1. Leave Period Configuration

**File:** `tests/leave.spec.ts`

**Steps:**
  1. Navigate to Leave module (lands on Define Leave Period)
    - expect: Leave Period form displays with Start Month* and Start Date* dropdowns
    - expect: End Date is auto-calculated
    - expect: form shows required field validation

#### 5.2. Leave Period Setup - Valid Data

**File:** `tests/leave.spec.ts`

**Steps:**
  1. Select Start Month (January) and Start Date (01), then click Save
    - expect: Leave period is configured successfully
    - expect: End Date shows December 31

#### 5.3. Leave Period Setup - Missing Required Fields

**File:** `tests/leave.spec.ts`

**Steps:**
  1. Click Save without selecting required fields
    - expect: Required field validation errors are displayed
    - expect: Configuration is not saved

#### 5.4. Leave Period Reset

**File:** `tests/leave.spec.ts`

**Steps:**
  1. Fill form and click Reset button
    - expect: All form fields are cleared to default state

### 6. Recruitment

**Seed:** `tests/seed.spec.ts`

#### 6.1. Candidates List Display

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Navigate to Recruitment > Candidates
    - expect: Candidates search form displays with filters: Job Title, Vacancy, Hiring Manager, Status, Candidate Name, Keywords, Date of Application (From/To), Method of Application
    - expect: Candidates table is displayed
    - expect: Add button is visible

#### 6.2. Candidate Search Functionality

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Use various search filters and click Search
    - expect: Search results are filtered correctly
    - expect: Reset button clears all search filters

#### 6.3. Add New Candidate

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Click Add button to create new candidate
    - expect: Add candidate form is displayed
    - expect: Form contains required fields for candidate information

#### 6.4. Vacancies List Display

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Navigate to Recruitment > Vacancies
    - expect: Vacancies search form displays with filters: Job Title, Vacancy, Hiring Manager, Status
    - expect: Vacancies table is displayed
    - expect: Add button is visible

#### 6.5. Vacancy Search Functionality

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Use search filters and click Search
    - expect: Search results are filtered correctly
    - expect: Reset button clears search filters

#### 6.6. Add New Vacancy

**File:** `tests/recruitment.spec.ts`

**Steps:**
  1. Click Add button to create new job vacancy
    - expect: Add vacancy form is displayed
    - expect: Form contains required fields for job posting

### 7. Time Management

**Seed:** `tests/seed.spec.ts`

#### 7.1. Timesheet Period Configuration

**File:** `tests/time.spec.ts`

**Steps:**
  1. Navigate to Time module (Define Timesheet Period)
    - expect: Define Timesheet Period form displays
    - expect: First Day of the Week* dropdown is present and required
    - expect: Save button is available

#### 7.2. Timesheet Period Setup - Valid Selection

**File:** `tests/time.spec.ts`

**Steps:**
  1. Select First Day of the Week and click Save
    - expect: Timesheet period is configured successfully
    - expect: Setting is saved

#### 7.3. Timesheet Period Setup - Missing Required Field

**File:** `tests/time.spec.ts`

**Steps:**
  1. Click Save without selecting First Day of the Week
    - expect: Required field validation error is displayed
    - expect: Configuration is not saved

### 8. Performance Management

**Seed:** `tests/seed.spec.ts`

#### 8.1. Employee Reviews List

**File:** `tests/performance.spec.ts`

**Steps:**
  1. Navigate to Performance > Manage Reviews
    - expect: Employee Reviews search form displays with filters: Employee Name, Job Title, Sub Unit, Include, Review Status, From Date, To Date
    - expect: Reviews table is displayed
    - expect: Date fields pre-populated with current year range

#### 8.2. Performance Review Search

**File:** `tests/performance.spec.ts`

**Steps:**
  1. Use various search filters and click Search
    - expect: Search results are filtered correctly
    - expect: Reset button clears all filters
    - expect: Date range filtering works correctly

#### 8.3. Performance Module Navigation

**File:** `tests/performance.spec.ts`

**Steps:**
  1. Check top navigation options in Performance module
    - expect: Navigation shows: Configure, Manage Reviews, My Trackers, Employee Trackers

### 9. Directory

**Seed:** `tests/seed.spec.ts`

#### 9.1. Employee Directory Search

**File:** `tests/directory.spec.ts`

**Steps:**
  1. Navigate to Directory
    - expect: Directory search form displays with filters: Employee Name, Job Title, Location
    - expect: Reset and Search buttons are available

#### 9.2. Directory Search Functionality

**File:** `tests/directory.spec.ts`

**Steps:**
  1. Use search filters and click Search
    - expect: Search results are displayed or 'No Records Found' message appears
    - expect: Reset button clears search filters

#### 9.3. Directory Empty State

**File:** `tests/directory.spec.ts`

**Steps:**
  1. Load directory with no employees
    - expect: 'No Records Found' message is displayed appropriately

### 10. Buzz Social Features

**Seed:** `tests/seed.spec.ts`

#### 10.1. Buzz Newsfeed Display

**File:** `tests/buzz.spec.ts`

**Steps:**
  1. Navigate to Buzz
    - expect: Buzz Newsfeed section is displayed
    - expect: Post creation area shows profile picture, 'What's on your mind?' text box and Post button
    - expect: Share Photos and Share Video buttons are visible
    - expect: Post filtering options are available: Most Recent Posts, Most Liked Posts, Most Commented Posts
    - expect: Upcoming Anniversaries section is displayed

#### 10.2. Create New Post

**File:** `tests/buzz.spec.ts`

**Steps:**
  1. Enter text in 'What's on your mind?' and click Post
    - expect: Post is created successfully
    - expect: New post appears in newsfeed

#### 10.3. Share Photos Feature

**File:** `tests/buzz.spec.ts`

**Steps:**
  1. Click Share Photos button
    - expect: Photo sharing interface is displayed
    - expect: File upload functionality is available

#### 10.4. Share Video Feature

**File:** `tests/buzz.spec.ts`

**Steps:**
  1. Click Share Video button
    - expect: Video sharing interface is displayed
    - expect: Video upload/embed functionality is available

#### 10.5. Post Filtering

**File:** `tests/buzz.spec.ts`

**Steps:**
  1. Click different post filter buttons (Most Recent, Most Liked, Most Commented)
    - expect: Posts are filtered according to selected criteria
    - expect: Filter buttons show active state when selected
