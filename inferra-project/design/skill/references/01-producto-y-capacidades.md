# 01 — Producto, actores, capacidades y límites

## Propósito verificable

**Inferra S+** permite que una empresa aloje modelos de lenguaje en GPU propia, exponga APIs de inferencia gobernadas y observe/optimice rendimiento. No es un proveedor remoto de modelos, ni un editor de agentes generalista, ni un servicio SaaS obligatorio. El software de control y los datos críticos permanecen en el host del cliente. Los usuarios pueden configurar Google/Facebook OAuth, SMTP u otras dependencias externas de manera opt-in.

## Usuarios/personas

1. **Instance Owner**: bootstrap único, host, GPU, backups, políticas globales, actualizaciones y seguridad.
2. **Instance Operator/SRE**: observabilidad, incidentes, mantenimiento y GPUs sin autoridad automática para exportar datos de organizaciones.
3. **Org Owner/Admin**: miembros, presupuestos, modelos propios, API keys y auditoría organizacional.
4. **Developer**: integrar SDK/API, probar Playground, consultar errores y uso autorizado.
5. **ML Engineer/Researcher**: registrar modelos, configurar perfiles aprobados, hacer benchmarks y experimentos.
6. **FinOps/Analyst**: costes estimados, tokens, cuotas y comparaciones con acceso de solo lectura.
7. **Auditor/Viewer**: revisar actividad, cumplimiento y configuración sin capacidad de cambiar la infraestructura.
8. **External service**: API key con scope limitado a org, modelo, acción, vencimiento y cuotas.

## Aplicaciones / superficies que tendrá la plataforma

| Aplicación de producto | Capacidades visibles | Principales límites |
|---|---|---|
| Identity Center | Register, password, forgot/reset, Google, Facebook, OTP, TOTP MFA, recovery codes, sesiones y conexiones sociales | Anti-enumeración, state/nonce, hash OTP, cookies/CSRF y step-up |
| Organization Center | Crear org, invitar, revocar, roles, permisos, cambio org | RLS/scopes y último owner protegido |
| Developer Portal | API keys, docs, ejemplos SDK, rotaciones, uso | Token mostrado una sola vez, scopes por modelo |
| Model Hub | Modelos, revisiones, capacidades, licencias, compatibilidad y fuentes allowlisted | No ejecutar código/modelo descargado sin revisión |
| Runtime Deployments | Perfiles de inferencia, preflight hardware, ciclo desired/observed, logs y rollback | Sin Docker socket ni shell desde HTTP |
| AI Playground | Chat streaming, parámetros, historial por org, stop, comparación | Salida segura, truncamiento, cuotas y redacción |
| Resource Center | GPUs/nodos, VRAM, salud, colas, capacidad y mantenimiento | Instance scope; GPU no compartida sin aislamiento explícito |
| Quotas & Usage | Presupuestos, reservas, contabilidad de tokens, uso/costo estimado | Respuestas conciliadas, no doble cobro por retry |
| Optimization Lab | Benchmarks, workloads, resultados TTFT/TPOT/goodput, perfiles, experimentos A/B | Mismo hardware/dataset y evidencia del baseline |
| Observability Center | Trazas, errores, latencia, logs saneados, SLO, alertas | No PII/secretos en logs ni labels |
| Data & Artifacts | Datasets, importaciones, objetos vía RustFS, exportaciones | Opcional; cuarentena, checksum, escaneo y ACL |
| Platform Admin | Instalación, políticas instancia, trabajos, backups, recuperación, releases | Step-up, funciones peligrosas aprobadas y auditadas |
| Notifications/Webhooks | SMTP, alertas, destinatarios, webhooks de eventos | Firma, retries, anti-SSRF y controles de salida |

## Journeys críticos (incluyen fracaso y recuperación)

**J01 Registro:** `/register` → validación e-mail/password/consentimiento → challenge de verificación → flujo de confirmación seguro y `/onboarding` → crear organización → invitación opcional → panel. Registro público es una decisión instalable, deshabilitado por defecto en instancias corporativas; anti-bot y rate-limiting. Verificación de email no crea privilegios administrativos.

