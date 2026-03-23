Feature: User Authentication
  As a user of the PIM system
  I want to authenticate with valid credentials
  So that I can access the system securely

  Background:
    Given I navigate to the login page

  @smoke @login @ci
  Scenario: Valid Login
    When I login with valid credentials "testadmin" and "Vibetestq@123"
    Then I should be redirected to the dashboard page
    And I should see the dashboard page exists

  @login
  Scenario: Invalid Login
    When I login with invalid credentials "invaliduser" and "invalidpassword"
    Then I should see an error message for invalid credentials