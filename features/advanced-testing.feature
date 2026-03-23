Feature: Advanced Testing Capabilities
  As a test automation engineer
  I want to test advanced UI interactions
  So that I can ensure complex functionality works correctly

  @advanced @canvas
  Scenario: Read Text from Canvas Element
    Given I navigate to the challenging DOM page
    When I intercept canvas drawing operations
    Then I should be able to capture text drawn on canvas
    And the captured text should match the expected format "Answer: [digits]"
    And I should be able to take a screenshot of the canvas

  @advanced @ocr
  Scenario: Extract Text from Canvas Using OCR
    Given I navigate to the challenging DOM page
    When I take a screenshot of the canvas element
    And I process the image with OCR technology
    Then I should be able to extract text from the image
    And the extracted text should match the pattern "Answer: [digits]"

  @seed
  Scenario: Seed Test for Test Generation
    Given I have a basic test structure
    When I generate test code
    Then the test should be ready for implementation