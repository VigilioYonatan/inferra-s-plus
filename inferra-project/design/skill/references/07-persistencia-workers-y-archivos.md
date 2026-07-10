# 07 — PostgreSQL/Drizzle, Valkey/BullMQ, RustFS y datos

## PostgreSQL — ownership y transacciones

Use PostgreSQL como fuente de verdad; Drizzle como adaptador persistencia con migraciones inmutables revisadas. Cada bounded context define schema Drizzle en `infrastructure/persistence/drizzle/schema.ts` y repositorios por aggregate/use case, no por tabla. Un módulo central registra conexión/pool y transacciones; `application` consume interfaces/ports, no conoce SQL.

**Constraints importantes:** unique provider+subject, índices por `organization_id`/fecha/cursor, un owner garantizado por transacción/policy, foreign keys con scope, índices TTL/expiración que puedan limpiarse, idempotency keys, jobs/outbox, reconciliación de ledger. Revisar EXPLAIN ANALYZE y N+1; separar consultas de métricas volumétricas de transacciones de auth. `migrate` proceso one-shot fuera del arranque HTTP y compatible con rollback/expand-contract.

**Tenant defense in depth:** `WHERE organization_id = authorized_org_id` en queries, no filtrar después de leer; RLS es opción adicional por ADR con pruebas de bypass/roles, no sustituto de policy de aplicación. Auditar caches, exports, jobs y enlaces a objetos.

## Valkey / BullMQ

Valkey permite rate limits, sesiones efímeras, leases de capacidad, colas de workers y caché. No usar como único ledger financiero ni como sustituto de DB durable. En failure, adoptar política explícita fail closed cuando protege gasto/acceso. Workers usan idempotencia, retries acotados, dead-letter strategy, timeouts, shutdown graceful y métricas de backlog/edad/errores. La cola puede entregar al menos una vez: no asumir exactly-once.

**Eventos:** tabla outbox en la misma transacción que write de dominio. Publicador separado selecciona filas `FOR UPDATE SKIP LOCKED`, publica a BullMQ después del commit y marca estado de manera recuperable. Handlers idempotentes guardan `processed_events` (inbox) para evitar efecto duplicado. No incluir prompts, OTP, API keys ni datos sensibles en payloads. Versionar envelopes de eventos sin duplicar DTO HTTP.

**Jobs previstos:** envío email, importación modelo, hardware preflight, deployment, benchmarks, reportes/export, webhooks, limpieza de objetos/challenges, reconciliación de cuotas y verificación backup. Each job has tenant context validable, request ID, retry policy, dead-letter y progress observable.

## RustFS (opcional, por perfil)

Solo habilitar al crear datasets, subir artefactos, almacenar reportes o datasets/exports. RustFS es un servicio S3-compatible en red backend; cada objeto queda en bucket/prefijo con owner, checksum, tipo de contenido, tamaño, metadata y clasificación. El navegador puede usar un proxy autorizado de Caddy para presigned URL dentro de entorno self-hosted, o streaming backend; no generar presign apuntando a hostname solo accesible dentro de Compose.

### Upload secure workflow

1. Autenticar sesión y org; `POST .../uploads/presign` valida propósito, MIME allowlist, tamaño, cuota, scope, checksum, TTL y bucket/prefix privado.
2. Generar URL de subida breve o upload proxy autenticado. Objeto subido queda en prefijo de **quarantine** sin acceso público; CORS restringido por origin real.
3. Confirmar subida con object version/checksum; worker verifica magic bytes vs MIME, tamaño, AV/ClamAV si perfil lo requiere, licencia/extension, malware y descompresión maliciosa.
4. Promover a `clean` con metadata inmutable si scan PASS; si falla eliminar/cuarentenar, no servir ni permitir ingestión.
5. Descarga autenticada emite URL firmada de lectura con expiración y content-disposition seguro; probar IDOR, TTL, replay y revocación.
6. Borrado/retención y backups externo consistente con DB; reconciliar objetos huérfanos y operaciones parcialmente completadas.

**No usar** nombres de archivo como rutas host, `public-read` por defecto, URLs externas sin allowlist/anti-SSRF, webhooks que descargan cualquier URL interna, ni ejecutar código remoto de modelo importado. El modelo puede requerir pesos grandes y formatos peligrosos: impedir confianza automática de código serializado.

## Políticas de datos y privacidad

- Prompts y outputs no se guardan en los logs de inferencia; Playground puede conservar mensajes por elección de usuario/instancia y retención definida.
- Auditoría append-only con actor, resource, action, timestamp, result y request ID saneados; datos sensibles se minimizan, retención se decide por política.
- Datos para benchmarks anonimizados/sintéticos/licenciados; no usar conversaciones productivas sin consentimiento/justificación.
- Costo estimado se almacena con assumptions versionadas (hardware depreciation, energía, utilización), no se convierte automáticamente en facturación.
- Backups de DB, object store y secrets tienen dominios de fallo separados y pruebas de restauración.

## Testing y edge cases

SQL integration para unique/FK, rollback, owner y tenant scope; doble verify OTP, doble reserva concurrente, outbox crash after commit, duplicate event, delayed worker, Redis/Valkey unavailable, upload partially finished, scan infected, URL expirado y restore inconsistente. Inyección de tiempo para TTL, locks y retención; fixtures por tenant deterministas, sin dumps productivos.
