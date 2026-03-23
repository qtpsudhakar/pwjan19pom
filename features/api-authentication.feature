Feature: API Authentication Methods
  As an API client
  I want to authenticate using various methods
  So that I can securely access the API endpoints

  @api @auth
  Scenario: JWT Token Authentication - Valid Login
    When I send a POST request to "/auth/login" with valid credentials
    Then I should receive a 200 status code
    And the response should contain a valid JWT token
    And the token should be of type string

  @api @auth
  Scenario: JWT Token Authentication - Invalid Credentials
    When I send a POST request to "/auth/login" with invalid credentials
    Then I should receive a 401 status code
    And the error message should be "Invalid credentials"

  @api @auth
  Scenario: JWT Token Authentication - Missing Credentials
    When I send a POST request to "/auth/login" with missing password
    Then I should receive a 400 status code
    And the error message should be "username and password are required"

  @api @auth
  Scenario: Protected Endpoint with Valid JWT Token
    Given I have a valid JWT token
    When I send a GET request to "/employees" with the token
    Then I should receive a 200 status code

  @api @auth
  Scenario: Protected Endpoint without Token
    When I send a GET request to "/employees" without authorization
    Then I should receive a 401 status code
    And the error message should be "Missing or invalid Authorization header"

  @api @oauth
  Scenario: OAuth Token Generation - Valid Client Credentials
    When I request an OAuth token with valid client credentials
    Then I should receive a 200 status code
    And the response should contain an access token
    And the token type should be "Bearer"
    And the expires_in should be 3600

  @api @oauth
  Scenario: OAuth Token Generation - Invalid Client
    When I request an OAuth token with invalid client credentials
    Then I should receive a 401 status code
    And the error should be "invalid_client"

  @api @oauth
  Scenario: OAuth Protected Endpoint Access
    Given I have a valid OAuth access token
    When I send a GET request to "/oauth/employees" with the token
    Then I should receive a 200 status code
    And the response should be an array

  @api @basicauth
  Scenario: Basic Authentication - Valid Credentials
    When I send a GET request to "/basic/employees" with valid Basic Auth
    Then I should receive a 200 status code
    And the response should be an array

  @api @basicauth
  Scenario: Basic Authentication - Invalid Credentials
    When I send a GET request to "/basic/employees" with invalid Basic Auth
    Then I should receive a 401 status code
    And the error message should be "Invalid credentials"

  @api @session
  Scenario: Session Authentication - Login and Access
    When I login via session endpoint with valid credentials
    Then I should receive a 200 status code
    And the response should contain "Login successful" message
    And a session cookie should be set
    
    When I access a protected endpoint with the session cookie
    Then I should receive a 200 status code

  @api @session
  Scenario: Session Authentication - Logout
    Given I am logged in via session authentication
    When I logout via session endpoint
    Then I should receive a 200 status code
    And subsequent requests should be unauthorized

  @api @apikey
  Scenario: API Key Authentication - Valid Key
    When I send a GET request to "/apikey/employees" with a valid API key
    Then I should receive a 200 status code

  @api @apikey
  Scenario: API Key Authentication - Missing Key
    When I send a GET request to "/apikey/employees" without an API key
    Then I should receive a 401 status code
    And the error message should be "Missing or invalid API key"

  @api @hmac
  Scenario: HMAC Signature Authentication - Valid Signature
    When I send a GET request to "/hmac/employees" with valid HMAC signature
    Then I should receive a 200 status code

  @api @hmac
  Scenario: HMAC Signature Authentication - Invalid Signature
    When I send a GET request to "/hmac/employees" with invalid HMAC signature
    Then I should receive a 401 status code
    And the error message should be "Invalid signature"

  @api @hmac
  Scenario: HMAC Signature Authentication - Missing Timestamp
    When I send a GET request to "/hmac/employees" without timestamp header
    Then I should receive a 401 status code
    And the error message should be "Missing x-timestamp header"