**J02 Acceso tradicional:** `/login` → password o solicitar OTP → verificación con intentos limitados → posible MFA → establecer sesión segura → restaurar destino autorizado → dashboard. `logout` y `logout-all` invalidan credenciales y sockets; sesión inválida vuelve al login sin revelar datos cacheados.

**J03 Social:** `login → Google / Facebook → start OIDC/OAuth → callback server → comprobar state/issuer/audience/nonce en Google, provider ID y política Facebook → cuenta existente vinculada o alta controlada → step-up al enlazar` (nunca vincular solo por email si proveedor no lo verifica). Si proveedor externo falla, presentar recuperación y login local.

**J04 Primera inferencia:** onboarding hardware/modelo → preflight GPU y licencia → seleccionar perfil allowlisted → solicitar deployment → worker/provisioner autorizado → runtime healthy → crear API key → SDK hace `POST /v1/chat/completions` → recibir SSE → ledger/usage/metrics → panel. Si no hay GPU, ofrecer demo CPU limitado con etiqueta clara.

**J05 Optimización:** seleccionar baseline fijo → dataset licenciado y muestreado → concurrencia/perfiles → ejecuciones controladas → comparar TTFT, TPOT, goodput, throughput, VRAM, calidad y errores → promover candidato con aprobación/rollback. No mostrar ahorro como hecho sin medirlo.

**J06 Incidente:** alerta por SLO → dashboard de salud → logs/traces redactados → drenar runtime → fallback permitido, no cross-tenant → recuperar → postmortem → pruebas de no regresión.

**J07 Pérdida de host:** restauración `pgBackRest` y objetos/config separadamente desde sitio independiente → comprobar WAL/PITR, RPO/RTO y consistencia de ledger → rotate compromised secrets → DNS/TLS → smoke E2E. Un volumen local no es backup.

## Requisitos no funcionales

- **Disponibilidad:** SLO a acordar; sistema Compose nodo único no implica HA automática.
- **Seguridad:** OWASP ASVS/API Top 10, aislamiento tenant, licencia y procedencia de modelos, defensa contra SSRF, replay, IDOR, prompt/data leakage.
- **Privacidad:** prompts no persistidos por defecto salvo Playground con consentimiento/ajustes; borrado y export policy por tenant; no asumir regulación específica sin jurisdicción acordada.
- **Rendimiento:** baseline por modelo/hardware/carga; colas y cancelaciones; límites de tamaño/contexto/output.
- **Escalabilidad:** 1–3 hosts con Compose, escalado horizontal solo medido; no prometer multi-host transparente en MVP.
- **Mantenibilidad:** owners y contratos; cero módulos framework para UI; dependencias pinned, CI y runbooks.
- **Accesibilidad:** WCAG 2.2 AA como objetivo web verificable, teclado/foco/lector de pantalla/contraste/responsive.
- **Instalación:** `install`, `preflight`, `verify`, `status`, `backup`, `upgrade`, `rollback` seguros, idempotentes y documentados.

## Out of scope explícito para M1/M2

- Reimplementar kernels vLLM, PagedAttention o continuous batching.
- Billing real de tarjetas/Stripe, mercado de GPUs externas, venta de tokens o costes financieros vinculantes.
- GPU multi-tenant con aislamiento de VRAM/memoria garantizado sin particionamiento y verificación hardware.
- Fine-tuning distribuido, RAG completo, agentes autónomos o almacenamiento obligatorio de prompts.
- Self-registration público sin rate limit/abuse controls, sin decisión de operador.

## KPIs y métricas de producto

**Activación:** instalación verificada → primer admin → primer modelo saludable → primera llamada API. **Operación:** éxito inferencia, p95 TTFT, throughput, uso GPU, errores/429, edad backlog, generación total, latencia de deploy, restore drill. **Seguridad:** 0 fugas cross-tenant en suites negativas, incidentes por sesión, claves rotadas, secretos detectados. **UX:** tiempo a primera inferencia, tasa de error onboarding, éxito de tareas, accesibilidad.
