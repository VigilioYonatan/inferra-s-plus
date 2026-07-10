Feature: Tenant isolation
  Scenario: An anonymous visitor cannot enumerate organization models
    Given an anonymous visitor
    When the visitor lists models of a random organization
    Then the API must require authentication
