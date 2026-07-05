# Production release gates (self-hosted Docker Compose only)

1. **Dependencies:** generate/review and commit `pnpm-lock.yaml` for BOTH apps; install with `--frozen-lockfile`. Build OCI images using a trusted offline/on-prem runner. Do not deploy builds from developer machines.
2. **Software supply chain:** scan sources with gitleaks, dependencies with `pnpm audit`, images with Trivy, produce SPDX SBOM via Syft, sign built immutable image digests with Cosign. Pin images by digest in production. Run `scripts/verify-images.sh` before pulling/deploying. Sign or pin infrastructure images too.
3. **Quality:** Biome, TypeScript, Vitest measured coverage, real PostgreSQL integration, API/UI Playwright, Cucumber, vulnerability scanning, OpenAPI diff, and production smoke. No CI job can be skipped silently.
4. **Identity:** TLS HTTPS, secure cookies, SMTP for OTP, OAuth provider registration with verified callbacks, backup MFA codes, step-up for sensitive actions, protected bootstrap secret files.
5. **Network:** only Caddy 80/443 public; backend, database, Valkey, vLLM, DCGM, Alloy and RustFS stay on private Docker networks. Runtime never receives `/var/run/docker.sock`. Webhooks require allowlisted publicly routable destinations.
6. **Observability:** private Grafana, Prometheus, Loki, Tempo, OTel, Alloy. Deploy and TEST real Alertmanager receiver before production (the example receiver is inert). Run `promtool test rules`.
7. **Database recovery:** pg_dump+restic backup script exists for base recovery. **WAL-based PITR with pgBackRest is NOT implemented**; implement, configure archive-push/check/stanza and prove isolated restore before production certification. External site, retention, encryption, monitoring, and 3-2-1 policy are mandatory.
8. **Runtime:** validate NVIDIA driver/toolkit, model license/revision, GPU VRAM, quantization and single/multi GPU configuration on actual hardware. Test shutdown, quotas and SSE abort under load.
9. **Release:** approvals, backup drill, schema compatibility, immutable digests, migrations run once, smoke + authenticated flows, SLO observation and rollback plan. Never claim rollback DDL is automatic.

**Known blockers in this source archive**: no tested production release, dependencies/locks not resolved in generation environment, social OAuth and GPU hardware not end-to-end validated. Do not use live customer data before closing these gates.
