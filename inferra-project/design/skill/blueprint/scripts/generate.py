#!/usr/bin/env python3
"""Genera documentación estática del diseño objetivo; NO crea una aplicación ejecutable."""
from __future__ import annotations
import csv
import hashlib
import json
import re
from pathlib import Path
from collections import Counter, defaultdict

OUT = Path(__file__).resolve().parents[1]
SOURCE = OUT / 'sources/inferra-mapa-apis-y-paginas-senior.md'
FILES_SOURCE = OUT / 'sources/inferra-arquitectura-archivos-senior.md'
ORIG_SOURCE = OUT / 'sources/arquitectura-inference-platform-senior.md'
text = SOURCE.read_text(encoding='utf-8')

# phase, domain schemas, policies and specialized integration pieces
MOD = {
 'identity':('M1','user identity-provider session otp-challenge mfa-device password-reset'.split(), 'social-account-link login-risk sensitive-action'.split(), 'smtp-mailer google-oidc facebook-oauth argon2id-password otp-hash session-cookie'.split()),
 'organizations':('M1','organization member invitation'.split(),'last-owner-protection invitation-acceptance'.split(),'member-mailer'.split()),
 'authorization':('M1','role permission policy-binding'.split(),'tenant-boundary resource-permission anti-privilege-escalation'.split(),[]),
 'api-credentials':('M2','api-key api-key-scope'.split(),'api-key-visibility api-key-rotation'.split(),'token-hasher'.split()),
 'model-catalog':('M2','model model-revision model-capability model-license'.split(),'manifest-validity model-visibility'.split(),'model-license-validator'.split()),
 'model-imports':('M3','model-import import-job'.split(),'trusted-model-source'.split(),'allowlisted-model-downloader'.split()),
 'model-deployments':('M2','deployment deployment-revision runtime-profile'.split(),'deployment-compatibility state-transitions'.split(),'approved-runtime-provisioner vllm-health'.split()),
 'gpu-nodes':('M3','gpu-node gpu-device gpu-capacity'.split(),'node-drain-eligibility'.split(),'dcgm-metrics-reader'.split()),
 'inference':('M2','inference-request inference-result model-capability'.split(),'model-invocation-access data-handling'.split(),'vllm-openai vllm-sse-decoder upstream-http'.split()),
 'playground':('M2','playground-session playground-message'.split(),'session-model-access'.split(),'generation-stream'.split()),
 'request-routing':('S+','routing-policy routing-route'.split(),'healthy-route-selection fallback-eligibility'.split(),'runtime-health-monitor'.split()),
 'admission-control':('M2','admission-decision capacity-lease'.split(),'tenant-fairness overload-response'.split(),'capacity-lease-store'.split()),
 'quotas':('M2','quota token-reservation'.split(),'atomic-reservation budget-settlement'.split(),'postgres-reservation-store'.split()),
 'usage-ledger':('M2','usage-entry inference-request-summary'.split(),'usage-redaction'.split(),'usage-aggregator'.split()),
 'observability-queries':('M3','latency-summary error-summary metrics-overview'.split(),'metrics-visibility'.split(),'prometheus-query'.split()),
 'cost-estimates':('M3','cost-assumption estimated-cost'.split(),'cost-estimate-labeling'.split(),'cost-calculator'.split()),
 'benchmarks':('S+','benchmark-run benchmark-workload benchmark-result'.split(),'benchmark-reproducibility concurrency-limit'.split(),'benchmark-runner artifact-export'.split()),
 'experiments':('S+','experiment candidate promotion'.split(),'promotion-gate rollback-eligibility'.split(),'experiment-compare'.split()),
 'datasets':('S+','dataset dataset-revision'.split(),'dataset-license dataset-validation'.split(),'dataset-parser'.split()),
 'artifacts':('S+','artifact upload-session download-grant'.split(),'object-quarantine upload-quota'.split(),'rustfs-s3 clamav-scanner'.split()),
 'audit':('M3','audit-event audit-export'.split(),'audit-immutability audit-redaction'.split(),'audit-exporter'.split()),
 'alerts':('M3','alert alert-acknowledgement'.split(),'alert-visibility'.split(),'alertmanager-adapter'.split()),
 'notifications':('M3','notification-channel notification-delivery'.split(),'notification-channel-ownership'.split(),'smtp-notification'.split()),
 'webhooks':('S+','webhook webhook-delivery'.split(),'webhook-egress webhook-signature'.split(),'safe-webhook-sender'.split()),
 'system':('M1','system-capability instance-setting system-state'.split(),'instance-access'.split(),'readiness-probe'.split()),
 'jobs':('M3','system-job job-event'.split(),'job-detail-redaction'.split(),'bullmq-job-reader'.split()),
 'backups':('M3','backup-record backup-check'.split(),'backup-owner-approval restore-cli-only'.split(),'pgbackrest-status'.split()),
}

BDD = {
 'identity': ['auth/otp-single-use.feature','auth/social-provider-linking.feature','auth/session-refresh-reuse.feature','auth/mfa-step-up.feature'],
 'organizations':['organization/invitation-last-owner.feature'],
 'authorization':['security/tenant-authorization.feature'],
 'api-credentials':['security/api-key-rotation.feature'],
 'model-deployments':['runtime/deployment-transitions.feature'],
 'inference':['inference/stream-abort-settlement.feature'],
 'playground':['inference/playground-session-access.feature'],
 'request-routing':['optimization/fair-routing.feature'],
 'admission-control':['optimization/fair-routing.feature','optimization/concurrency-budget.feature'],
 'quotas':['optimization/concurrency-budget.feature'],
 'usage-ledger':['inference/stream-abort-settlement.feature'],
 'benchmarks':['benchmark/reproducible-comparison.feature'],
 'experiments':['benchmark/promotion-rollback.feature'],
 'artifacts':['storage/quarantine-before-download.feature'],
 'webhooks':['security/webhook-ssrf.feature'],
 'backups':['operations/backup-restore-drill.feature'],
}

# Application actions in the authenticated admin API and OpenAI-compatible API.
def kebab(s: str) -> str:
    return re.sub(r'(?<!^)(?=[A-Z])','-',s).lower().replace('_','-')

sec = text.split('## 2. Arquitectura de páginas')[0]
raw_ep=[]
heading=''
for line in sec.splitlines():
    if re.match(r'^### 1\.\d+', line): heading=line.strip('# ').strip()
    if re.match(r'^\| (GET|POST|PATCH|PUT|DELETE) \|',line):
        cols=[c.strip() for c in line.split('|')[1:-1]]
        assert len(cols)==6, cols
        raw_ep.append(dict(method=cols[0],path=cols[1],operation_id=cols[2],authorization=cols[3],consumer=cols[4],phase=cols[5],section=heading))

pgsection = text.split('### 2.1 Todas las rutas frontend propuestas')[1].split('### 2.2 Mapa')[0]
raw_pages=[]
for line in pgsection.splitlines():
    if line.startswith('| `/'):
        cols=[c.strip() for c in line.split('|')[1:-1]]
        assert len(cols)==5,cols
        raw_pages.append(dict(route=cols[0].strip('`'),file=cols[1].strip('`'),access=cols[2],purpose=cols[3],api=cols[4]))
assert len(raw_ep)==163, len(raw_ep)
assert len(raw_pages)==71, len(raw_pages)

# Deterministic module ownership, based on endpoint path and operation.
def module_for(e):
    p=e['path']; op=e['operation_id'];
    if p.startswith('/auth/'):return 'identity'
    if p.startswith('/invitations/') or '/invitations' in p or '/members' in p or p.startswith('/organizations'):return 'organizations'
    if '/roles' in p or '/permissions' in p:return 'authorization'
    if '/api-keys' in p:return 'api-credentials'
    if p.startswith('/model-imports') or '/model-imports' in p:return 'model-imports'
    if p.startswith('/models') or '/models' in p and '/v1/' not in p and not p.startswith('/v1'):return 'model-catalog'
    if p.startswith('/deployments') or '/deployments' in p or p.startswith('/runtime-profiles'):return 'model-deployments'
    if p.startswith('/gpu-nodes'):return 'gpu-nodes'
    if p.startswith('/v1'):return 'inference'
    if '/playground' in p:return 'playground'
    if '/routing-policies' in p:return 'request-routing'
    if '/admission-metrics' in p:return 'admission-control'
    if '/quotas' in p or '/quota-usage' in p:return 'quotas'
    if '/usage/' in p or '/usage' in p:return 'usage-ledger'
    if '/metrics' in p and not p.startswith('/deployments') and not p.startswith('/gpu-nodes'):return 'observability-queries'
    if '/cost-' in p:return 'cost-estimates'
    if '/benchmarks' in p:return 'benchmarks'
    if '/experiments' in p:return 'experiments'
    if '/datasets' in p:return 'datasets'
    if '/artifacts' in p:return 'artifacts'
    if '/audit-' in p:return 'audit'
    if '/alerts' in p:return 'alerts'
    if '/notification-channels' in p:return 'notifications'
    if '/webhooks' in p:return 'webhooks'
    if p.startswith('/system/jobs'):return 'jobs'
    if p.startswith('/system/backups'):return 'backups'
    if p.startswith('/system/'):return 'system'
    raise ValueError('No module: '+p)

def controller_for(e):
    p=e['path']; m=e['module']
    if m=='identity':
        if '/oauth/' in p:return 'OAuthController'
        if '/mfa/' in p or '/step-up' in p:return 'MfaController'
        if p in ('/auth/me','/auth/refresh','/auth/logout','/auth/logout-all','/auth/sessions') or '/sessions/' in p:return 'SessionsController'
        return 'IdentityController'
    if m=='organizations':
        if '/members' in p:return 'MembersController'
        if '/invitations' in p or p.startswith('/invitations/'):return 'InvitationsController'
        return 'OrganizationsController'
    if m=='authorization':return 'AuthorizationController'
    names={'api-credentials':'ApiCredentialsController','model-catalog':'ModelCatalogController',
           'model-imports':'ModelImportsController','model-deployments':'ModelDeploymentsController',
           'gpu-nodes':'GpuNodesController','inference':'OpenAiCompatibleController',
           'playground':'PlaygroundController','request-routing':'RoutingPoliciesController',
           'admission-control':'AdmissionMetricsController','quotas':'QuotasController',
           'usage-ledger':'UsageController','observability-queries':'MetricsController',
           'cost-estimates':'CostEstimatesController','benchmarks':'BenchmarksController',
           'experiments':'ExperimentsController','datasets':'DatasetsController','artifacts':'ArtifactsController',
           'audit':'AuditController','alerts':'AlertsController','notifications':'NotificationsController',
           'webhooks':'WebhooksController','jobs':'JobsController','backups':'BackupsController','system':'SystemController'}
    if m=='system' and '/health/' in p:return 'HealthController'
    return names[m]

