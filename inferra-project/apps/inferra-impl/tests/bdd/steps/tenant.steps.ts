import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";

let response: Response;
Given("an anonymous visitor", () => {});
When("the visitor lists models of a random organization", async () => {
  response = await fetch(
    `${process.env.API_TEST_URL || "http://127.0.0.1:3000"}/api/v1/organizations/00000000-0000-4000-8000-000000000123/models`,
  );
});
Then("the API must require authentication", () =>
  assert.equal(response.status, 401),
);
