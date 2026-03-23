Feature: Employee Profile Management
  As a PIM system user
  I want to view and manage employee profiles
  So that I can maintain detailed employee information

  Background:
    Given I am logged in to the PIM system
    And I am on the employee list page

  @smoke @pim @profile
  Scenario: View Employee Profile Details (TC-PIM-017)
    Given I search for an existing employee "Test"
    When I click on the first employee in results
    Then I should see the profile header displayed
    And I should see the personal details tab displayed
    And I should see all tabs are accessible

  @smoke @pim @profile
  Scenario: Edit Employee Personal Details (TC-PIM-018)
    Given I search for an existing employee "Test"
    And I navigate to the employee profile page
    When I click the edit button
    Then I should be in edit mode
    When I save the changes
    Then the changes should be saved successfully

  @pim @profile
  Scenario: Navigate Between Profile Tabs (TC-PIM-019)
    Given I search for an existing employee "Test"
    And I navigate to the employee profile page
    When I navigate through all profile tabs
    Then each tab should be accessible with verification
    When I navigate back to personal details tab
    Then I should see the personal details tab displayed

  @pim @profile
  Scenario: Employee Profile Validation (TC-PIM-020)
    Given I create a new test employee
    When I view the employee profile
    Then the profile information should be displayed correctly
    And I should see the profile header displayed