def page_feature(route):
    if route in ('/login','/register') or route.startswith('/login/') or route.startswith('/password/') or route.startswith('/auth/') or route.startswith('/mfa/'):return 'auth'
    if route.startswith('/invite/'):return 'organizations'
    if route.startswith('/onboarding'):return 'onboarding'
    if route.startswith('/account/'):return 'account'
    if route.startswith('/admin/gpu-nodes'):return 'gpu-nodes'
    if route.startswith('/admin/backups'):return 'backups'
    if route.startswith('/admin/jobs'):return 'jobs'
    if route.startswith('/admin/'):return 'system'
    if route.startswith('/app/:org_slug/settings/notifications'):return 'notifications'
    if route.startswith('/app/:org_slug/settings/webhooks'):return 'webhooks'
    segment=route.split('/')[3] if route.startswith('/app/:org_slug/') else ''
    return {'dashboard':'dashboard','playground':'playground','requests':'usage','models':'models','model-imports':'model-imports',
      'deployments':'deployments','api-keys':'api-keys','quotas':'quotas','usage':'usage','costs':'costs',
      'observability':'observability','routing':'routing','benchmarks':'benchmarks','experiments':'experiments',
      'members':'organizations','invitations':'organizations','settings':'organizations','alerts':'alerts',
      'audit':'audit','datasets':'datasets','artifacts':'artifacts'}.get(segment,'unmapped')

# Projected files, all leaf paths annotated in tree.
items={}
def add(repo,path,comment,phase='Foundation',kind='config'):
    if not path or path.startswith('/') or '..' in Path(path).parts:raise ValueError(path)
    key=f'{repo}/{path}'
    if key in items:
        # Existing declaration is authoritative; avoid stealth overwrites.
        return key
    items[key]=dict(repo=repo,path=path,comment=comment,phase=phase,kind=kind)
    return key

repo_keys=['workspace','inferra-impl','inferra-web','inferra-deploy','platform-ops','prod-local']
# Root workspace, no Node monorepo.
for p,c in [ ('README.md','Cómo clonar los cinco repos y probar sincronización documental'), ('workspace.yaml','Referencias Git, SHA, ownership y origen de cada repo'), ('versions.yaml','Pins y hashes SHA256 de herramientas CLI; no paquetes Node'),('.gitignore','Ignora checkouts temporales, tooling y outputs'),('docs/repository-ownership.md','Ownership, equipos y dependencias entre repositorios') ]:
    add('workspace',p,c)

# Backend stable foundation.
backend_base={
 'AGENTS.md':'Reglas Vigilio de ejecución, ownership y calidad para este repo','README.md':'Instalación de desarrollo, contratos y comandos de testing',
 '.editorconfig':'Normalización de EOL e indentación','LICENSE':'Licencia y redistribución aprobada','SECURITY.md':'Divulgación responsable y política de parches',
 '.gitignore':'Excluye secretos, dumps, reports y cobertura',' .gitleaks.toml':'Detección de secretos y allowlist justificada',
 '.npmrc':'Políticas de pnpm y acceso a registry controlado','.env.example':'Variables ejemplo sin credenciales reales',
 '.env.test.example':'Configuración de pruebas con datos sintéticos',
 'package.json':'Scripts tipados de build, lint, tests, cobertura y OpenAPI',
 'pnpm-lock.yaml':'Árbol de dependencias inmovilizado y auditado',
 'pnpm-workspace.yaml':'packages: []; engineStrict, allowBuilds y age policy',
 'tsconfig.json':'TypeScript strict y reglas de compilación','tsconfig.build.json':'Archivos de build sin tests',
 'nest-cli.json':'Config del compilador NestJS','biome.json':'Formatter y linter con reglas de seguridad y complejidad',
 'drizzle.config.ts':'Fuente de migraciones Drizzle con conexión no embebida',
 'vitest.config.ts':'Coverage V8 con include explícito de código crítico',
 'vitest.integration.config.ts':'Suite DB y Valkey reales aislados',
 'playwright.api.config.ts':'Proyectos API E2E y evidencias privadas de error',
 'cucumber.js':'Gherkin por features y reportes JSON',
 'Containerfile':'Build reproducible, runtime Distroless non-root',
 '.github/CODEOWNERS':'Revisores obligatorios de auth, inferencia y seguridad',
 '.github/dependabot.yml':'Actualización de dependencias controlada y versionada',
 '.github/workflows/ci.yml':'Biome, TS, unit, integration, BDD, E2E API y cobertura',
 '.github/workflows/security.yml':'SAST, secret scan, CVE/SBOM y policy checks',
 '.github/workflows/openapi-compatibility.yml':'Exporta OpenAPI, rechaza cambios breaking no aprobados',
 '.github/workflows/release-oci.yml':'Construye y firma imagen OCI, SBOM y provenance sin secretos',
 'scripts/validate-architecture.mjs':'Verifica imports por capas, ciclos, rutas y ownership',
 'scripts/check-env.mjs':'Valida configuración esperada sin imprimir secretos',
 'scripts/export-openapi.mjs':'Exporta contrato NestJS/Swagger para CI',
 'scripts/openapi-diff.mjs':'Comparación breaking contra contrato publicado',
 'scripts/publish-browser-contracts.mjs':'Genera artefacto browser-safe desde DTOs propietarios',
 'scripts/check-browser-contracts.mjs':'Rechaza drift entre contrato y consumidor web',
 'scripts/check-migrations.mjs':'Valida migraciones sin destruir datos',
 'scripts/smoke-api.mjs':'Smoke de health y rutas críticas contra instancia efímera',
 'src/main.ts':'Entrypoint HTTP público protegido por Caddy',
 'src/worker.main.ts':'Entrypoint BullMQ para jobs idempotentes',
 'src/outbox.main.ts':'Entrypoint outbox con SKIP LOCKED',
 'src/migrate.main.ts':'Entrypoint migraciones one-shot, fuera del arranque HTTP',
 'src/platform-setup.main.ts':'Bootstrap de instance owner con secreto de un uso',
 'src/app.module.ts':'Composition root y provider wiring de módulos',
 'src/bootstrap/http.bootstrap.ts':'Headers TLS/proxy, CORS/CSRF, body size y routing',
 'src/bootstrap/worker.bootstrap.ts':'Instrumentación y shutdown de workers',
 'src/bootstrap/shutdown.bootstrap.ts':'Graceful shutdown y cancelación de streaming',
 'src/bootstrap/openapi.bootstrap.ts':'OpenAPI 3.1 documentado; publicación protegida',
 'src/bootstrap/telemetry.bootstrap.ts':'Inicializa OpenTelemetry antes de NestJS',
 'src/config/env.schema.ts':'Zod fail-fast de las variables por proceso',
 'src/config/env.service.ts':'Acceso tipado a configuración permitida',
 'src/config/database.config.ts':'Pool, TLS, timeout y conexiones de PostgreSQL',
 'src/config/sessions.config.ts':'Cookies, TTL, rotación y protección de sesión',
 'src/config/oauth.config.ts':'Issuer, redirect allowlist y providers opt-in',
 'src/config/inference.config.ts':'Allowlist de hosts, timeouts y capacidades vLLM',
 'src/config/jobs.config.ts':'Concurrencia y reintentos acotados de BullMQ',
 'src/config/telemetry.config.ts':'Sampleo, redacción y atribución tenant low-cardinality',
 'src/database/database.module.ts':'Provider SQL y lifecycle del pool',
 'src/database/drizzle.client.ts':'Cliente Drizzle tipado','src/database/drizzle.pool.ts':'Pool de conexiones y timeouts',
 'src/database/migrate.ts':'Executor DDL transaccional y locks de migración',
 'src/database/seeds/seed-demo-models.ts':'Datos demo idempotentes, nunca producción',
 'src/shared/http/dto/offset-pagination.query.dto.ts':'Zod limit/offset/sort y validación de límites',
 'src/shared/http/dto/paginator.response.dto.ts':'Envelope canónico count/next/previous/results',
 'src/shared/http/dto/problem-details.response.dto.ts':'Errores RFC9457 sin datos sensibles',
 'src/shared/http/pipes/zod-body.pipe.ts':'Validación y sanitización de body HTTP',
 'src/shared/http/pipes/zod-query.pipe.ts':'Validación de query HTTP',
 'src/shared/http/pipes/zod-params.pipe.ts':'Validación UUID y parámetros de path',
 'src/shared/http/decorators/current-principal.decorator.ts':'Principal autenticado y contexto de sesión',
 'src/shared/http/decorators/idempotency-key.decorator.ts':'Validación de cabecera Idempotency-Key',
 'src/shared/http/filters/problem-details.filter.ts':'Mapea errores tipados a Problem Details',
 'src/shared/http/interceptors/correlation-id.interceptor.ts':'Correlación de request y traza',
 'src/shared/http/guards/private-by-default.guard.ts':'Por defecto deny; excepciones explícitas',
 'src/shared/security/crypto/constant-time-compare.ts':'Comparación de hashes/credenciales sin timing leak',
 'src/shared/security/crypto/key-derivation.ts':'Derivación HKDF y rotación sin claves en código',
 'src/shared/security/redaction/redact-sensitive-fields.ts':'Redacta headers, prompts, credenciales y PII',
 'src/shared/security/network/ssrf-egress.policy.ts':'Bloquea IP privadas, redirects y destinos no autorizados',
 'src/shared/tenancy/tenant-context.ts':'Principal + organización activa validada en servidor',
 'src/shared/tenancy/tenant-scope.policy.ts':'Scoping/ACL SQL por tenant',
 'src/shared/observability/logger/pino.factory.ts':'JSON logging estructurado y redacción',
 'src/shared/observability/tracing/span-attributes.ts':'Atributos OpenTelemetry de baja cardinalidad',
 'src/shared/observability/metrics/metric-registry.ts':'Registro de métricas estables',
 'src/shared/data/transaction-manager.port.ts':'Puerto de transacción atómica sin Drizzle acoplado',
 'src/shared/events/outbox-event.schema.ts':'Evento versionado y compatible',
 'src/shared/events/outbox-dispatcher.ts':'Despacho idempotente de outbox',
 'src/shared/events/processed-event.repository.ts':'Deduplicación de consumo en PostgreSQL',
 'docs/architecture/architecture-context.md':'Diagrama C4 de contextos y trust boundaries',
 'docs/architecture/control-vs-data-plane.md':'Límites NestJS vs vLLM y cancelación',
 'docs/architecture/tenant-isolation.md':'Contrato de tenancy y política de denegación',
 'docs/architecture/data-classification.md':'Retención, privacidad y clasificación de prompts',
 'docs/architecture/dependency-rules.md':'Reglas de import entre capas, Nx no requerido',
 'docs/api/openapi.generated.json':'Artefacto OpenAPI generado, no editado a mano',
 'docs/api/openai-compatibility-matrix.md':'Qué endpoints y campos soporta el runtime real',
 'docs/api/error-catalog.md':'Código de error estable y condición de recuperación',
 'docs/decisions/benchmark-methodology.md':'Control de warm-up, cache, GPU, p95 y goodput',
 'docs/adr/0001-modular-monolith.md':'ADR de DDD pragmático y límites',
 'docs/adr/0002-control-data-plane.md':'ADR de exposición a clientes y vLLM privado',
 'docs/adr/0003-session-oauth-mfa.md':'ADR de OTP, OAuth y sesiones rotadas',
 'docs/adr/0004-atomic-quota-reservations.md':'ADR de reserva de tokens y consistencia',
 'docs/adr/0005-runtime-provisioning.md':'ADR provisioning de modelos sin docker.sock API',
 'docs/threat-models/auth-sessions.md':'Threat model de OTP, OAuth, CSRF y MFA',
 'docs/threat-models/inference-data.md':'Threat model de prompts, modelos y streaming',
 'docs/threat-models/model-supply-chain.md':'Licencias, confianza y modelos maliciosos',
 'docs/threat-models/object-upload.md':'Threat model de RustFS, presign y malware',
 'tests/fixtures/tenant-factory.ts':'Fixture tenants A/B y aislamiento',
 'tests/fixtures/user-factory.ts':'Fixture identidades y roles sintéticos',
 'tests/fixtures/fake-identity-provider.ts':'Simula OAuth y assertions de state/nonce',
 'tests/fixtures/fake-vllm-server.ts':'Simulador de SSE, abort, 429 y desconexión',
 'tests/fixtures/test-clock.ts':'Reloj inyectado para OTP, TTL y idempotencia',
 'tests/fixtures/stream-chunks.ts':'Chunks SSE fragmentados y [DONE]',
 'tests/contract/openapi-compatibility.spec.ts':'Asegura operationId únicos y esquema seguro',
 'tests/contract/openai-compatibility.spec.ts':'Wire format OpenAI y errores compatibles',
 'tests/contract/browser-safe-dtos.spec.ts':'No filtrar secretos/imports Node al browser',
 'tests/contract/sse-event-contract.spec.ts':'Payload SSE bajo fragmentación y cancelación',
 'tests/e2e/security/tenant-isolation.negative.spec.ts':'IDs ajenos denegados sin filtrar existencia',
 'tests/e2e/security/auth-session.negative.spec.ts':'401/403, CSRF, refresh replay y fijación',
 'tests/e2e/security/ssrf-egress.negative.spec.ts':'Fetch/download/webhook bloquea egress prohibido',
 'tests/e2e/security/large-payload.negative.spec.ts':'Rechaza cuerpos excesivos y rate limit',
 'tests/load/inference-smoke.k6.js':'Validación carga ligera y endpoints externos',
 'tests/load/inference-saturation.k6.js':'Throughput, saturación, goodput, TTFT y p95',
 'tests/load/tenant-fairness.k6.js':'Prueba concurrente de fairness entre tenants',
 'tests/load/otp-abuse.k6.js':'Protección anti-bot y límites de OTP',
 'tests/load/workloads/mixed-inputs.example.jsonl':'Datos sintéticos de longitudes variables',
}
for p,c in backend_base.items():add('inferra-impl',p.strip(),c,'Foundation', 'test' if '/tests/' in p or p.startswith('tests/') else 'base')

