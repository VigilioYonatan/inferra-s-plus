# 04 — Endpoints, controllers, DTOs, OpenAPI y datos del backend

## Dos APIs con seguridad distinta

1. **Admin `/api/v1/*`:** cookies/sesión y CSRF para UI; endpoints de health solo interna/limitados; Problem Details RFC 9457; OpenAPI 3.1 si stack soporta; Scalar protegido según perfil; registro de `operationId` estable.
2. **Serving `/v1/*`:** `Bearer` API key de org con scope/model, limitación presupuestal y error compatible OpenAI; SSE/JSON; nunca exponer otros endpoints internos del runtime mediante un passthrough abierto.

`GET /v1/models`, `GET /v1/models/{model_id}`, `POST /v1/chat/completions`, `POST /v1/completions`; fase avanzada y condicionada a capacidades: `/v1/embeddings`, `/v1/responses`. Compatibilidad declarada por endpoint/modelo, con contract tests del wire format y eventos SSE.

## Catálogo completo de operaciones

**No duplicar las 163 filas aquí.** Fuente canónica de diseño: `blueprint/02-matriz-endpoints.csv` incluye método/ruta, `operation_id`, módulo, `controller_file`, `service_file`, request DTO, response DTO, permiso, consumidor, `unit_test`, `integration_test`, `api_e2e`, `security_e2e`, `bdd_tests` y fase. `blueprint/architecture-manifest.json` es la fuente de generación del árbol auditado; cuando exista NestJS real la **fuente de verdad runtime** será OpenAPI exportada desde controllers y contratos efectivos.

### Bounded contexts de API

| Bounded context | Controller(s) y responsabilidad |
|---|---|
| Identity | `IdentityController`, `OAuthController`, `SessionsController`, `MfaController`: registro, pass, OTP, MFA, OAuth, sesiones |
| Organizations | `OrganizationsController`, `MembersController`, `InvitationsController`, `AuthorizationController` |
| Credentials | `ApiCredentialsController` |
| Model Management | `ModelCatalogController`, `ModelImportsController`, `ModelDeploymentsController`, `RuntimeProfilesController` |
| Resource | `GpuNodesController`, `SystemController`, `JobsController` |
| Inference | `OpenAiCompatibleController`, `PlaygroundController` |
| Optimization | `RoutingPoliciesController`, `AdmissionControlController`, `QuotasController`, `UsageController`, `BenchmarksController`, `ExperimentsController` |
| Artifacts | `DatasetsController`, `ArtifactsController` |
| Operations | `ObservabilityController`, `CostEstimatesController`, `AuditController`, `AlertsController`, `NotificationsController`, `WebhooksController`, `BackupsController` |

Los nombres concretos de cada archivo `.controller.ts` del blueprint y sus mappings son obligatorios **como trazabilidad propuesta**, no como prohibición de agrupar rutas equivalentes mediante ADR documentado.

## Modelo vertical de una feature

```text
src/modules/model-catalog/
├── model-catalog.module.ts
├── domain/
│   ├── schemas/model.schema.ts
│   ├── policies/model-visibility.policy.ts
│   └── errors/model-not-found.error.ts
├── application/
│   ├── ports/model.repository.port.ts
│   ├── ports/model.repository.token.ts
│   ├── services/register-model.service.ts
│   └── services/list-models.service.ts
├── infrastructure/
│   └── persistence/drizzle/{schema.ts,model.repository.ts}
└── presentation/http/
    ├── controllers/model-catalog.controller.ts
    ├── dto/register-model.request.dto.ts
    ├── dto/list-models.query.dto.ts
    ├── dto/model.response.dto.ts
    └── docs/model.response.doc.ts
```

**Reglas:** `controller` sólo transporte/guard/pipes; application orquesta transacción/ports; domain tiene invariantes; repository filtra tenant; mapper/presenter entrega allowlist de respuesta. No usar `class-validator`, Prisma, TypeORM, Joi, ESLint/Prettier en esta base. No crear repos por tabla ni factories que no tengan comportamiento real.

## Ejemplo ilustrativo: DTO Zod 4 propietario

```ts
// src/modules/identity/presentation/http/dto/verify-email-otp.request.dto.ts
import { z } from 'zod';

export const verifyEmailOtpRequestDto = z.object({
  challenge_id: z.uuid(),
  code: z.string().regex(/^\d{6,8}$/),
}).strict();
export type VerifyEmailOtpRequestDto = z.output<typeof verifyEmailOtpRequestDto>;
```

