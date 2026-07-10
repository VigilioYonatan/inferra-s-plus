import { expect, test } from "@playwright/test";

test("OpenAI-compatible endpoints require a valid bearer credential", async ({
  request,
}) => {
  for (const path of [
    "/v1/models",
    "/v1/chat/completions",
    "/v1/completions",
    "/v1/embeddings",
  ]) {
    const response = path.endsWith("models")
      ? await request.get(path)
      : await request.post(path, {
          data: {
            model: "qwen",
            prompt: "hi",
            input: "hi",
            messages: [{ role: "user", content: "hi" }],
          },
        });
    expect(
      response.status(),
      `${path} must reject unauthenticated visitors`,
    ).toBe(401);
  }
});
test("invalid API key is denied for serving endpoints", async ({ request }) => {
  const response = await request.post("/v1/embeddings", {
    headers: { Authorization: "Bearer inf_invalid" },
    data: { model: "embed", input: "hello" },
  });
  expect(response.status()).toBe(401);
});
