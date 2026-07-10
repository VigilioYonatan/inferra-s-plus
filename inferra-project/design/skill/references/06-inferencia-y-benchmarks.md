# 06 — Motor de inferencia, scheduler, GPU, calidad y benchmarking

## Alcance real del motor

vLLM es la infraestructura especializada de serving. Inferra administra e instrumenta su operación, con puertos `InferenceRuntimePort`, `RuntimeCapabilitiesPort` y `RuntimeHealthPort`. **No reimplementar** kernel CUDA, PagedAttention, KV-cache o continuous batching en NestJS; cualquier mejora S+ se debe demostrar con control de admisión, políticas de routing, perfiles, benchmarking y trade-offs medidos. Soporte efectivo de Llama/Qwen/Mistral/DeepSeek depende de licencia, formato, cuantización, VRAM y versión vLLM instalada.

## Data-plane seguro

```text
POST /v1/chat/completions
   -> Parse Zod / tamaño / allowlist parámetros
   -> BearerApiKeyGuard + organization & model policy
   -> Check quota/reserve budget idempotently
   -> AdmissionControlLease (per org, model, priority)
   -> RoutingPolicy (healthy, sufficient VRAM, capabilities)
   -> VllmOpenAiAdapter (timeout, circuit breaker, AbortSignal)
   -> StreamNormalizer / SSE writer (backpressure, disconnect)
   -> Usage settlement/refund/reconciliation
   -> Audit metadata + OTel/metrics (NO prompt content)
```

Una API key de un tenant nunca puede elegir `base_url` de vLLM ni sobrescribir headers de forwarding. Lista cerrada de nombres/IDs de despliegues expuestos. No invocar rutas administrativas de vLLM desde internet; gRPC/HTTP internos en red privada con políticas adicionales.

## Scheduling, cuotas, fairness y fallos

- **Admission:** solicitudes máximas por org/modelo, límites de tokens reservados, límites globales GPU, prioridades deterministas y anti-starvation.
- **Reservation:** contabilizar prompt y salida estimados/reales; tasa, bursts y token budget en storage atómico; evitar overruns por concurrencia; idempotency y TTL más reconciliador.
- **Routing:** host/modelo healthy, contexto soportado, memoria disponible, carga, fallos; no route a otro tenant sin policy; reglas explicables y trazables.
- **Backpressure:** si no se puede ejecutar, `429` (tenant quota) o `503` (upstream no disponible/capacidad); `Retry-After` coherente. Evitar colas infinitas y requests abandonadas.
- **Timeouts:** separaciones connect, queue, TTFT, inter-token y total; abort upstream; no reintentar generaciones no-idempotentes si hubo tokens enviados.
- **Fallback:** solo modelos explícitamente autorizados y compatibles en scope/contexto; no cambiar a otro modelo silenciosamente para operación sensible.
- **Circuit breaker:** métricas de errores/fallos por instancia, half-open controlado; prueba de recuperación.
- **Leases:** en caídas/restarts libera capacidad por TTL o reconciliador; nunca fingir exactly-once de tokens.

## Catálogo y despliegues

Cada modelo tiene `model_id`, `revision/digest`, origen allowlisted, hash/verificación cuando procede, licencia, parámetros aprobados, context window, tareas soportadas, cuantización compatible y sizing GPU. Cada deployment registra `desired_state`, `observed_state`, progreso, `runtime_profile` versionado, GPU/host placement, health y fechas.

**State machine ejemplo:** `registered → validating → scheduled → pulling → loading → ready → draining → stopped`, con `failed` transitorio/terminal y rollback aprobado. Los IDs/estados finales deben convertirse en schema único y testear transiciones. El worker o un agente host mínimo ejecuta allowlisted recipes, sin shell arbitraria ni acceso privilegiado desde HTTP; admisión exige preflight, permisos y step-up.

**Cuantización:** no es sinónimo automático de mejor velocidad; medir accuracy/latencia/memoria en arquitectura GPU y kernel concretos. Tensor parallel sólo con hardware compatible y comprobación de red/topología GPU. CPU demo usa motor alternativo y nunca se compara como equivalente a inferencia vLLM GPU.

## Benchmark Lab / Optimize S+

**Baseline reproducible:** modelo+revision y tokenizer, vLLM+container digest, GPU modelo/driver/CUDA, contexto, perfil, dtype/quantización, dataset y hashes, prompt/output distribution, batch/concurrencia, seed, warmup/cold cache, concurrencia exclusiva, duración y configuración de sampling. Usar misma carga para baseline y candidato, no ejecutar benchmark que sature a clientes productivos sin autorización.

**Métricas:** TTFT p50/p95/p99, TPOT/ITL p50/p95/p99, end-to-end latency, request/s, output tokens/s, goodput bajo SLO, queued time, active requests, failures/timeouts/abort, GPU utilization, VRAM peak, energía si está instrumentada, costo estimado por 1M tokens con hipótesis explícitas. Separar tiempo total y latencia token; reporting p95 con tamaño de muestra adecuado.

**Calidad:** evaluar truncamiento, exactitud/semántica en datasets aprobados y degradación por quantization; el mejor throughput puede reducir calidad. Reportar rango de contexto y latencia en las mismas condiciones, junto con intervalos/dispersion cuando aplique.

**Experimentos y promoción:** `RunBaselineService`, `RunCandidateService`, `ComparePerformanceService`, `PromoteCandidateService`, `RollbackProfileService` con estados de job y permisos. Aprobación de promoción define guardrails de error rate, goodput y caída de calidad; rollback predefinido.

## Esquemas de pruebas

- **Mock/fake PR:** upstream stub emite SSE fragmentada, `[DONE]`, malformed frame, timeout, cancel, 429/5xx y caída; asserts upstream abort + cuota release + ledger idempotente.
- **Integración runtime real GPU:** comprobar modelo compatible y hardware disponible, inferences de consistencia, multi-concurrency y OOM; categorías separadas del pipeline CPU PR.
- **Benchmark dedicado:** programa nightly/release, warmup/hardware ownership, dataset versionado y comparación con baseline aprobada. Si no hay GPU, estado `BLOCKED/NOT_RUN`, no PASS ficticio.
- **Security:** `max_tokens` límites, uso de modelo no autorizado, path injection, URLs/archivos externos maliciosos, denial of wallet y fuga de prompt/PII en logs.

## Criterios de aceptación S+

No se considerará nivel S+ por ejecutar `vllm serve` detrás de NestJS. Se exige al menos una política de scheduling/fairness o routing implementada con pruebas adversarias y **mejora medida reproducible** frente a baseline para escenarios declarados, sin empeorar métricas de seguridad, errores ni calidad por encima de umbrales aprobados.
