import assert from "node:assert/strict";
import { Given, Then, When } from "@cucumber/cucumber";

let response: Response;
const base = process.env.API_TEST_URL || "http://127.0.0.1:3000";
Given("a client without an API credential", () => {});
When("the client requests the serving model list", async () => {
  response = await fetch(`${base}/v1/models`);
});
When("the client requests embeddings", async () => {
  response = await fetch(`${base}/v1/embeddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "embed", input: "hello" }),
  });
});
Then("model serving responds with unauthorized", () =>
  assert.equal(response.status, 401),
);
