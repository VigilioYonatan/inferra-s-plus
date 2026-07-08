# Test gates and coverage policy
- Unit: crypto, TOTP, schemas, SSE framing, routing, policy decisions. Target >=85% line & statement, >=80% branch/function once executable; *do not claim attained*.
- Integration: isolated PostgreSQL migrations, quota reservations and concurrent OTP; Valkey rate limit, jobs; SMTP test service for OTP. Do not skip critical tests in release CI.
- BDD: passwordless anti-enumeration, one-time use, tenant isolation, step-up, quota fairness; currently two executable basic scenarios.
- API E2E: health, anonymous access denial, malformed requests; add login, OAuth state/nonce, user session, tenants, API keys, quota, cancellation, benchmark lifecycle.
- Frontend: Vitest state and SSE decoder; Playwright login/OTP accessibility & navigation; add all page journeys, mobile and WCAG2.2 AA.
- Performance: sustained baseline vs tuned vLLM configurations, identify cold-cache/warm-cache, prompt/output distributions and realistic concurrency; no performance claims without measured evidence.
- Security: secret scans, SBOM, image/signature scans, origin enforcement, rate limits, IDOR, SSRF on model paths, abuse & resource exhaustion, OAuth mixups, session rotation and MFA bypass.

## Nuevos escenarios v2 (definidos; NOT_RUN)
- Inference DTOs: chat, completion, embeddings, inputs enormes y opciones no admitidas.
- Webhook SSRF: HTTPS, hostname allowlist, rango IP no público, cifrado autenticado AES-GCM, nonce.
- Benchmark SSE: primer token, uso, frames cortados, ausencia de marcador final.
- Sesiones: rotación y uso reiterado, step-up password/TOTP, autorización de API keys.
- Integración: creación de tablas de nuevos módulos en PostgreSQL test separado.
- API E2E: serving 401 y bloqueo de superficies administrativas de tenants anónimos.
- BDD: API key obligatoria.

Faltan 2-tenant authenticated E2E, GPU real load, DR, accesibilidad y CI verde. No hay coverage medido.
