Feature: API authentication for model serving
  Serving endpoints must never bypass the scoped API key boundary.

  Scenario: Anonymous clients cannot list models
    Given a client without an API credential
    When the client requests the serving model list
    Then model serving responds with unauthorized

  Scenario: Anonymous clients cannot create embeddings
    Given a client without an API credential
    When the client requests embeddings
    Then model serving responds with unauthorized
