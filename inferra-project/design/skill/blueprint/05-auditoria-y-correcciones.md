# Auditoría de sincronización — comparación de los blueprints suministrados

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
