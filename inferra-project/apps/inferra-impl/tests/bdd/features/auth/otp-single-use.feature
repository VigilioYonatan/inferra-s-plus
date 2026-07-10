Feature: Passwordless email authentication
  As a member I must not reuse a previously accepted OTP
  Scenario: Passwordless request does not leak whether an account exists
    Given a request for passwordless login
    When the email address is syntactically invalid
    Then the API rejects the request with validation error
