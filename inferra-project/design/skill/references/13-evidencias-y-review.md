# 13 — Evidencia verificable, review independiente y sincronización

## Registro mínimo por cambio

```yaml
change_id: INFER-001
intent: feature
phase: BUILD
repo: apps/inferra-impl
module: identity
skills_loaded: []             # names realmente abiertos, no propuestos
canonical_sources_read: []    # paths + revisión/hash cuando aplique
code_files_changed: []
contracts_affected: []
frontend_routes_affected: []
risks: []
checks:
  biome: NOT_RUN
  typecheck: NOT_RUN
  unit: NOT_RUN
  integration: NOT_RUN
  api_e2e: NOT_RUN
  browser_e2e: NOT_RUN
  bdd: NOT_RUN
  openapi_diff: NOT_RUN
  authz_cross_tenant: NOT_RUN
  container_scan: NOT_RUN
  image_signature: NOT_RUN
  gpu_benchmark: NOT_RUN
  restore_drill: NOT_RUN
review:
  independent_read_only: NOT_RUN
  findings: []
  design_score_1_to_10: null
  implementation_verified: false
```

Los estados válidos son `PASS/FAIL/BLOCKED/NOT_RUN`; un gate ajeno a la feature puede ser `NOT_APPLICABLE` si se justifica. No inventar evidencia, timestamps, números de coverage ni firma verificada. Los reports contienen hashes/sha de artefactos y acceso limitado, sin PII.

## Trazabilidad y sincronización

`requirement/user-story → route(page)/operationId → controller → DTO → application service → policy/port → adapter → unit/integration/api-e2e/bdd → observable metric → runbook/ADR`. Añadir rutas sólo modificando owner del mapa, generar derivaciones y comparar el OpenAPI/route-registry real en CI. Los CSV son plan; cuando exista código, el mapa debe reconciliarse con runtime. Tests deben detectar rutas extra y rutas faltantes.

## Review independiente y negative tests

La fase REVIEW es read-only y no corrige código; si halla defectos pasa a FIX y luego REVIEW otra vez. Checklist: ownership/ciclos, contrato backward compatibility, `@Public` y scopes, tenant IDOR, race/double submit, SQL N+1, transacciones/outbox, secret exposure, missing fallback/abort, GDPR/retención, conformance con manual de operador, a11y/UX, false green y métricas inventadas.

**Semáforo para publicación:** `DESIGN` solo prueba especificación. `STRUCTURAL_PASS` prueba consistencia de archivos. `PROJECT_PASS` exige tests reales y artefacto. `PRODUCTION_READY` requiere verificación de host/provisión, TLS, firma, restauración y alertas reales. Ninguno es certificación regulatoria.

## Índices de verificación automatizados

`python3 scripts/validate_super_skill.py` compara cada fila con archivos planteados, cuenta 163 endpoints/71 rutas/1.632 archivos, revisa documentos obligatorios, existen headers/links locales, y detecta endpoints duplicados. Se puede ampliar con `openapi export` y route discovery al construir app real. Este script no se conecta a DB ni vLLM.