`verify-email-otp.request.doc.ts` crea el adaptador NestJS/Swagger `*DocDto` sin duplicar tipo, si la integración seleccionada lo requiere. Zod `z.input` representa el wire HTTP cuando hay coerce/transform; `z.output` el objeto validado recibido por servicio. Response DTO deriva con `.pick()` de schema dominio y proyección explícita; nunca devolver una fila Drizzle cruda.

## Ejemplo de service y controller (pseudocódigo de ownership)

```ts
// Application: interfaz semántica y port inyectado (sin dependencias HTTP)
async verifyEmailOtp(command: VerifyOtpCommand): Promise<VerifiedIdentity> {
  const challenge = await this.otpRepository.consumeIfValid(command);
  if (!challenge) throw new InvalidOrExpiredOtpError();
  return this.sessionService.createSession(challenge.user_id);
}

// Presentation: guard, ZodPipe y status; sin SQL ni OAuth directo
@Post('auth/otp/verify')
async verifyEmailOtp(@Body(new ZodPipe(verifyEmailOtpRequestDto)) request: VerifyEmailOtpRequestDto) {
  const result = await this.verifyEmailOtpService.verifyEmailOtp(request);
  return this.sessionPresenter.toHttp(result);
}
```

Fragmento conceptual: el código real debe respetar constructor/DI, decoradores, interceptores, manejador de cookies/CSRF, tipos/schemas del proyecto y tests. No afirmar que este pseudocódigo compila. `verifyEmailOtp` debe consumir en una transacción atómica evitando double-submit.

## HTTP standards y casos límite

- `GET` lectura; `POST` crea o transición semántica, `PATCH` parcial; `202` para trabajos; `204` sin body.
- Paginación administrativa Vigilio `{count,next,previous,results}` como baseline; offset/limit y orden determinista con tie-breaker ID; cursor/keyset solo cuando rendimiento/volumen lo exijan, sin sustituir el formato acordado indiscriminadamente.
- DTO query valida números HTTP en Zod (no convertir de nuevo en Pipe). `null`/`optional`/defaults y límite/orden siempre explícitos. `ETag/If-Match` para edición concurrente si aplica.
- `401` sin credencial; `403` sin scope/permiso; `404` para no revelar recurso cross-tenant si política lo define; `409` transiciones conflictivas; `429` límite; `503` upstream indisponible; `ProblemDetails` sin stacktrace/SQL/secretos.
- `Idempotency-Key`: scope tenant+actor+operación+hash request, almacenamiento response de reintentos y TTL. No convertir POST arbitrario en retry sin deduplicación.
- Endpoint streaming usa SSE con `[DONE]` en contrato OpenAI donde aplique, no colapsa chunked backpressure, maneja disconnection upstream/abort y settlement.
- `@Public()` únicamente en rutas públicas inventariadas; Swagger `@ApiBearerAuth()` documenta pero no autoriza.

## Persistencia y tablas críticas

- Identity: `users`, `external_identities`, `sessions`, `password_reset_challenges`, `otp_challenges`, `mfa_credentials`, `recovery_codes`.
- Access: `organizations`, `organization_members`, `invitations`, `roles`, `permissions`, `policy_bindings`, `api_keys`.
- Models: `models`, `model_revisions`, `model_capabilities`, `model_imports`, `deployments`, `deployment_revisions`, `gpu_nodes`, `gpu_devices`.
- Serving: `inference_requests` (metadata redactada), `quota_limits`, `quota_reservations`, `usage_entries`, `capacity_leases`, `routing_policies`.
- Lab: `benchmark_runs`, `benchmark_scenarios`, `benchmark_results`, `experiments`, `experiment_candidates`, `datasets`, `artifacts`.
- Operations: `audit_events`, `alerts`, `notification_deliveries`, `webhook_subscriptions`, `webhook_deliveries`, `jobs`, `outbox_events`, `processed_events`, `backup_metadata`.

Columnas, constraints e índices definitivos requieren ADR y migrations reales; DB enum/state no se sincroniza con un tipo TS manual duplicado. Insert idempotente y claim transaccional de outbox; soft delete solo cuando legal/negocio lo requiera.