# Global BDD executable plans owned by backend; Gherkin not a unit substitute.
for m,flist in BDD.items():
    for f in flist:
        add('inferra-impl',f'tests/bdd/features/{f}', f'BDD comportamiento observable: {f.split("/")[-1]} (owner {m})',MOD[m][0],'bdd')
for n,c in [('auth.steps.ts','Steps OTP, MFA, sesiones y proveedor social'),('tenancy.steps.ts','Steps de organizaciones y recurso ajeno'),('inference.steps.ts','Steps streaming y cancelación'),('operations.steps.ts','Steps de jobs, backups y despliegues'),('optimization.steps.ts','Steps fairness y bench reproducible'),('storage.steps.ts','Steps upload en cuarentena')]:
    add('inferra-impl',f'tests/bdd/steps/{n}',c,'M1','bdd')
for p,c in [('world.ts','World sin estado compartido entre escenarios'),('factories.ts','Fixtures in-memory de BDD'),('clock.ts','Tiempo determinista sin sleeps'),('cucumber-report.ts','Reporte JSON y JUnit libre de datos privados')]:
    add('inferra-impl',f'tests/bdd/support/{p}',c,'Foundation','bdd')

# Map BDD only to risk-bearing business behaviors, not every POST of a module.
def bdd_matches(feature: str, operation: str) -> bool:
    o=operation.lower(); f=feature.lower()
    if 'otp-single-use' in f:return 'otp' in o
    if 'social-provider-linking' in f:return any(x in o for x in ('oauth','social','identity','identit'))
    if 'session-refresh-reuse' in f:return any(x in o for x in ('session','logout','refresh'))
    if 'mfa-step-up' in f:return any(x in o for x in ('mfa','totp','recoverycode','stepup'))
    if 'invitation-last-owner' in f:return any(x in o for x in ('invit','member','role'))
    if 'tenant-authorization' in f:return True
    if 'api-key-rotation' in f:return any(x in o for x in ('apikey','key'))
    if 'deployment-transitions' in f:return any(x in o for x in ('deployment','rollback'))
    if 'stream-abort-settlement' in f:return any(x in o for x in ('completion','inference','generation','usage'))
    if 'playground-session-access' in f:return True
    if 'fair-routing' in f:return True
    if 'concurrency-budget' in f:return True
    if 'reproducible-comparison' in f:return True
    if 'promotion-rollback' in f:return True
    if 'quarantine-before-download' in f:return True
    if 'webhook-ssrf' in f:return True
    if 'backup-restore-drill' in f:return True
    return False

# Assign endpoint to module and explicitly place owner/controller/usecase/DTO/test.
module_ops=defaultdict(list)
for e in raw_ep:
    m=module_for(e);e['module']=m;e['controller']=controller_for(e);e['http_prefix']='/v1' if e['path'].startswith('/v1') else '/api/v1'
    op=e['operation_id']; fn=kebab(op);phase=e['phase']
    e['service_file']=f'src/modules/{m}/application/services/{fn}.service.ts'
    e['controller_file']=f'src/modules/{m}/presentation/http/controllers/{kebab(e["controller"][:-len("Controller")])}.controller.ts'
    if e['method'] in ('POST','PATCH','PUT'):
        e['dto_file']=f'src/modules/{m}/presentation/http/dto/{fn}.request.dto.ts'
        # Bodyless semantic actions use explicit empty-body validation in service and auth.
    elif any(x in op.lower() for x in ('list','search','timeseries','metrics','usage','overview','summary','estimated','compare','getcostestimates')) or 'events' in e['path']:
        e['dto_file']=f'src/modules/{m}/presentation/http/dto/{fn}.query.dto.ts'
    else:
        e['dto_file']=f'src/modules/{m}/presentation/http/dto/{m}-params.dto.ts'
    e['response_dto_file']=f'src/modules/{m}/presentation/http/dto/{m}-public.response.dto.ts'
    e['unit_test']=f'tests/unit/{m}/{fn}.spec.ts'
    e['api_e2e']=f'tests/e2e/api/{m}.api.spec.ts'
    e['security_e2e']=f'tests/e2e/security/{m}.access.spec.ts' if e['authorization']!='Public (si habilitado)' and not e['authorization'].startswith('Public') and not e['authorization'].startswith('Interno') else ''
    e['integration_test']=f'tests/integration/{m}/{m}.integration.spec.ts'
    e['bdd_tests']=[f'tests/bdd/features/{x}' for x in BDD.get(m,[]) if e['method']!='GET' and bdd_matches(x, op)]
    e['owner']=m
    module_ops[m].append(e)

for m,(phase,schemas,policies,adapters) in MOD.items():
    pre=f'src/modules/{m}'
    add('inferra-impl',f'{pre}/{m}.module.ts',f'Nest module: wiring de dominio, services, controllers y ports para {m}',phase,'module')
    for s in schemas:
        add('inferra-impl',f'{pre}/domain/schemas/{s}.schema.ts',f'Zod canónico y tipo inferido del dominio {s}; contratos no duplicados',phase,'domain')
    for s in policies:
        add('inferra-impl',f'{pre}/domain/policies/{s}.policy.ts',f'Invariante/policy de negocio: {s}; sin dependencia de HTTP',phase,'domain')
    add('inferra-impl',f'{pre}/application/ports/{m}.repository.port.ts',f'Contrato de persistencia {m}; sin ORM acoplado a aplicación',phase,'port')
    if adapters:
        for a in adapters:
            add('inferra-impl',f'{pre}/application/ports/{a}.port.ts',f'Puerto externo {a} para pruebas y adaptadores',phase,'port')
            add('inferra-impl',f'{pre}/infrastructure/adapters/{a}.adapter.ts',f'Adaptador real de {a}, timeout/errores/telemetría',phase,'adapter')
    add('inferra-impl',f'{pre}/infrastructure/persistence/drizzle/schema.ts',f'Tablas, índices y constraints de {m}; migración revisada',phase,'db')
    add('inferra-impl',f'{pre}/infrastructure/persistence/drizzle/{m}.repository.ts',f'Queries y transactions tenant-scoped de {m}',phase,'db')
    add('inferra-impl',f'{pre}/presentation/http/dto/{m}-public.response.dto.ts',f'Proyección HTTP sin secretos de {m}, Zod + OpenAPI',phase,'dto')
    add('inferra-impl',f'{pre}/presentation/http/dto/{m}-params.dto.ts',f'Zod de UUIDs/path para recursos de {m}',phase,'dto')
    add('inferra-impl',f'{pre}/presentation/http/docs/{m}.doc.ts',f'Esquema OpenAPI 3.1 de {m}, derivado de DTO sin copiar modelo',phase,'openapi')
    add('inferra-impl',f'tests/integration/{m}/{m}.integration.spec.ts',f'PostgreSQL/Valkey real, constraints, races y tenant de {m}',phase,'integration')
    add('inferra-impl',f'tests/e2e/api/{m}.api.spec.ts',f'HTTP real (status, payload, auth, errores, paginación) para {m}',phase,'api-e2e')
    add('inferra-impl',f'tests/e2e/security/{m}.access.spec.ts',f'Pruebas negativas: 401/403, tenant ajeno y permisos en {m}',phase,'security-e2e')

