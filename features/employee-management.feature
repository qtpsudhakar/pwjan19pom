Feature: Employee Management
  As a PIM system user
  I want to manage employee records
  So that I can maintain accurate personnel information

  Background:
    Given I am logged in to the PIM system
    And I am on the dashboard page

  @smoke @pim @employee @crud @ci
  Scenario: Add Employee - Required Fields Only (TC-PIM-008)
    Given I navigate to the employee list page
    When I click on add employee button
    And I enter employee details with required fields only
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

  @smoke @pim
  Scenario: Add Employee - All Personal Details (TC-PIM-009)
    Given I navigate to the employee list page
    When I click on add employee button
    And I enter first name and last name
    And I save the employee
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

  @smoke @pim
  Scenario: Add Employee with Login Details (TC-PIM-010)
    Given I navigate to the employee list page
    When I click on add employee button
    And I enter employee details with login credentials
    And I save the employee
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

  @pim
  Scenario: Add Employee - Profile Picture Upload (TC-PIM-011)
    Given I navigate to the employee list page
    When I click on add employee button
    And I enter employee details with profile picture
    And I save the employee
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

  @smoke @pim
  Scenario: Required Field Validation (TC-PIM-012)
    Given I navigate to the employee list page
    And I click on add employee button
    When I try to save without entering required fields
    Then the form validation should prevent submission
    And I should see required field validation errors

  @pim
  Scenario: Invalid Profile Picture Upload (TC-PIM-013)
    Given I navigate to the employee list page
    When I click on add employee button
    And I try to upload an invalid profile picture
    Then I should see an error message for invalid file format

  @pim
  Scenario: Duplicate Employee ID Handling (TC-PIM-014)
    Given I navigate to the employee list page
    And I have created an employee with a specific ID
    When I try to create another employee with the same ID
    Then I should see an error message for duplicate employee ID

  @smoke @employee @ci
  Scenario: Basic Employee Creation
    Given I navigate to the employee list page
    When I add a new employee with name "John" "Doe"
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

  @pim @employee @datadriven
  Scenario Outline: Data-Driven Employee Creation
    Given I navigate to the employee list page
    When I create an employee with first name "<firstName>" and last name "<lastName>"
    Then the employee should be created successfully
    And I should see "Successfully Saved" message

    Examples:
      | firstName | lastName |
      | Alice     | Johnson  |
      | Bob       | Smith    |
      | Charlie   | Brown    |