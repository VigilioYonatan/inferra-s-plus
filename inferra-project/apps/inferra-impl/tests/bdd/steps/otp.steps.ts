import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";

let response: Response;
Given("a request for passwordless login", () => {});
When("the email address is syntactically invalid", async () => {
  response = await fetch(
    `${process.env.API_TEST_URL || "http://127.0.0.1:3000"}/api/v1/auth/otp/request`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: process.env.APP_ORIGIN || "http://localhost:5173",
      },
      body: JSON.stringify({ email: "invalid-email" }),
    },
  );
});
Then("the API rejects the request with validation error", () =>
  assert.equal(response.status, 400),
);