for e in raw_ep:
    m=e['module']; op=e['operation_id']; phase=e['phase']
    add('inferra-impl',e['controller_file'],f'Controller HTTP {e["controller"]}; delega operationIds, DTO, authz y error mapping',phase,'controller')
    add('inferra-impl',e['service_file'],f'Caso de uso {op}; policy, transacción, puertos y métricas',phase,'service')
    add('inferra-impl',e['dto_file'],f'Zod de entrada para {e["method"]} {e["path"]}; valid/invalid/bounds',phase,'dto')
    add('inferra-impl',e['unit_test'],f'Unit de {op}: éxito, inválido, ausencia, conflicto/fallo externo cuando aplique',phase,'unit')

# Add concrete special-case security operational owners.
backend_extras={
 'src/modules/identity/infrastructure/crypto/argon2id-password.adapter.ts':'Hash Argon2id con parámetros auditables y migración de hashes',
 'src/modules/identity/infrastructure/oauth/google-oidc.adapter.ts':'Validación issuer/aud/nonce/PKCE y firma de Google',
 'src/modules/identity/infrastructure/oauth/facebook-oauth.adapter.ts':'Facebook OAuth state, appsecret_proof y proveedor ID',
 'src/modules/identity/infrastructure/persistence/drizzle/session-token.repository.ts':'Hash de refresh token, family y reuse detection atómica',
 'src/modules/identity/infrastructure/persistence/drizzle/otp-challenge.repository.ts':'OTP hasheado y consumo único en transacción',
 'src/modules/identity/infrastructure/email/smtp-mailer.adapter.ts':'Email OTP/invitaciones con límites y retries idempotentes',
 'src/modules/inference/presentation/http/streaming/sse-frame.writer.ts':'Streaming OpenAI SSE, chunks + [DONE], sin buffering Caddy',
 'src/modules/inference/presentation/http/streaming/client-abort.handler.ts':'Propaga AbortSignal a vLLM y reembolsa reserva',
 'src/modules/inference/infrastructure/vllm/vllm-openai.adapter.ts':'Transforma request/response OpenAI compatible a vLLM',
 'src/modules/inference/infrastructure/vllm/vllm-sse-decoder.ts':'SSE incremental fragmentado + defensas de tamaño',
 'src/modules/quotas/infrastructure/persistence/drizzle/atomic-reservation.repository.ts':'Reserva idempotente transaccional con row locking',
 'src/modules/usage-ledger/infrastructure/persistence/drizzle/usage-entry.repository.ts':'Libro contable inmutable/conciliación por request_id',
 'src/modules/model-deployments/infrastructure/workers/deployment-reconciler.consumer.ts':'Reconcile desired/observed sin docker.sock en API',
 'src/modules/benchmarks/infrastructure/workers/benchmark-runner.consumer.ts':'Ejecutor de benchmark aislado con dataset fijo, warmup y caps',
 'src/modules/notifications/infrastructure/workers/notification.consumer.ts':'Encola y envía notifications con backoff y dedupe',
 'src/modules/webhooks/infrastructure/workers/webhook-delivery.consumer.ts':'Firmas HMAC, DNS re-resolve, redirects prohibidos, backoff',
 'src/modules/artifacts/infrastructure/security/clamav-scanner.adapter.ts':'Scan antes de publicar objeto en RustFS; cuarentena',
 'src/modules/artifacts/infrastructure/storage/rustfs-s3.adapter.ts':'S3 RustFS con checksum, TTL y bucket privado',
 'src/modules/backups/infrastructure/pgbackrest/backup-status.adapter.ts':'Solo estado/verify; RESTORE NO vía HTTP',
 'src/modules/system/presentation/http/guards/instance-admin.guard.ts':'Separación instance admin vs org admin',
 'src/modules/authorization/presentation/http/guards/resource-permission.guard.ts':'Permiso sobre recurso y tenant; deny-by-default',
}
for p,c in backend_extras.items():add('inferra-impl',p,c,'M1' if '/identity/' in p or 'authorization' in p else 'M3','special')

# Frontend foundation with explicit route-level traceability.
web_base={
 'AGENTS.md':'Normas Vigilio Preact, ownership, testing y UX','README.md':'Development, rutas, contratos, CI y diagramas',
 'SECURITY.md':'Seguridad del browser, privacidad y reporte vulnerabilidades',
 '.editorconfig':'Convenciones de texto','.gitignore':'Ignora dist, artefactos y traces locales',
 '.gitleaks.toml':'Secret scanning de fuente y builds','.npmrc':'PNPM con registry seguro',
 '.env.example':'Solo variables públicas VITE_, jamás secrets',
 'package.json':'Build, check, unit, components, route smoke y E2E',
 'pnpm-lock.yaml':'Dependencias reproducibles','pnpm-workspace.yaml':'packages: [] + allowBuilds declarados',
 'tsconfig.json':'TypeScript strict y Preact JSX','vite.config.ts':'Vite, CSP assets y paths estables',
 'biome.json':'Reglas Biome comunes + accesibilidad + hooks',
 'vitest.config.ts':'Unit/components V8 thresholds y matchers',
 'playwright.config.ts':'Chromium, Firefox, WebKit; traces on failure y webserver',
 'index.html':'Entry SPA seguro sin claves insertadas',
 'Containerfile.runtime':'Sólo dist + server estático, runtime non-root',
 '.github/CODEOWNERS':'Owners de auth, charts, gateway y UX',
 '.github/workflows/ci.yml':'Biome, TS, Vitest, Playwright, axe, bundle budget',
 '.github/workflows/security.yml':'SAST, dependency audit, headers/CSP y secrets',
 '.github/workflows/release-oci.yml':'Build/dist firmado y SBOM',
 'public/favicon.svg':'Identidad de producto',
 'public/manifest.webmanifest':'Metadata PWA sin offline de datos privados',
 'public/robots.txt':'No indexar consola autenticada',
 'scripts/verify-api-contracts.mjs':'Consume paquete DTO browser-safe publicado por backend',
 'scripts/check-bundle-budget.mjs':'Presupuesto JS/CSS por ruta',
 'scripts/audit-public-env.mjs':'Escanea dist por secretos, tokens y URLs privadas',
 'src/main.tsx':'Monta Preact 11 con rutas y providers',
 'src/app/app.tsx':'Layout aplicación y boundary superior',
 'src/app/routes.tsx':'Registry canónico de 71 rutas + lazy imports',
 'src/app/providers/query.provider.tsx':'TanStack Query y cache scoping por org',
 'src/app/providers/auth.provider.tsx':'Sesión desde server, refresh y logout',
 'src/app/providers/theme.provider.tsx':'Tema accesible y preferencias locales',
 'src/app/layouts/public.layout.tsx':'Páginas de auth públicas y callbacks',
 'src/app/layouts/authenticated.layout.tsx':'Shell privado con organización activa',
 'src/app/layouts/organization.layout.tsx':'Sidebar por políticas de org',
 'src/app/layouts/instance-admin.layout.tsx':'Layout admin solo rol global',
 'src/app/guards/authenticated-route.guard.tsx':'Bloquea acceso sin sesión pero no sustituye backend',
 'src/app/guards/organization-route.guard.tsx':'Valida org_slug contra membresía obtenida del servidor',
 'src/app/guards/instance-admin-route.guard.tsx':'No confunde admin de tenant con admin instancia',
 'src/app/guards/capability-route.guard.tsx':'Activa rutas según feature flags del servidor',
 'src/app/boundaries/route-error.boundary.tsx':'Fallback seguro y reporting sin PII',
 'src/app/boundaries/route-suspense.boundary.tsx':'Skeleton de carga de rutas lazy',
 'src/services/http/api-client.ts':'Requests con cookie, CSRF, timeout y retry solo seguro',
 'src/services/http/api-error.ts':'Parse application/problem+json y error UX',
 'src/services/http/csrf-client.ts':'CSRF token y same-origin',
 'src/services/auth/session-client.ts':'Carga y refresh de sesión sin localStorage de tokens',
 'src/services/inference/chat-stream.client.ts':'POST streaming con fetch ReadableStream y abort',
 'src/services/inference/sse-frame.parser.ts':'Parse incremental multi-chunk SSE',
 'src/services/runtime-config/runtime-config.schema.ts':'Validación de configuración pública inyectada',
 'src/services/runtime-config/runtime-config.client.ts':'Capa pública de runtime sin secretos',
 'src/services/observability/browser-rum.ts':'Métricas frontend sin prompt ni PII',
 'src/libs/ui/button/button.tsx':'Botón accesible, estados loading y disabled',
 'src/libs/ui/form/field.tsx':'Labels/errores con ARIA y RHF',
 'src/libs/ui/dialog/dialog.tsx':'Focus trap, Escape, restore focus',
 'src/libs/ui/table/data-table.tsx':'Tabla paginada/ordenada server-side',
 'src/libs/ui/toast/toast.tsx':'Feedback SR-friendly sin revelar secretos',
 'src/libs/ui/skeleton/skeleton.tsx':'Skeleton que no produce saltos de layout',
 'src/libs/ui/empty-state/empty-state.tsx':'Empty contextual con acción relevante',
 'src/libs/ui/error-state/error-state.tsx':'Retry seguro, degradación sin PII',
 'src/libs/charts/latency-chart.tsx':'Chart TTFT/TPOT con tabla alternativa accesible',
 'src/libs/charts/gpu-usage-chart.tsx':'VRAM y utilización con percentiles y units',
 'src/libs/charts/throughput-chart.tsx':'Tokens/s y goodput con accesibilidad',
 'src/libs/accessibility/focus-manager.ts':'Manejo de foco entre rutas, diálogos y formularios',
 'src/libs/accessibility/live-announcer.ts':'Anuncios aria-live de streams y errores',
 'src/libs/format/duration.ts':'Formato duración y percentiles',
 'src/libs/format/tokens.ts':'Unidades tokens y costos estimados',
 'src/libs/format/bytes.ts':'Formatos VRAM y tamaño de modelo',
 'src/styles/global.css':'Tailwind v4 base y estilos globales accesibles',
 'src/styles/tokens.css':'Tokens semánticos light/dark',
 'src/styles/themes.css':'Tema claro/oscuro y reduced-motion',
 'tests/msw/handlers.ts':'Fixtures HTTP por operación sin mockear Query',
 'tests/msw/server.ts':'MSW setup/reset entre pruebas',
 'tests/msw/fixtures.ts':'Payloads sintéticos conformes a DTOs',
 'tests/contract/browser-dtos.contract.spec.ts':'Verifica import seguro y schema publicado',
 'tests/contract/sse-compat.contract.spec.ts':'Frames de streaming y fallback UI',
 'tests/e2e/route-access.spec.ts':'Matriz parametrizada 71 rutas, guards, redirects y 404',
 'tests/e2e/session-expiry.spec.ts':'401/expiry y refresh sin sesión zombi',
 'tests/e2e/tenant-switching.spec.ts':'Cambio de tenant limpia cache y niega datos ajenos',
 'tests/e2e/accessibility.spec.ts':'axe y navegación teclado en rutas críticas',
 'tests/e2e/headers-and-csp.spec.ts':'CSP, cookies HttpOnly y no filtración de secret',
 'tests/visual/core-pages.visual.spec.ts':'Screenshots revisadas de layout responsive estable',
 'tests/unit/sse-frame-parser.spec.ts':'Chunks SSE fragmentados, Unicode y [DONE]',
 'tests/unit/runtime-config.spec.ts':'Configuración pública válida/ausente/inválida',
 'docs/route-registry.md':'Rutas y permission guards sincronizados con source',
 'docs/user-journeys.md':'Journeys, estados de carga/error/vacío/éxito',
 'docs/accessibility.md':'WCAG, focus, contraste, teclado y reduced motion',
 'docs/browser-security.md':'CSRF/CSP/iframe/no tokens y reglas de descarga',
}
for p,c in web_base.items():add('inferra-web',p,c,'Foundation','test' if p.startswith('tests/') else 'base')

