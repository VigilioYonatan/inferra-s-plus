import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { z } from "zod";
import { createApiKeyRequestDto } from "../modules/api-credentials/presentation/http/dto/create-api-key.request.dto";
import { createBenchmarkRequestDto } from "../modules/benchmarks/presentation/http/dto/create-benchmark.request.dto";
import { authenticatePasswordRequestDto } from "../modules/identity/presentation/http/dto/authenticate-password.request.dto";
import { registerAccountRequestDto } from "../modules/identity/presentation/http/dto/register-account.request.dto";
import { requestEmailOtpRequestDto } from "../modules/identity/presentation/http/dto/request-email-otp.request.dto";
import { verifyEmailOtpRequestDto } from "../modules/identity/presentation/http/dto/verify-email-otp.request.dto";
import { chatCompletionRequestDto } from "../modules/inference/presentation/http/dto/chat-completion.request.dto";
import { registerModelRequestDto } from "../modules/model-catalog/presentation/http/dto/register-model.request.dto";
import { registerDeploymentRequestDto } from "../modules/model-deployments/presentation/http/dto/register-deployment.request.dto";
import { registerOrganizationRequestDto } from "../modules/organizations/presentation/http/dto/register-organization.request.dto";

const requests: Record<string, z.ZodType> = {
  "POST /api/v1/auth/register": registerAccountRequestDto,
  "POST /api/v1/auth/password/login": authenticatePasswordRequestDto,
  "POST /api/v1/auth/otp/request": requestEmailOtpRequestDto,
  "POST /api/v1/auth/otp/verify": verifyEmailOtpRequestDto,
  "POST /api/v1/auth/password/recovery/request": requestEmailOtpRequestDto,
  "POST /api/v1/organizations": registerOrganizationRequestDto,
  "POST /api/v1/organizations/{organization_id}/api-keys":
    createApiKeyRequestDto,
  "POST /api/v1/organizations/{organization_id}/models":
    registerModelRequestDto,
  "POST /api/v1/organizations/{organization_id}/deployments":
    registerDeploymentRequestDto,
  "POST /api/v1/organizations/{organization_id}/benchmarks":
    createBenchmarkRequestDto,
  "POST /api/v1/organizations/{organization_id}/playground/chat":
    chatCompletionRequestDto,
  "POST /v1/chat/completions": chatCompletionRequestDto,
};
export function setupOpenApi(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle("Inferra API")
    .setDescription(
      "Self-hosted control-plane and OpenAI-compatible inference gateway",
    )
    .setVersion("0.1.0")
    .addBearerAuth({ type: "http", scheme: "bearer" }, "apiKey")
    .addCookieAuth(
      "inferra_session",
      { type: "apiKey", in: "cookie", name: "inferra_session" },
      "session",
    )
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controller, method) => `${controller}_${method}`,
  });
  document.openapi = "3.1.0";
  for (const [key, schema] of Object.entries(requests)) {
    const space = key.indexOf(" ");
    const method = key.slice(0, space).toLowerCase();
    const path = key.slice(space + 1);
    const operation = (
      document.paths?.[path] as Record<string, unknown> | undefined
    )?.[method] as { requestBody?: unknown } | undefined;
    if (operation) {
      let jsonSchema: unknown;
      try {
        jsonSchema = z.toJSONSchema(schema);
      } catch {
        jsonSchema = { type: "object" };
      }
      operation.requestBody = {
        required: true,
        content: { "application/json": { schema: jsonSchema } },
      };
    }
  }
  // Kept on private /internal path; public Caddy routes intentionally exclude it.
  SwaggerModule.setup("internal/docs", app, document, {
    jsonDocumentUrl: "internal/openapi.json",
    swaggerOptions: { persistAuthorization: false },
  });

  const scalarHtml = `<!doctype html>
<html lang="en">
  <head>
    <title>Inferra S+ — Scalar API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <script
      id="api-reference"
      type="application/json"
      data-configuration='{"theme":"purple","layout":"modern","hideModels":false}'>
      ${JSON.stringify(document)}
    </script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

  const http = app.getHttpAdapter().getInstance();
  if (http && typeof http.get === "function") {
    http.get(
      "/internal/openapi.json",
      (_req: unknown, res: { json: (data: unknown) => void }) => {
        res.json(document);
      },
    );
    http.get(
      "/openapi.json",
      (_req: unknown, res: { json: (data: unknown) => void }) => {
        res.json(document);
      },
    );
    http.get(
      "/reference",
      (
        _req: unknown,
        res: { type: (t: string) => { send: (body: string) => void } },
      ) => {
        res.type("html").send(scalarHtml);
      },
    );
    http.get(
      "/internal/docs/scalar",
      (
        _req: unknown,
        res: { type: (t: string) => { send: (body: string) => void } },
      ) => {
        res.type("html").send(scalarHtml);
      },
    );
  }
}
