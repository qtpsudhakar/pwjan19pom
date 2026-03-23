Feature: PIM Comprehensive System Tests
  As a PIM system stakeholder
  I want to ensure the system works end-to-end
  So that I can have confidence in the complete functionality

  Background:
    Given I am logged in to the PIM system

  @smoke @pim @critical
  Scenario: Critical Path Smoke Test (PIM-SMOKE-001)
    Given I am on the dashboard page
    When I navigate to the employee list page
    Then I should see the PIM module is accessible
    And I should see the search form displayed
    And I should see the employee table displayed
    And I should see the add button is visible
    
    When I add a new employee with unique details
    Then the employee should be created successfully
    And I should see "Successfully Saved" message
    
    When I navigate back to employee list
    And I search for the newly created employee
    Then I should be able to find the employee in search results

  @regression @pim
  Scenario: Full Feature Regression Test (PIM-REGRESSION-001)
    Given I am on the dashboard page
    
    When I create a new employee with complete details
    Then the employee should be created successfully
    And I should see "Successfully Saved" message
    
    When I test the search functionality
    Then the search should work correctly
    
    When I test the filter functionality
    Then the filters should work correctly
    
    When I reset all filters
    Then the search form should be cleared

  @integration @pim
  Scenario: Cross-Module Integration Test (PIM-INTEGRATION-001)
    Given I am on the dashboard page
    
    When I navigate to PIM module from dashboard
    And I navigate to employee list
    Then I should be able to access PIM functionality
    
    When I create an employee and verify in search
    Then the integration between modules should work correctly
    
    When I navigate back to the dashboard
    Then I should be able to return to the main dashboard

  @performance @pim
  Scenario: Basic Performance Check (PIM-PERF-001)
    Given I am on the dashboard page
    
    When I measure navigation time to PIM
    Then the navigation should complete in reasonable time
    
    When I measure employee creation time
    Then the creation should complete in reasonable time
    
    When I measure search operation time
    Then the search should complete in reasonable time