page_manifest=[]
for p in raw_pages:
    route=p['route'];feature=page_feature(route)
    if feature=='unmapped':raise RuntimeError('Page feature not found: '+route)
    basename=p['file'].split('/')[-1]
    if not basename.endswith('.tsx'):raise RuntimeError('bad page file: '+str(p))
    phase=('S+' if feature in ('benchmarks','experiments','routing','datasets','artifacts','webhooks') else 'M1' if feature in ('auth','onboarding','account','organizations') else 'M3' if feature in ('backups','jobs','observability','alerts','notifications','costs','model-imports','gpu-nodes','audit','system') else 'M2')
    path=f'src/features/{feature}/pages/{basename}'
    p['feature']=feature;p['source_file']=path;p['phase']=phase
    p['unit_test']=f'tests/components/{feature}.states.spec.tsx'
    p['browser_e2e']='tests/e2e/route-access.spec.ts'
    p['journey_e2e']=f'tests/e2e/journeys/{feature}.journey.spec.ts'
    add('inferra-web',path,f'PÁGINA {route}; {p["purpose"]}; acceso: {p["access"]}; E2E route-access + {feature}.journey',phase,'page')
    add('inferra-web',f'src/features/{feature}/services/{feature}.api.ts',f'Cliente typed para endpoints usados por feature {feature}',phase,'client')
    add('inferra-web',f'src/features/{feature}/hooks/use-{feature}.ts',f'Coordina TanStack Query, estados UX y cancelación de {feature}',phase,'hook')
    add('inferra-web',f'src/features/{feature}/query-keys.ts',f'Keys con org_id y filtros; invalidación de {feature}',phase,'cache')
    add('inferra-web',p['unit_test'],f'Component tests loading/error/empty/success y ARIA de {feature}',phase,'component-test')
    add('inferra-web',p['journey_e2e'],f'E2E funcional con red controlada, auth y failure de {feature}',phase,'browser-e2e')
    page_manifest.append(p)

# Add core feature components and their linked component tests; actual components created when needed.
UI_COMPONENTS={
 'auth':['password-login-form','oauth-provider-buttons','email-otp-input','mfa-challenge-form','security-connections'],
 'onboarding':['setup-checklist','gpu-preflight-status','org-creation-form'],
 'dashboard':['latency-kpi','model-availability','quota-status'],
 'playground':['chat-message','prompt-editor','generation-settings','model-picker','stream-output','abort-generation-button'],
 'models':['model-card','model-license-warning','model-capabilities'],
 'model-imports':['import-progress','import-source-form'],
 'deployments':['deployment-configuration-form','runtime-profile-picker','rollback-confirm-dialog'],
 'gpu-nodes':['gpu-utilization-card','vram-chart'],
 'api-keys':['create-api-key-form','reveal-secret-once-dialog','api-key-scope-editor'],
 'quotas':['quota-table','quota-usage-progress'],
 'usage':['usage-timeline','token-breakdown','requests-table'],
 'costs':['cost-assumption-form','estimated-cost-chart'],
 'observability':['latency-percentiles-chart','error-table'],
 'routing':['routing-rule-editor','dry-run-routing-result'],
 'benchmarks':['workload-profile-form','benchmark-metrics-charts'],
 'experiments':['candidate-comparison-table','promotion-approval-dialog'],
 'organizations':['members-table','invite-member-form','role-selector'],
 'account':['session-device-table','totp-enrollment','provider-connection-buttons'],
 'audit':['audit-event-table','audit-event-detail'],
 'alerts':['alert-list','acknowledge-action'],
 'datasets':['dataset-schema-editor','dataset-license-check'],
 'artifacts':['upload-progress','artifact-scan-state'],
 'backups':['backup-verification-status','restore-warning'],
 'system':['system-health-summary','provider-config-form','job-events-stream'],
 'jobs':['job-progress','job-event-timeline'],
 'notifications':['channel-settings-form','test-channel-action'],
 'webhooks':['webhook-endpoint-form','delivery-history-table'],
}
for feat,comps in UI_COMPONENTS.items():
    for cmp in comps:
        add('inferra-web',f'src/features/{feat}/components/{cmp}.tsx',f'UI {cmp}: interacción accesible + loading/error/disabled según necesidad', 'M1' if feat=='auth' else 'M3','component')

