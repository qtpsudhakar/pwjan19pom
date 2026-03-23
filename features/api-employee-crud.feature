Feature: API Employee CRUD Operations
  As an API client
  I want to manage employee records via API
  So that I can integrate with the employee management system

  Background:
    Given I have valid authentication credentials for API access

  @api @post @get
  Scenario: Create New Employee via API
    When I send a POST request to "/employees" with valid employee data
    Then I should receive a 201 status code
    And the response should contain the created employee with generated ID
    And the employee should have the correct field values
    And the response should include createdAt timestamp

  @api @post
  Scenario: Create Employee - Missing Required Field
    When I send a POST request to "/employees" without email field
    Then I should receive a 400 status code
    And the error should be "Validation failed"
    And the details should contain "email is required"

  @api @post
  Scenario: Create Employee - Invalid Department
    When I send a POST request to "/employees" with invalid department "Sales"
    Then I should receive a 400 status code
    And the error details should contain "department must be one of"

  @api @post
  Scenario: Create Employee - Duplicate Email
    Given I have created an employee with a specific email
    When I try to create another employee with the same email
    Then I should receive a 400 status code
    And the error details should contain "email already exists"

  @api @get
  Scenario: Get All Employees
    When I send a GET request to "/employees"
    Then I should receive a 200 status code
    And the response should be an array

  @api @get
  Scenario: Get Employees with Department Filter
    Given I have created an employee in "Engineering" department
    When I send a GET request to "/employees?department=Engineering"
    Then I should receive a 200 status code
    And all returned employees should be from "Engineering" department

  @api @get
  Scenario: Get Employees - Case Sensitive Department Filter
    When I send a GET request to "/employees?department=engineering"
    Then I should receive a 200 status code
    And the response should be an empty array

  @api @get
  Scenario: Get Employee by ID
    Given I have created an employee via API
    When I send a GET request to "/employees/{employeeId}"
    Then I should receive a 200 status code
    And the response should contain the correct employee details

  @api @get
  Scenario: Get Employee by Non-existent ID
    When I send a GET request to "/employees/emp-999"
    Then I should receive a 404 status code
    And the error message should be "Employee not found"

  @api @put @patch
  Scenario: Update Employee with PUT - Complete Update
    Given I have created an employee via API
    When I send a PUT request to update the employee with all fields
    Then I should receive a 200 status code
    And the employee should be updated with new values
    And the createdAt timestamp should remain unchanged

  @api @put
  Scenario: Update Employee with PUT - Missing Fields
    Given I have created an employee via API
    When I send a PUT request with only role field
    Then I should receive a 400 status code
    And the error should be "Validation failed"

  @api @put
  Scenario: Update Non-existent Employee with PUT
    When I send a PUT request to "/employees/emp-999" with complete data
    Then I should receive a 404 status code

  @api @patch
  Scenario: Update Employee with PATCH - Partial Update
    Given I have created an employee via API
    When I send a PATCH request to update only the role field
    Then I should receive a 200 status code
    And only the role field should be updated
    And all other fields should remain unchanged

  @api @patch
  Scenario: Update Employee with PATCH - Invalid Department
    Given I have created an employee via API
    When I send a PATCH request with invalid department "Quantum Physics"
    Then I should receive a 400 status code
    And the error details should contain "department must be one of"

  @api @patch
  Scenario: Update Non-existent Employee with PATCH
    When I send a PATCH request to "/employees/emp-999" with role data
    Then I should receive a 404 status code

  @api @delete
  Scenario: Delete Employee
    Given I have created an employee via API
    When I send a DELETE request to "/employees/{employeeId}"
    Then I should receive a 204 status code
    And the employee should no longer exist
    When I try to GET the deleted employee
    Then I should receive a 404 status code

  @api @delete
  Scenario: Delete Non-existent Employee
    When I send a DELETE request to "/employees/emp-999"
    Then I should receive a 404 status code
    And the error message should be "Employee not found"

  @api @delete
  Scenario: Delete Employee Twice
    Given I have created and deleted an employee via API
    When I try to delete the same employee again
    Then I should receive a 404 status code

  @api @delete
  Scenario: Verify Employee Removed from List After Delete
    Given I have created an employee via API
    When I delete the employee
    And I get the list of all employees
    Then the deleted employee should not appear in the list