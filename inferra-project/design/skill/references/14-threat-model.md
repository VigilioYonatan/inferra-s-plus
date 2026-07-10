# 14 — Threat model STRIDE / abuse cases de Inferra

## Activos y límites de confianza

**Activos:** secretos OAuth/SMTP, sesiones, OTP/MFA recovery, API keys, roles/ACL, prompts/outputs, GPU/host, modelo/pesos y datasets, registros de uso, artefactos RustFS, backups y claves de cifrado. **Límites:** navegador ↔ Caddy, API pública ↔ API interna, auth sesión ↔ credencial máquina, tenant A ↔ tenant B, control plane NestJS ↔ provisioner con privilegios ↔ vLLM GPU, worker ↔ red/Internet, DB/caché ↔ objetos/backup y observabilidad ↔ privacidad.

## Amenazas y mitigaciones verificables

| ID | Amenaza | Mitigación obligatoria | Test/evidencia |
|---|---|---|---|
| T-01 | Robo/replay de OTP/callback | TTL corto, hash y consumo SQL atómico, state+nonce+PKCE, rate limit | concurrent OTP/replay tests, callback spoof |
| T-02 | Account takeover/social link | identidad por provider subject, step-up linking, verify email por policy | provider different same email; unlink last-method |
| T-03 | Cookie/JWT confusion y CSRF | Secure/HttpOnly/SameSite, CSRF, audience/type guard separados | cross-origin mutation, refresh-as-access |
| T-04 | BOLA/IDOR cross-org | policy en service, tenant-scoped SQL, 403/404 no metadata | A reads/modifies B, cache stale |
| T-05 | Privilege escalation | instance vs org roles; last-owner policy; step-up | unauthorized role change, self-promotion |
| T-06 | Denial of wallet/GPU saturation | quota atomic, max context/output, admission fairness, timeouts | concurrent quota overspend, overload |
| T-07 | Secret leakage logs/metrics/traces | redaction by default; low cardinality | search logs for canary tokens, label rules |
| T-08 | SSRF model imports/webhooks | strict host allowlist, DNS/IP egress validation, no RFC1918/metadata targets | DNS rebinding, redirect to internal URL |
| T-09 | Unsafe model weights/code | signed/revision/hash/allowlist, sandbox/quarantine; no remote code by default | malicious manifest, untrusted import |
| T-10 | Host takeover through deployment | no docker socket in API, provisioner recipe allowlist, minimal privilege | arbitrary command attempt returns denied |
| T-11 | RustFS malicious upload | quarantine, MIME magic/checksum, AV scan, auth scoped signed URLs | infected file never downloadable |
| T-12 | SSE injection/cancellation leak | strict decoder, bounded frame/size, no XSS, abort upstream | malformed frame, no `[DONE]`, disconnect |
| T-13 | Outbox/retry double effects | transactions, idempotency, inbox, DLQ | retry job after crash/commit, duplicate event |
| T-14 | Supply chain tamper | locked dependencies, OCI digests, SBOM, signed provenance | invalid digest/signature negative fixture |
| T-15 | Backup exfiltration/loss | offhost encrypted backups and least privilege, restore drill | access denied, remote restore actual |
| T-16 | Cross-org resource starvation | admission fairness caps and no unknown fallback | many noisy requests org A vs org B |
| T-17 | Prompt injection as instruction in UI | untrusted user/model text encoded/sanitized, no tools/actions implicit | markdown XSS, generated link restrictions |
| T-18 | OAuth unavailable/offline | local auth/OTP path, provider disabled visibly | fallback when Google/Facebook unreachable |

## Model weight & inference specifics

- Los pesos y formatos como pickle/remote-code pueden contener código. No usar `trust_remote_code=true` sin excepción explícita auditada; bloquear descargas arbitrarias y licencias incompatibles.
- Los prompts, outputs, embeddings y traces pueden contener secretos. Prohibido copiarlos a analytics/benchmark por defecto; el componente web debe escapar cualquier texto/model Markdown y nunca inyectar HTML sin sanitización explícita.
- Input con URLs de archivos no autoriza a inferra a leer cualquier URL o archivo host. Requests públicas no permiten `base_url` upstream, filesystem paths, Docker flags ni selección de secrets.
- Cuotas/goodput no son control de aislamiento GPU suficiente; evaluar GPU multiplex/tenant hard isolation según hardware y carga si se promete entorno no confiable.

## Protocolo de revisión del threat model

1. Mapear assets, data flow diagrams, entradas públicas, roles y decisiones destruc­ tivas.
2. Identificar actor (anónimo, org actor, admin comprometido, modelo de terceros, insider, build pipeline) y abuso.
3. Asignar control con owner y suite adversaria real; distinguir prevención, detección y recovery.
4. Evitar severidades sin amenaza concreta y excepciones permanentes sin owner/expiración.
5. Revisar en cada cambio de identidad, API pública, GPU/provisioner, objetos, webhooks, modelo, backup, permisos y supply chain.

La tabla es un modelo de amenazas propuesto. Su existencia no demuestra que controles estén implementados, probados o aprobados por seguridad.