# Deployment project files; no AWS, no Kubernetes.
deploy_files={
 'README.md':'Guía de instalador de usuario final y arquitectura de producción',
 'AGENTS.md':'Restricciones Compose, seguridad y evidence gates',
 '.gitignore':'Ignora .env reales, datos persistentes, claves y backups',
 '.gitleaks.toml':'Detección de secrets en infraestructura y scripts',
 '.github/CODEOWNERS':'Approval de operaciones, seguridad y SRE',
 '.github/workflows/validate-compose.yml':'Lint YAML, config interpolated de staging/production y conftest',
 '.github/workflows/security.yml':'Trivy/Conftest, cosign policy y scan secrets',
 '.github/workflows/release.yml':'Manifiesto digests, smoke y aprobación de promoción',
 'install.sh':'Instalador idempotente con preflight y permisos 0600',
 'upgrade.sh':'Promoción mismo digest con migration+smoke+rollback',
 'status.sh':'Resumir salud y readiness sin secrets',
 'verify.sh':'Smoke health, streaming SSE, auth privada y almacenamiento',
 'uninstall.sh':'Desinstalación explícita con confirmación y política de datos',
 'release-manifest.yaml':'Digests OCI inmutables, versiones runtime y procedencia',
 'environments/local.env.example':'Variables locales dummy, sin secretos',
 'environments/staging.env.example':'Contrato de variables staging; mismo compose',
 'environments/production.env.example':'Contrato de variables producción; mismo compose',
 'compose/compose.yaml':'Único Compose, perfiles gpu/cpu-demo/obs/storage/tools y redes',
 'compose/Caddyfile':'TLS, headers, routing, no-buffer SSE, límites de tamaño',
 'provisioning/preflight/check-host.sh':'Comprueba Linux, Compose, disco, CPU, límites y puertos',
 'provisioning/preflight/check-nvidia.sh':'Comprueba NVIDIA driver, nvidia-container-toolkit y VRAM',
 'provisioning/preflight/check-model.sh':'Model id+revisión+licencia+VRAM+tamaño de context',
 'provisioning/bootstrap/generate-secrets.sh':'Genera secretos sin logs, permisos 0600',
 'provisioning/bootstrap/bootstrap-owner.sh':'Credencial bootstrap de un uso, expira y se revoca',
 'provisioning/releases/verify-signatures.sh':'cosign verify keyless antes del pull por digest',
 'provisioning/releases/run-migrations.sh':'Migration one-shot y compatibilidad DB',
 'provisioning/releases/rollback-app.sh':'Rollback imagen/servicios sin revertir DDL destructivo',
 'provisioning/model-profiles/qwen-small.env.example':'Perfil GPU preaprobado por límites de VRAM',
 'provisioning/model-profiles/llama-small.env.example':'Perfil alternativo bajo licencia y compatibilidad',
 'provisioning/gpu/nvidia-runtime.md':'Configuración host NVIDIA y pruebas GPU',
 'observability/otel-collector/config.yaml':'Procesamiento OTel con sampling y redacción',
 'observability/prometheus/prometheus.yml':'Targets privados y labels low-cardinality',
 'observability/prometheus/rules/api-slo.yml':'SLI error/latency de gateway y API',
 'observability/prometheus/rules/gpu-slo.yml':'GPU saturation, OOM y capacity pressure',
 'observability/prometheus/tests/api-slo.test.yml':'promtool test rules de alertas API',
 'observability/prometheus/tests/gpu-slo.test.yml':'promtool test rules de alertas GPU',
 'observability/grafana/dashboards/inference-overview.json':'Panel TTFT, TPOT, throughput, goodput',
 'observability/grafana/dashboards/gpu-capacity.json':'Panel VRAM, GPU duty cycle, OOM',
 'observability/grafana/dashboards/api-security.json':'Panel auth failures, API keys y tenant denials',
 'observability/grafana/provisioning/datasources.yaml':'Data sources privadas provisionadas',
 'observability/alloy/config.alloy':'Recolección de logs JSON y filtros PII',
 'observability/loki/config.yaml':'Logs, storage y retención',
 'observability/tempo/config.yaml':'Almacenamiento de trazas y límites',
 'observability/alertmanager/config.yaml':'Rutas de incidentes y dedupe sin PII',
 'observability/blackbox/config.yaml':'Verificación TLS y rutas públicas seguras',
 'observability/dcgm/README.md':'Export GPU para NVIDIA compatibles y DCGM versionado',
 'backup/pgbackrest/pgbackrest.conf.example':'Backup base, WAL archiving PITR y cifrado',
 'backup/pgbackrest/backup-systemd.timer':'Backups programados fuera de app',
 'backup/pgbackrest/backup-systemd.service':'Invoca pgbackrest con permisos mínimos',
 'backup/restore/restore-isolated.sh':'Ensaya restore aislado con aprobación',
 'backup/restore/verify-rpo-rto.sh':'Mide RPO/RTO y verifica consistencia',
 'backup/restore/offsite-policy.md':'3-2-1 copias en otra máquina y retención',
 'storage/rustfs/README.md':'Buckets, credenciales por función, cifrado y despliegue opcional',
 'storage/rustfs/lifecycle.json':'Retención y limpieza de multipart abandonados',
 'storage/clamav/README.md':'Cuándo habilitar malware scan y límites',
 'policies/compose-security.rego':'Bloquea privileged, host sock, puertos DB y cap excesivas',
 'policies/signed-images.rego':'Rechaza digests sin firma previa verificada',
 'policies/data-retention.md':'Retención de prompts, trazas, tokens y artefactos',
 'operations/slos.md':'Objetivos de latencia/errores y presupuesto de error',
 'operations/capacity.md':'Sizing, admission thresholds y límites GPU',
 'operations/incident-response.md':'Severidades, on-call y notificación',
 'operations/runbooks/gpu-oom.md':'Runbook GPU OOM/fragmentación y rollback',
 'operations/runbooks/postgres-unavailable.md':'Runbook fail-closed y restauración controlada',
 'operations/runbooks/valkey-unavailable.md':'Runbook colas/capacidad degradadas',
 'operations/runbooks/oauth-provider-unavailable.md':'Runbook social login caído, OTP local',
 'operations/runbooks/backup-restore.md':'Restore drill aislado y verificación post-restore',
 'operations/runbooks/vllm-failure.md':'Recovery de runtime y abort de streams',
 'tests/compose/compose-profiles.spec.sh':'Valida único compose para staging/prod/gpu/cpu-demo',
 'tests/compose/network-isolation.spec.sh':'Postgres/Valkey/vLLM/RustFS sin ports públicos',
 'tests/security/container-hardening.spec.sh':'Non-root, read-only fs, cap_drop, seccomp',
 'tests/security/cosign-rejection.spec.sh':'Imagen inválida rechazada antes del deploy',
 'tests/smoke/install-smoke.spec.sh':'Instalación idempotente y login bootstrap',
 'tests/smoke/inference-sse.spec.sh':'GET /v1/models + POST chat streaming desde proxy',
 'tests/smoke/upgrade-rollback.spec.sh':'Mismo digest y rollback de app sin rollback DDL destructivo',
 'tests/observability/promtool-rules.spec.sh':'Ejecuta promtool test rules',
 'tests/dr/pgbackrest-restore.spec.sh':'Restauración en host/DB aislados',
 'tests/dr/rustfs-checksum.spec.sh':'Objects/versionados checksum y copia externa',
 'docs/installation/linux-nvidia.md':'Instrucciones NVIDIA sin asumir drivers instalados',
 'docs/installation/cpu-demo.md':'Demo sin GPU, sin prometer throughput de vLLM',
 'docs/installation/offline.md':'Mirror local de OCI y modelos firmados',
 'docs/installation/oauth-and-smtp.md':'Credenciales Google/Facebook y SMTP opcionales',
 'docs/installation/hardware-sizing.md':'VRAM, CPU, disco, licencias y límites',
 'docs/security/network-and-tls.md':'Trust boundaries TLS edge/backend y Caddy',
 'docs/security/secrets-and-rotation.md':'Gestión, rotación y expiración de secrets',
 'docs/upgrade/migration-and-rollback.md':'Migraciones forward-only y planes de rollback',
}
for p,c in deploy_files.items():add('inferra-deploy',p,c,'Foundation','test' if p.startswith('tests/') else 'ops')

# Operations host-agnostic and local lab.
ops_files={
 'README.md':'Operación Linux reusable, sin nombres Inferra',
 'AGENTS.md':'Políticas de cambios privilegiados y auditoría',
 'ansible.cfg':'Configuración Ansible sin escaladas implícitas',
 'requirements.yml':'Dependencias Ansible por versión/hashes',
 '.gitignore':'Ignora inventarios privados, llaves, facts',
 '.gitleaks.toml':'Escaneo secretos Ansible',
 '.github/CODEOWNERS':'Revisión obligatoria de roles host',
 '.github/workflows/ansible-ci.yml':'ansible-lint, syntax-check y molecule rootless',
 'inventories/example/hosts.ini':'Inventario de ejemplo sin direcciones privadas reales',
 'playbooks/harden-linux.yml':'Hardening SSH, usuarios, kernel, logs',
 'playbooks/install-container-runtime.yml':'Instala Docker Compose o Podman rootless según decisión host',
 'playbooks/prepare-nvidia.yml':'Drivers y Toolkit NVIDIA con validación de versiones',
 'playbooks/configure-backups.yml':'Timers y ubicación externa del backup',
 'roles/base_hardening/tasks/main.yml':'SSH key-only, sudo mínimo, updates y sysctl',
 'roles/base_hardening/handlers/main.yml':'Reload seguros para SSH/daemon',
 'roles/base_hardening/defaults/main.yml':'Defaults sin IP ni nombre de producto',
 'roles/firewall/tasks/main.yml':'Firewall deny-by-default, solo 80/443 y SSH allowlist',
 'roles/firewall/defaults/main.yml':'Política de puertos abstracta',
 'roles/docker_host/tasks/main.yml':'Docker Engine, Compose plugin y logging seguro',
 'roles/docker_host/defaults/main.yml':'Version pins y bind addresses',
 'roles/rootless_podman_host/tasks/main.yml':'Subuid/subgid, linger, user services y socket privado',
 'roles/rootless_podman_host/meta/argument_specs.yml':'Validación de roles Rootless Podman',
 'roles/nvidia_host/tasks/main.yml':'Drivers/toolkit NVIDIA y health check',
 'roles/nvidia_host/defaults/main.yml':'Requisitos hardware sin suponer GPU',
 'roles/backup_host/tasks/main.yml':'Repo pgBackRest en host independiente y ACL',
 'roles/backup_host/templates/pgbackrest.repo.conf.j2':'Config de backup remoto cifrado',
 'tests/molecule/base/molecule.yml':'Host baseline Linux, ssh y firewall',
 'tests/molecule/container-runtime/molecule.yml':'Rootless/Docker sin privilegios excesivos',
 'tests/molecule/nvidia/molecule.yml':'Test host NVIDIA con runner compatible',
 'tests/security/host-hardening.spec.sh':'Auditoría SSH, firewall, docker socket, limits',
 'docs/compatibility.md':'Distros, cgroups v2, NVIDIA y soporte',
 'docs/host-operations.md':'Operación y mantenimiento fuera de producto',
}
for p,c in ops_files.items():add('platform-ops',p,c,'Foundation','test' if p.startswith('tests/') else 'ops')

lab_files={
 'README.md':'Ejecuta el único compose de inferra-deploy para el laboratorio',
 '.gitignore':'Excluye secrets, volúmenes, reportes, logs y videos',
 '.env.lab.example':'Variables sintéticas de staging local',
 'Makefile':'Comandos lab-up, lab-down, lab-test sin copiar compose',
 'scripts/lab-up.sh':'Lanza -f ../inferra-deploy/compose/compose.yaml con env lab',
 'scripts/lab-down.sh':'Baja servicios sin borrar volúmenes por defecto',
 'scripts/lab-reset.sh':'Reset destructivo SOLO del laboratorio tras confirmación',
 'scripts/collect-evidence.sh':'Captura estado/digests/exit codes sin secretos',
 'fixtures/postgres/seed-tenants.sql':'Datos tenant A/B sintéticos',
 'fixtures/smtp/fake-mail-server.md':'Proveedor SMTP local que no envía correos externos',
 'fixtures/oauth/oidc-stub.json':'Issuer local para validación de state/nonce/callback',
 'fixtures/oauth/facebook-stub.json':'Provider fake de Facebook aislado',
 'fixtures/vllm/stream-success.ndjson':'Fixtures SSE streaming, no GPU necesario',
 'fixtures/vllm/stream-abort.ndjson':'Fixtures disconnect y abort upstream',
 'fixtures/gpu/fake-node-metrics.json':'Evidencia sintética con etiquetas claras',
 'scenarios/auth-oauth-otp.sh':'E2E OAuth OTP/MFA y cookies en laboratorio',
 'scenarios/tenant-isolation.sh':'Intentos cruzados usuario/org/key',
 'scenarios/inference-streaming.sh':'Proxy SSE chunks/cancel/timeout y quotas',
 'scenarios/gpu-admission.sh':'Cargas saturadas y rechazo con GPU si existe',
 'scenarios/outbox-restart.sh':'Idempotencia ante worker/restart',
 'scenarios/postgres-failure.sh':'DB caído y degradación fail-closed',
 'scenarios/valkey-failure.sh':'Cola/cache caídos sin sobrepasar presupuesto',
 'scenarios/vllm-failure.sh':'Modelo no disponible y fallback seguro',
 'scenarios/backup-restore.sh':'RPO/RTO restore drill en DB aislada',
 'scenarios/upgrade-rollback.sh':'Migrations forward/rollout/recovery sin pérdida',
 'scenarios/monitoring-alerts.sh':'Disparo de alertas y validación de receivers',
 'scenarios/signature-reject.sh':'Imagen no firmada rechazada en promoción',
 'reports/README.md':'Esquema de reporte operativo; datos reales ignorados en git',
 'schemas/evidence.schema.json':'Contrato evidencia PASS/FAIL/NOT_RUN/BLOCKED por test',
 'docs/differences-from-production.md':'Diferencias host lab vs producción y riesgos',
}
for p,c in lab_files.items():add('prod-local',p,c,'Foundation','test' if p.startswith('scenarios/') else 'lab')

