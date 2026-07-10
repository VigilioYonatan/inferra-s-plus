# 09 — Observabilidad, SRE, incidentes, backup y DR

## Modelo de instrumentación

```text
Preact Web Vitals / errores sanitizados
           | traceparent
      NestJS OpenTelemetry + Pino
        |     |           \
     vLLM   Valkey/PG    worker/outbox
           |
       OTel Collector
        /     |      \
   Prometheus Tempo    Logs -> Alloy -> Loki
        \     |      /
             Grafana -> Alertmanager -> SMTP/webhook seguro
```

La correlación de trazas no incluye prompt, token, API key, email, IP completa, session ID o objeto ID en *labels métricos*. IDs pueden ir en trazas/logs redactados con política de acceso/retención estricta, nunca como labels de cardinalidad ilimitada. Logs Pino con niveles, request ID y `error_code`, sin bodies HTTP por defecto. En web evitar RUM de texto/chat privados.

## Señales y dashboards

| Dashboard | Métricas y diagnósticos |
|---|---|
| API RED | request rate, error rate, p50/p95/p99 latency por ruta normalizada |
| Identity | OTP sent/verified/replay rejected, OAuth callback success/fail, lockouts, MFA step-up failures agregados |
| Serving | request/s, tokens/s, TTFT/TPOT/ITL, queue latency, goodput, inference duration, per-model errors |
| GPU | available memory, peak VRAM, occupancy, temperature, utilization y OOM donde DCGM soportado |
| Quotas | reservations, settlement/refunds, over-budget rejects, lease expiration, discrepancies |
| Workers | queue depth, oldest queued age, retries, dead-letter, outbox backlog |
| Storage/DB | PG connections, replication/WAL archive, disk headroom, migration status, object scan/quarantine |
| SRE | SLI/SLO burn-rate, synthetic probe external, Alertmanager deliveries, restore drill age |
| Business | tokens/org agregados con control de acceso, costos explícitamente estimados por assumptions |

**No** instrumentar Prometheus con `user_id`, `api_key_id`, correo, UUID, prompt o token como labels. Para dashboards por org usar consultas autenticadas a PostgreSQL/aggregates o endpoints de métricas autorizados que no expongan el sistema global, con límites de cardinalidad.

## SLI/SLO propuestos (requieren aprobación y baseline)

- `availability`: fracción de operaciones válidas de inferencia que obtienen inicio y completan dentro de SLO, separando fallos atribuibles al cliente de fallos de plataforma.
- `latency`: p95 TTFT por clase de modelo/contexto/carga; no comparar GPU diferentes sin etiqueta.
- `correctness`: cero sobreconsumo por carreras en reservas, cero fugas IDOR detectadas, consistency ledger.
- `jobs`: % de deploy jobs completados dentro de ventana y cola dentro de umbral.
- `restore`: edad último restore drill exitoso y RPO/RTO medidos, no supuestos.

Definir thresholds con baseline medido y error budget. Alertas preferidas por burn-rate/SLO, backlog anómalo, OOM, discos críticos, WAL archive failure, alto 5xx/429 con contexto, expiración TLS y falta de backups; cada alerta tiene `runbook_url`, owner, severidad, inhibición y ruta real. Validar con `promtool check rules` + `promtool test rules` positivo y negativo.

## Logging, traces y accesos

- Enmascarar `Authorization`, `Cookie`, password, OTP, OAuth code/state, API key, URL presigned y bodies de prompt en Pino, Collector y proxy; revisión de payloads ante excepción.
- Retenciones distintas: datos de seguridad/auditoría según política y requisitos, trazas de alta frecuencia resumidas/cortas, logs saneados con expiración. Exportaciones controladas con permisos y auditoría.
- Grafana/Prometheus/Tempo/Loki no expuestos públicamente sin autenticación fuerte; acceso via reverse proxy interno o VPN, secrets por volúmenes restringidos.
- Capturar traces de endpoints críticos y sampling que preserve fallos sin registrar contenido sensible; cross-service correlation por `traceparent` validado/saneado.

## Resiliencia y modos degradados

- vLLM OOM/mem pressure → admission control, 503, failure classification, stop/drain y rollback profile.
- PostgreSQL caída → admin API fail-closed en writes y generación nueva si requiere ledger; no crear inferencia sin posibilidad de accounting seguro.
- Valkey caída → jobs retrasados/rate-limit degradado de manera fail-closed; transacciones críticas usan DB coherente y fallback solo probado.
- OTel/Loki/Tempo caído → serving sigue solo si no hay requisito legal/seguridad que obligue auditoría durable; buffers acotados y drop metrics con alertas.
- Object storage/ClamAV caído → uploads quedan pendientes/quarantined, nunca servidos como clean.
- Agente host ausente → deployments pasan a pending/failed con retry auditado; API no lo suplanta con privilegios.

## Backup y DR

**Política 3-2-1 real:** PostgreSQL `pgBackRest` con backups base y WAL continuo (PITR) hacia host o repositorio S3-compatible externo al mismo dominio de fallo; `rustfs` en host local no cuenta como copia externa de sí mismo. Separar copia de manifests/config/secret references y claves de cifrado. Usar encryption at rest/transit con custodia segura de claves.

**Runbook restore:** declarar incidente y freeze writes → obtener backup/WAL y claves de forma autorizada → levantar entorno aislado sin egress → restaurar a timestamp, medir RPO/RTO → comprobar referencial, ledger vs objetos y replay outbox → sanitizar sesiones/API keys si compromiso → validar OpenAPI/smoke → cutover DNS/TLS → registrar evidencia. Ensayar en `prod-local` o host aislado semanalmente según riesgo; ejercicios automatizados no substituyen simulacro cross-host. Nunca ejecutar restore destructivo de producción desde un botón HTTP genérico.

**Rollback:** aplicar digest OCI previo, verificar DB schema compatible; migraciones contract/destructivas se posponen y requieren plan backfill. vLLM rollback puede requerir cache/warmup nuevo y control de capacidad.

## Runbooks esperados

- `model-oom.md` / `gpu-driver-incompatible.md`
- `inference-high-ttft.md` / `queue-backlog.md` / `quota-ledger-mismatch.md`
- `oauth-provider-outage.md` / `otp-email-delivery-failure.md`
- `postgres-unavailable.md` / `valkey-unavailable.md` / `rustfs-unavailable.md`
- `backup-wal-archive-failure.md` / `restore-drill.md`
- `compromised-api-key.md` / `tenant-data-exposure.md`
- `signed-image-rejection.md` / `failed-release-rollback.md`

Cada runbook: detección, impacto, severidad, primero no empeorar, mitigación, recovery, evidencia, owner y postmortem. Los números de SLO y tiempos RTO/RPO son decisiones de negocio, no inventar.
