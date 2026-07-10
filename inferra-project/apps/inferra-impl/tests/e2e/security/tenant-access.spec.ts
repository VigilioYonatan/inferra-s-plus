import { expect, test } from "@playwright/test";

test("other tenant cannot read resources without session", async ({
  request,
}) => {
  const id = "00000000-0000-4000-8000-000000000123";
  const response = await request.get(`/api/v1/organizations/${id}/models`);
  expect(response.status()).toBe(401);
});
