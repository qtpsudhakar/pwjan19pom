Feature: Employee Search and Filtering
  As a PIM system user
  I want to search and filter employee records
  So that I can quickly find specific employees

  Background:
    Given I am logged in to the PIM system
    And I am on the employee list page

  @smoke @pim @search @ci
  Scenario: Display Employee List (TC-PIM-001)
    Then I should see the search form displayed
    And I should see the employee table displayed
    And I should see the add button is visible

  @smoke @pim @search
  Scenario: Search Employee by Name (TC-PIM-002)
    When I search for employee by name "Test Employee"
    Then I should see search results displayed

  @smoke @pim @search
  Scenario: Search Employee by ID (TC-PIM-003)
    When I search for employee by ID "0001"
    Then I should see search results displayed

  @pim @search
  Scenario: Search with No Results (TC-PIM-004)
    When I search for employee by name "NonExistent Employee"
    Then I should see "No Records Found" message

  @pim @search
  Scenario: Reset Search Filters (TC-PIM-005)
    Given I have entered search criteria
    When I reset all filters
    Then the search form should be cleared
    And I should see the search form displayed

  @pim @search
  Scenario: Employment Status Filter (TC-PIM-006) #FIXME
    When I select employment status "Full-Time Permanent"
    And I click search button
    Then I should see search results displayed

  @pim @search
  Scenario: Include Filter Functionality (TC-PIM-007)
    When I select include filter "Current and Past Employees"
    And I click search button
    Then I should see search results displayed

  @pim @search @datadriven
  Scenario Outline: Data-Driven Search Tests (TC-PIM-015)
    When I search by "<searchType>" with value "<searchValue>"
    Then I should see "<expectedResult>"

    Examples:
      | searchType   | searchValue      | expectedResult    |
      | employeeName | Test Employee    | search results    |
      | employeeId   | 0001            | search results    |
      | employeeName | NonExistent     | no records found  |
      | employeeName | Partial Name    | search results    |

  @pim @search
  Scenario: Multiple Filter Combination Search (TC-PIM-016)
    When I enter employee name "Test"
    And I select include filter "Current and Past Employees"
    And I click search button
    Then I should see search results or no results message
    When I reset all filters
    Then the search form should be cleared

  @smoke @employee
  Scenario: Basic Employee Search
    When I search for employee "John"
    Then I should see relevant search results