# Enrich traceability records; page lookup uses exact strings or documented consumer.
all_page_routes={p['route'] for p in raw_pages}
for e in raw_ep:
    e['page_route']=e['consumer'] if e['consumer'] in all_page_routes else ''
    if e['page_route']:
        e['page_file']=next(p['source_file'] for p in raw_pages if p['route']==e['page_route'])
    else:
        e['page_file']='N/A (SDK/infra/diálogo/shell; consumer documented)'

# Write CSV and JSON manifest for machine checking.
def save_csv(name, rows, fields):
    with (OUT/name).open('w',newline='',encoding='utf-8') as fp:
        w=csv.DictWriter(fp,fieldnames=fields,extrasaction='ignore')
        w.writeheader();w.writerows(rows)

endpoint_fields=['method','path','operation_id','module','controller','controller_file','service_file','dto_file','response_dto_file','authorization','consumer','page_file','unit_test','integration_test','api_e2e','security_e2e','bdd_tests','phase']
for e in raw_ep:e['bdd_tests']='; '.join(e['bdd_tests'])
save_csv('02-matriz-endpoints.csv',raw_ep,endpoint_fields)
page_fields=['route','source_file','feature','access','purpose','api','unit_test','browser_e2e','journey_e2e','phase']
save_csv('03-matriz-paginas.csv',raw_pages,page_fields)

all_files=sorted(items.values(),key=lambda z:(repo_keys.index(z['repo']),z['path']))
manifest={
 'title':'Inferra blueprint sincronizado, no implementado',
 'sources':{str(path.relative_to(OUT)):hashlib.sha256(path.read_bytes()).hexdigest() for path in (SOURCE,FILES_SOURCE,ORIG_SOURCE)},
 'counts':{'endpoints':len(raw_ep),'pages':len(raw_pages),'repos':5,'workspace':1,'files_proposed':len(all_files)},
 'endpoints':raw_ep,'pages':raw_pages,'files':all_files,
 'rules':{'root_package_json':False,'single_compose':'inferra-deploy/compose/compose.yaml','backend_ddl_at_http_boot':False,'manual_contracts_root':False}
}
(OUT/'architecture-manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')

# Pretty tree including an explicit # commentary on EVERY FILE.
def render_tree(entries,title):
    root={}
    for f in entries:
        sub=root
        parts=f['path'].split('/')
        for part in parts[:-1]:sub=sub.setdefault(part,{})
        if parts[-1] in sub:raise RuntimeError('duplicate '+f['path'])
        sub[parts[-1]]=f
    out=[f'### {title}', '', '```text']
    def walk(d,prefix=''):
        keys=sorted(d, key=lambda k:(not isinstance(d[k],dict) or 'path' in d[k], k))
        for i,k in enumerate(keys):
            value=d[k];last=i==len(keys)-1;bar='└── ' if last else '├── '
            if isinstance(value,dict) and 'path' in value:
                cc=value['comment'].replace('\n',' ').strip()
                out.append(prefix+bar+k+f'   # {cc} [{value["phase"]} | {value["kind"]}]')
            else:
                out.append(prefix+bar+k+'/')
                walk(value,prefix+('    ' if last else '│   '))
    walk(root)
    out.append('```');out.append('')
    return '\n'.join(out)

notes='''# Arquitectura de archivos sincronizada y comentada — INFERra

> **ESTADO: DISEÑO / NO_IMPLEMENTADO**. Este árbol describe archivos futuros; no se crearon cientos de stubs vacíos. Cada **archivo** tiene comentario `#` que explica ownership o verificación; `M1/M2/M3/S+` son fases. Los directorios se derivan de archivos con dueño real.

**Fuente de verdad:** `architecture-manifest.json` (trazabilidad, no configuración ejecutable). Se deriva de `inferra-mapa-apis-y-paginas-senior.md`: **163 operaciones HTTP y 71 páginas**; los dos CSV se generan desde el mismo manifiesto. No debe mantenerse una copia manual de rutas en varios docs.

**Precedencia de contrato corregida:** para endpoints/páginas prevalece el mapa más reciente sobre las tablas de ejemplo del primer blueprint; se usa `O = /api/v1/organizations/{organization_id}` y `A = /api/v1`. Para salud, `GET /api/v1/system/health/live|ready` solo internos; `GET /v1/models` es API-key-scoped. Para Compose, existe un único archivo.

**Criterio pragmático DDD:** servicios de lectura simples podrán agruparse al implementarse mediante ADR + actualización de manifiesto, sin cambiar operationId/contrato ni dejar rutas huérfanas. Los nombres aquí son ownership esperado, **no obligación de crear clases sin comportamiento**.

**IMPORTANTE:** una línea `#` es comentario del **árbol documental**, no sintaxis válida dentro de `.ts` o `.tsx`. En archivos reales corresponde `//`/`/** */`; YAML/Shell admiten `#`.

## Árbol completo (archivo → explicación)

'''
(OUT/'01-arbol-de-archivos-comentado.md').write_text(notes+'\n'.join(render_tree([i for i in all_files if i['repo']==r],f'{r}/  ({sum(i["repo"]==r for i in all_files)} archivos)') for r in repo_keys),encoding='utf-8')

# Feature-specific behavioral coverage gates (distinct from code coverage).
coverage='''# Plan de cobertura: unit, integración, API E2E, browser E2E, BDD y DevSecOps

## Principio de cobertura completa

- **Cobertura funcional objetivo: 100 % de las 163 operaciones inventariadas** vinculadas a controller, caso de uso, DTO, permisos, unit y contrato API E2E. La matriz CSV describe la prueba prevista; **no son 163 PASS ejecutados**.
- **Cobertura de navegación objetivo: 100 % de las 71 rutas** con `route-access.spec.ts` parametrizado (public/private/tenant/instance/403/404) y tests de journeys de alto riesgo. No convertir 71 rutas en 71 builds.
- **Coverage de código (umbrales propuestos de adopción):** backend 85 % statements/lines/functions y 80 % branches, baseline Vigilio; para auth, permission, quota, IDOR y streaming: aspirar a 95 % branches + tests negativos/concurrencia. El umbral no certifica seguridad ni elimina el threat model. Frontend 85/80 sobre lógica crítica, excluyendo vendor/generated justificadamente. Subir progresivamente según baseline medido, no bajar thresholds para aprobar.
- **Mutation testing:** incluir subset de OTP replay, quota reservation, RBAC y SSE parser. Objetivo de supervivientes críticos **0**; no afirmar cobertura sin ejecutarlo.
- **BDD:** escenarios de negocio por riesgo; no duplicar casos CRUD triviales en Gherkin. Si endpoint GET no participa en una regla de negocio, `bdd_tests` vacío justificado en matriz.
- **Data plane GPU:** suite simulada PR (siempre) y suite GPU real dedicada (nightly/release), métricas TTFT, TPOT, p95/p99, throughput, goodput, VRAM, errores y fairness.
- **Preflight E2E:** readiness real PG/Valkey/stub, fixtures deterministas, sin `sleep`, aislamiento tenant, clock inyectado, limpieza.

## Matriz de riesgos y capa propietaria

| Riesgo | Unit | Integración (real) | API E2E/contract | Browser E2E | BDD | Evidencia |
|---|---|---|---|---|---|---|
| DTO Zod y pagination | válido/inválido/límites | orden/filtro/count SQL | 400 y shape `{count,next,previous,results}` | formulario error/loading | No por CRUD simple | Vitest + Playwright |
| Login/password | hash + lockout + anti-enumeración | sesiones PG | 200/401/429/CSRF | login, redirect | auth/session-refresh-reuse | redacted JSON |
| Google/Facebook | state/nonce/PKCE, link policy | identidad única | callback spoof, replay, error provider | stub redirige/recupera | social-provider-linking | CI con proveedor fake, smoke real opt-in |
| Email OTP | expiración/attempts/hash single-use | consumo atómico paralelo PG | OTP viejo, replay, rate limit | solicitud/verify/reenvío | otp-single-use | resultado concurrente 1 success |
| MFA/step-up | política y recovery codes | códigos one-time PG | 401/403 paso sensible | enrollment y recovery | mfa-step-up | no códigos en logs |
| Multiempresa | ABAC/RBAC y último owner | SQL tenant-scoped/RLS si adoptado | IDOR cross-tenant 403/404 | org switching / cache purge | tenant-authorization | mismatch no filtra nombres |
| API key | scope, hash, expiry | rotation+reuse PG | Bearer wrong scope/revoke | once-only reveal | api-key-rotation | no plaintext persisted |
| Cuotas | reserva, settled/refund | atomicidad carreras PG | 429 vs 503 fail-closed | cuota restante | concurrency-budget | zero overspend |
| Inferencia SSE | parse chunks/abort | stub/upstream HTTP | OpenAI wire / stream [DONE] | streaming, abort/reconnect | stream-abort-settlement | trace abort upstream |
| Routing/fairness | selección healthy, weights | lease store, failover | fallback sin fuga org | políticas | fair-routing | per-tenant goodput |
| Deployments | transiciones/compatibilidad | job+outbox idempotente | comandos step-up 202/409 | rollback flow | deployment-transitions | logs + desired/observed |
| Benchmark | metodología y cálculo percentiles | persist runs/datasets | run/cancel/status/reports | progress+chart | reproducible-comparison | hardware/model digest |
| Artefactos RustFS | MIME/bytes/checksum/permissions | S3+ClamAV reales en perfil | upload→scan→download, SSRF | progress/error/scan | quarantine-before-download | objeto no público pre-scan |
| Backups/DR | guard admin+approval | pgBackRest + WAL | status/verify sin restore HTTP | revisión/readiness | backup-restore-drill | restore aislado RPO/RTO |
| Observabilidad | redacción/cardinalidad | OTel Collector/Loki/Tempo | traceparent y no PII | browser error | No (instrumentación) | promtool + dashboards |
| Webhooks | URL allowlist, firma y anti-SSRF | DNS rebind, retry | targets bloqueados y firma | canal/test | webhook-ssrf | no egress prohibido |

## Semántica de coverage

- `85 %` **no equivale** a “coverage completo” funcional. Cobertura se complementa con requisitos trazados, pruebas adversarias, propiedad SQL y fallos externos.
- Los cambios que añaden un endpoint o una ruta deben modificar manifiesto y matrices en el mismo PR (gate de cero huérfanos).
- Cuando una feature es futura, sus tests también tienen estado `NOT_RUN`. No usar `PASS` antes de ejecutar runner real.

## CI gate propuesto por repositorio

**inferra-impl:** `biome ci` → `tsc --noEmit` → Vitest unit + coverage → PostgreSQL/Valkey integration → Cucumber → Playwright API/security → OpenAPI export/diff → arquitectura/DTO browser-safe → SAST/SCA/secrets → build OCI+SBOM+signature.

**inferra-web:** `biome ci` → `tsc` → Vitest component/unit + coverage (MSW) → contrato browser-safe → Playwright (Chromium/Firefox/WebKit) → axe/teclado/visual revisado → bundle budget/CSP → OCI SBOM+firma.

**inferra-deploy:** YAML/Compose `config --quiet` por ambiente y perfil → conftest → promtool → Trivy → verifica firma digest → staging migración one-shot → smoke y rollback test.

**platform-ops:** ansible-lint/syntax-check → Molecule/host-compatibility → host hardening audit; no credenciales de producción en CI de apps.

**prod-local:** BDD/e2e integral con Compose real → escenarios fallos y recuperación → `operational-evidence.json` sin PII, tiempos RTO/RPO reales o `NOT_RUN`.

## Biome, TypeScript y pnpm

- `biome.json`: reglas de formato e imports ordenados, diagnóstico de complejidad, `noExplicitAny`, `noUnusedVariables`, no supresión general; overrides por generated cuando haya razón documentada.
- TypeScript `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` si dependencias y tipos lo permiten; validar todos los datos externos con Zod.
- `pnpm-workspace.yaml` **en cada repo de aplicación**, `packages: []`, `engineStrict: true`, `verifyStoreIntegrity: true`, `strictDepBuilds: true`, `dangerouslyAllowAllBuilds: false`, `minimumReleaseAge: 1440`, `allowBuilds` explícito según lockfile, `--frozen-lockfile` CI.
- CI con CODEOWNERS, commits protegidos, revisión security para auth/RBAC/data-plane, dependencias y secreto scanning, SBOM Syft, Trivy, Cosign keyless OIDC, promoción mismo digest, rollback y aprobación humana.
- vLLM, GPU, RustFS, PostgreSQL y Valkey no deben escuchar puertos públicos; Caddy TLS y reverse proxy; ninguna API HTTP ejecuta shell o Docker socket.

## Gates de seguridad no negociables

1. `Auth`: Google OIDC valida issuer/audience/signature/state/nonce, Facebook Graph OAuth valida state/provider ID, OTP hash one-time TTL; linked identities por ID de proveedor y confirmación de usuario. Todos opcionales al instalar offline.
2. `Sessions`: Secure HttpOnly SameSite con rotación de refresh, reuse detection; CSRF en mutaciones cookie; sesiones revocables.
3. `Authorization`: checks tenant+recurso dentro del service y SQL, step-up para operaciones GPU, costos, secrets y backups; instance admins no equivalen org admins.
4. `Gateway`: antes de conectar vLLM verifica API key/scope, modelo, cuota atómica, lease de concurrencia y policy; abort/unwind ante desconexión; no registra prompts.
5. `Supply chain`: SBOM firmado, digests, licencias/revisiones de modelos, checksum de pesos, never unpickle remoto sin revisión y allowlist de repos/modelos.
6. `Uploads`: RustFS privado, cuarentena/scan, short-lived presign, quota/checksum/content-type y protección contra XSS al descargar; si el endpoint RustFS es privado, browser usa proxy Caddy de subida *con scope restringido* o carga por backend, no URL inaccesible.
7. `Observabilidad`: logs/traces métricas sin prompts/API keys/PII, métricas low-cardinality, dashboards con control de acceso, retención y backup.
8. `DR`: copias en host separado, WAL/PITR y drills; backup no equivale a volumen Docker.

## Estados de evidencia actuales

| Gate | Estado | Motivo |
|---|---|---|
| Lectura local de blueprints y skills prioritarias | PASS | Documentos existentes en `/mnt/data`, revisados para este diseño |
| Trazabilidad estática manifiesto→árbol→CSV | PASS tras ejecutar `scripts/validate_architecture.py` | Validador incluye 163 endpoints, 71 páginas y referencias existentes |
| Repos de aplicaciones/clases/runtime | NOT_RUN | No se generó software real |
| Biome + TypeScript | NOT_RUN | Sin package/lock reales ni src |
| Vitest unit/integration/coverage | NOT_RUN | Sin código ni DB/Valkey de prueba |
| Playwright API/Web/BDD | NOT_RUN | Sin app ejecutable |
| Compose real, GPU, vLLM, firma OCI | NOT_RUN | Sin despliegue ni hardware habilitado |
| Restore drill PostgreSQL/RustFS | NOT_RUN | Sin backup real ni infraestructura independiente |
'''
(OUT/'04-plan-tests-y-devsecops.md').write_text(coverage,encoding='utf-8')

