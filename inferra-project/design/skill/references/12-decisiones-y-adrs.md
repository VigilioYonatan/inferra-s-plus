# 12 — Decisiones humanas, ADRs y matriz de configurabilidad

Esta es una **lista de decisiones materiales para ratificar** antes de implementar comportamientos irreversibles. El usuario ya decidió NestJS, Docker Compose, self-hosted, sin AWS/Kubernetes, RustFS opcional, Google/Facebook y OTP; **no volver a preguntar lo resuelto**. Las recomendaciones siguientes son defaults de diseño, no consentimiento humano sobre asuntos de privacidad/legal/costos.

## Decisiones pendientes (PROPOSED, no aprobadas por el usuario)

| ID | Decisión | Recomendación provisional | Por qué requiere aprobación / bloqueo |
|---|---|---|---|
| D-001 | Registro público | Deshabilitado para instalación corporativa; habilitable por admin con anti-abuse | cambia superficie de ataque y admisión de usuarios |
| D-002 | Acceso sin Google/Facebook | Permitido por password/OTP local; OIDC opt-in | disponibilidad offline y contingencia proveedor |
| D-003 | Política de MFA | obligatorio para instance admins, configurable org | experiencia, soporte y seguridad |
| D-004 | Sesiones | opacas server-side + rotación por amenaza; expiración configurable | duración, revocación y UX |
| D-005 | Captura de prompts | disabled por defecto en serving, Playground opt-in | privacidad/retención/legal |
| D-006 | Retención auditoría/logs | configurable con límites y documentación | GDPR/LPDP y normativas aplicables requieren jurisdicción |
| D-007 | Presupuestos/costo | estimaciones no facturación real | tarifa real, moneda, amortización, impuestos y chargeback |
| D-008 | Roles instancia/organización | separados, least privilege, step-up | aprobación de permisos privilegiados |
| D-009 | Descarga de modelos | fuentes allowlisted, licencia/revision y hash verificados | código/pesos remotos y derechos de uso |
| D-010 | Mecanismo multi-host | 1 host inicial, 1–3 por ADR con métricas | mayor complejidad de seguridad y datos |
| D-011 | Backup/RTO/RPO | pgBackRest PITR fuera del host; objetivos por negocio | costo, pérdida aceptable y disponibilidad |
| D-012 | SMTP y OAuth reales | configuración externa por admin; Mailpit/OAuth fake en tests | client secrets no van en git; hay prerequisitos de proveedores |
| D-013 | Object storage | RustFS activado con artifacts/datasets | backups, scan, gasto en disco |
| D-014 | Model serving dual CPU/GPU | GPU objetivo; CPU demo explícitamente limitado | sin promesas de throughput GPU en modo CPU |
| D-015 | Aprobación de deploy/restore | step-up y audit; operaciones host privilegiadas fuera HTTP | riesgos de host/destructividad |

Para cada decisión documentar responsable, fecha, estado, alternativas, motivo, controles, migración, impactos en APIs/UX/tests y evidencia. Los defaults reversibles pueden modelarse en YAML y UI; no activar de forma unilateral decisiones de retención, facturación, privilegios o eliminaciones irreversibles.

## ADRs propuestos

- `ADR-001` Nivel 1 Compose VPS, 5 repos.
- `ADR-002` NestJS modular, DDD pragmático, ports+adapters.
- `ADR-003` runtime vLLM privado con profile provisioner allowlisted.
- `ADR-004` identity cookie session + service API key.
- `ADR-005` Zod DTO owner + browser-safe contract derivado.
- `ADR-006` PostgreSQL+Drizzle durable, Valkey/BullMQ y outbox.
- `ADR-007` cuota atomic reservations + final ledger reconcile.
- `ADR-008` RustFS opcional con quarantine.
- `ADR-009` threat model de model weights & prompt content.
- `ADR-010` release OCI signed same digest, no automatic DB down migration.
- `ADR-011` SLO y backup externo con restore drill.
- `ADR-012` OAuth optional y modo offline seguro.

## Cambios de diseño que exigen ADR y aprobación

Cambio de público a registro autoabierto, permisos wildcard, social linking automático, almacenamiento de prompts, exposición GPU, descargas arbitrarias, shell en host, uso de proveedor de inferencia remoto, cobro real, subidas públicas, migración destructiva, nueva topología multi-host, desactivar logs de auditoría, cambiar contrato de error/paginación, downgrade seguridad de release o excepciones permanentes de CVE.