# Audit before/after, deliberate corrections.
before='''# Auditoría de sincronización — comparación de los blueprints suministrados

## Fuentes inspeccionadas

- `arquitectura-inference-platform-senior.md` — visión, DDD, despliegue y sample inicial de API.
- `inferra-arquitectura-archivos-senior.md` — árbol inicial de 5 repos.
- `inferra-mapa-apis-y-paginas-senior.md` — contrato de **163 operaciones** y **71 páginas**.
- ZIPs `skills(4).zip` y `vigilio-docs(3).zip`: perfil compose-vps, tests Nest/Web, ownership, Supply Chain y fuentes de versionado.

## Drift concreto corregido

1. **Sample HTTP inicial ≠ mapa definitivo:** `GET /health/live` vs `/api/v1/system/health/live`; `POST /auth/sessions/revoke` vs `DELETE /auth/sessions/{session_id}`; `/api-keys` como colección raíz vs `O/api-keys` con organización explícita; `/audit/events` vs `O/audit-events`. **Resolución:** el mapa más reciente rige para contrato e implementación futuros; no se mantiene el sample como API alterna.
2. **Árbol resumido sin módulos reales:** model-imports, datasets, alerts, webhooks, jobs, backups y observability-queries/cost-estimates no tenían ownership explícito. **Resolución:** módulos declarados y archivos asociados.
3. **Vistas antiguas vs rutas actuales:** `recover-account.page.tsx`, `verify-email.page.tsx`, `playground-history.page.tsx` no corresponden necesariamente a las 71 rutas; faltaban `forgot-password.page.tsx`, `reset-password.page.tsx`, `playground-session.page.tsx`, `create-api-key.page.tsx`, `cost-estimates.page.tsx`, etc. **Resolución:** se enumeran las 71 páginas exactas en `inferra-web/src/features/*/pages/`.
4. **DTOs y caso de uso solo en algunos endpoints:** árbol previo tenía modelos de ejemplo, no trazabilidad 1:1 con el contrato API. **Resolución:** cada operationId tiene owner, service, controller y DTO/salida en CSV; agregación de servicios de lectura solo por ADR.
5. **Pruebas ilustrativas, no trazabilidad completa:** los tests de auth, tenant y SSE carecían de ownership por todas las APIs/71 páginas. **Resolución:** matrices de pruebas por endpoint y vista; BDD solo donde reglas de negocio lo justifican.
6. **Unidad de release:** instalar desde un solo `compose.yaml`, backend imagen única con procesos api/worker/outbox/migration/platform-setup; no introducir un servicio Docker distinto por módulo NestJS.
7. **Alcance real:** RustFS solo con datasets/artifacts, CPU demo sin prometer GPU, social login opcional, bootstrap seguro offline, sin AWS/K8s/Rust para lógica de servidor.

## Lo que se valida y lo que no

- **Validación estática**: duplicados, referencias a archivos, recuentos, proyección de páginas, namespacing y Compose único. La prueba se ejecuta localmente contra el manifiesto generador.
- **No significa aplicación ejecutable**: archivos del árbol son planes; no existen controllers reales, tests green, OpenAPI compilado, runtime GPU o restore drill probado. Todos ellos `NOT_RUN`.
- **Nuevo cambio de endpoint o ruta**: actualizar mapa y volver a generar; fallar PR si `validate_architecture.py` detecta faltantes/drift o cambian conteos sin aprobación.
'''
(OUT/'05-auditoria-y-correcciones.md').write_text(before,encoding='utf-8')

summary=f'''# Inferra S+ — Blueprint sincronizado

**Estado:** documentación de diseño, no software implementado. Fecha: 2026-11-08.

**Fuentes de verdad:** el CSV de endpoints contiene {len(raw_ep)} rutas; el de frontend contiene {len(raw_pages)} páginas; la proyección de {len(all_files)} **archivos planeados** en cinco repositorios y coordinador incluye comentario `#` por archivo. Las fases M1/M2/M3/S+ impiden crear todo como scaffolding vacío desde el inicio.

## Contenido

- `01-arbol-de-archivos-comentado.md`: inventario de **todos** los archivos propuestos, uno por línea y `#` explicativo.
- `02-matriz-endpoints.csv`: cada API con método, path, operación, módulo, controller, DTO, service, scopes, frontend y tests.
- `03-matriz-paginas.csv`: cada URL con componente, feature, acceso y pruebas.
- `04-plan-tests-y-devsecops.md`: unit/integration/API/BDD/browser/load/GPU, cobertura, Biome y seguridad.
- `05-auditoria-y-correcciones.md`: qué estaba desalineado antes y cómo se corrige.
- `architecture-manifest.json`: trazabilidad estructurada; NO configuración ejecutable.
- `scripts/generate.py`: generador del diseño desde mapa de API y páginas.
- `scripts/validate_architecture.py`: auditoría estática que exige referencias 1:1 y cero rutas huérfanas.

## Regla de mantenimiento

No editar CSV/árbol a mano. Modificar primero el documento de APIs/rutas cuando haya acuerdo de producto y regenerar los artefactos. Al implementar, contrastar el `operationId` y el componente realmente registrados contra los manifiestos usando tests OpenAPI y route-registry.

## Límites explícitos

No se ejecutó NestJS, Biome, Playwright, Cucumber, Compose ni vLLM. Las cifras certifican **consistencia de documentación propuesta**, no cobertura efectiva. `architecture-manifest.json` no reemplaza OpenAPI generado desde backend ni route-registry real.
'''
(OUT/'README.md').write_text(summary,encoding='utf-8')
print(f'Generated {len(raw_ep)} API endpoints, {len(raw_pages)} frontend pages, {len(all_files)} distinct proposed files')
print('Repositories:',dict(Counter(x['repo'] for x in all_files)))
print('Modules endpoint ownership:',dict(sorted(Counter(x['module'] for x in raw_ep).items())))
