<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="docs/assets/logo-light.png">
    <img alt="INFERЯA S+" src="docs/assets/logo-dark.png" width="380">
  </picture>
</p>

<p align="center">
  <strong>Enterprise Self-Hosted LLM Inference Engine & LLMOps Control Plane</strong><br>
  <em>Sovereign High-Throughput Model Serving with Zero-Trust Quotas, vLLM CUDA Acceleration, and Real-Time Observability.</em>
</p>

<p align="center">
  <a href="https://github.com/VigilioYonatan/inferra-s-plus/releases"><img src="https://img.shields.io/badge/version-v0.1.0--beta-3b82f6?style=flat-square" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-10b981?style=flat-square" alt="License"></a>
  <img src="https://img.shields.io/badge/inference%20engine-vLLM%200.6.4%2Bcu124-7c3aed?style=flat-square" alt="vLLM Engine">
  <img src="https://img.shields.io/badge/control%20plane-NestJS%2011%20%7C%20Fastify-e11d48?style=flat-square" alt="NestJS">
  <img src="https://img.shields.io/badge/frontend-Preact%2011%20%7C%20Signals-6366f1?style=flat-square" alt="Preact">
  <img src="https://img.shields.io/badge/database-PostgreSQL%2016%20%7C%20Drizzle-0284c7?style=flat-square" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/cache-Valkey%208-f59e0b?style=flat-square" alt="Valkey">
  <img src="https://img.shields.io/badge/e2e%20gates-41%2F41%20passing%20(100%25)-10b981?style=flat-square" alt="E2E Tests">
</p>

---

## ⚡ Overview

**INFERЯA S+** is a sovereign, self-hosted LLM inference gateway and LLMOps control plane designed for engineering teams that require maximum GPU utilization, deterministic low-latency token streaming, and uncompromising data privacy.

Unlike multi-tenant cloud APIs with opaque rate limits and data retention policies, **INFERЯA S+** runs completely inside your VPC or bare-metal GPU clusters. It decouples high-speed tensor execution (**Data Plane** via vLLM and PagedAttention) from identity, tenancy, admission control, and accounting (**Control Plane** via NestJS, PostgreSQL, and Valkey).

```
                      ┌──────────────────────────────────────────────┐
                      │              CLIENT APPLICATIONS             │
                      │  OpenAI SDK · LangChain · LlamaIndex · cURL  │
                      └──────────────────────┬───────────────────────┘
                                             │ HTTP / SSE (/v1/*)
                                             ▼
                      ┌──────────────────────────────────────────────┐
                      │             CADDY REVERSE PROXY              │
                      │  TLS Termination · Host Pinning · Rate Limit │
                      └───────┬──────────────────────────────┬───────┘
                              │                              │
          Control Plane (3000)│                              │ Data Plane (8000)
                              ▼                              ▼
             ┌────────────────────────────────┐    ┌──────────────────┐
             │       INFERЯA CONTROLLER       │    │   vLLM ENGINE    │
             │  • Zero-Trust RBAC & Step-Up   │    │  • PagedAttention│
             │  • Atomic Token Quota Leases   │    │  • Continuous    │
             │  • Latency & TTFT Observability│    │    Batching      │
             │  • Webhook HMAC Dispatcher     │    │  • FlashInfer    │
             └───────────────┬────────────────┘    └─────────┬────────┘
                             │                               │
                ┌────────────┴───────────┐                   │
                ▼                        ▼                   ▼
     ┌──────────────────────┐ ┌────────────────────┐ ┌────────────────┐
     │  PostgreSQL 16 DB    │ │  Valkey 8 KV / Bus │ │ NVIDIA Tensor  │
     │  (Drizzle ORM)       │ │  (Atomic Leases)   │ │ Cores (GPU)    │
     └──────────────────────┘ └────────────────────┘ └────────────────┘
```

---

## 🎬 Live Walkthrough & Multi-Mode Preview

Experience **INFERЯA S+** in action: multi-model catalog, real-time SSE streaming, zero-trust quotas, and instant dark/light theme switching.

<p align="center">
  <img src="docs/assets/inferra-walkthrough.gif" alt="INFERЯA S+ Interactive Walkthrough" width="950">
</p>
<p align="center">
  <em>High-definition WebM recording available in <a href="docs/assets/videos/inferra-walkthrough.webm"><code>docs/assets/videos/inferra-walkthrough.webm</code></a>.</em>
</p>


---

## 🎯 Key Architectural Pillars

- **🚀 Ultra-Low Latency & High Throughput:** Native support for PagedAttention v2, FlashInfer, and chunked prefill via vLLM. Typical TTFT (Time-to-First-Token) < 15ms and sustained throughput exceeding 180 tokens/sec per GPU worker.
- **🛡️ Strict Multi-Tenancy & Zero-Trust Security:** Workspace isolation with independent quota buckets, cryptographic token hashing (`sha256`), privilege step-up confirmation for credential rotation, and ephemeral OAuth PKCE state machines.
- **🔄 OpenAI v1 Wire Compatibility:** 100% drop-in replacement for OpenAI SDKs (`chat.completions`, `models.list`, `embeddings`). Transition existing agents, LangChain chains, or Python pipelines simply by updating `base_url` and `api_key`.
- **📊 Real-Time Observability & SLO Guardrails:** Continuous tracking of P50, P95, and P99 TTFT and TPOT distributions. Built-in alerting triggers and operational audit trails for compliance.
- **⚡ Lightweight Responsive Console:** Zero-bloat modern UI built with Preact 11 and Signals. Sub-millisecond route transitions, native dark/light theme toggle, and keyboard-first command palette (`⌘K`).

---

## 📸 Platform Showcase

### 1. Operations Center & Cluster Overview
Real-time status of the active inference cluster, registered models, token consumption, in-flight concurrency, and latency SLO health.

<p align="center">
  <img src="docs/assets/screenshots/dashboard.png" alt="INFERЯA S+ Dashboard" width="950">
</p>

---

### 2. Model Catalog & Acceleration Runtimes
Register and manage leading open-weight LLMs (Llama 3.3 70B, DeepSeek-V3, Mistral 24B, Qwen 2.5 Coder) with custom context windows and vLLM acceleration profiles.

<p align="center">
  <img src="docs/assets/screenshots/models.png" alt="INFERЯA S+ Model Catalog" width="950">
</p>

---

### 3. Token Quotas, Atomic Leases & Concurrency Guard
Enforce deterministic token budgets and real-time concurrency limits per organization. Prevents GPU memory saturation via Valkey atomic token reservations.

<p align="center">
  <img src="docs/assets/screenshots/quotas.png" alt="INFERЯA S+ Quotas" width="950">
</p>

---

### 4. Zero-Trust API Key Lifecycle & Step-Up Security
Generate scoped access credentials (`inference:invoke`, `models:read`, `evaluations:run`) protected by administrative step-up authentication. Secrets are shown strictly once upon generation.

<p align="center">
  <img src="docs/assets/screenshots/api-keys.png" alt="INFERЯA S+ API Keys" width="950">
</p>

---

### 5. Latency Telemetry & SLO Spectrum
Percentile telemetry tracking interactive response times (P50, P95, P99) with automated compliance checks against critical SLO boundaries.

<p align="center">
  <img src="docs/assets/screenshots/latency-slo.png" alt="INFERЯA S+ Latency SLO" width="950">
</p>

---

### 6. Developer Portal & Multi-Language SDK Snippets
Instant copy-paste integration snippets for cURL, Python OpenAI SDK, and TypeScript.

<p align="center">
  <img src="docs/assets/screenshots/developer-portal.png" alt="INFERЯA S+ Developer Portal" width="950">
</p>

---

## 🛠️ Quickstart (Linux & Docker Compose)

### Prerequisites
- **OS:** Linux (Ubuntu 22.04 LTS or newer recommended)
- **Container Runtime:** Docker Engine 26+ with Docker Compose v2.24+
- **GPU (Optional for local emulation, recommended for production):** NVIDIA Pascal/Ampere/Hopper GPU with CUDA Drivers 550+ and NVIDIA Container Toolkit installed.
- **Node.js (for local development):** Node.js `>= 22.x` and `pnpm >= 9.x`

### 1. Clone the Repository
```bash
git clone https://github.com/VigilioYonatan/inferra-s-plus.git
cd inferra-s-plus
```

### 2. Configure Environment
```bash
cp inferra-project/prod-local/.env.example inferra-project/prod-local/.env
# Review and adjust database credentials, session secrets, and GPU flags
```

### 3. Start Core Infrastructure with Docker Compose
```bash
cd inferra-project/prod-local
docker compose up -d postgres valkey
```

### 4. Seed Database & Run Services
```bash
# Apply migrations and rich catalog seed
node super-seed-database.mjs

# Start Backend Control Plane
cd inferra-project/apps/inferra-impl
pnpm start:prod

# In a separate terminal, start Frontend Web Console
cd inferra-project/apps/inferra-web
pnpm preview --host 0.0.0.0 --port 5173
```

Open your browser at **`http://localhost:5173`** and log in:
- **Email:** `admin@inferra.internal`
- **Password:** `InferraMaster2026!Secure`

---

## 💻 Developer Integration (OpenAI SDK Drop-in)

### Python
```python
from openai import OpenAI

# Point client to your self-hosted Inferra gateway
client = OpenAI(
    base_url="http://localhost:3000/v1",
    api_key="inf_live_YOUR_INFERRA_TOKEN"
)

# Stream completions with microsecond TTFT
stream = client.chat.completions.create(
    model="meta-llama/Llama-3.3-70B-Instruct",
    messages=[
        {"role": "system", "content": "You are an expert systems engineer."},
        {"role": "user", "content": "Explain how PagedAttention eliminates memory fragmentation."}
    ],
    temperature=0.2,
    max_tokens=512,
    stream=True
)

for chunk in stream:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
```

### cURL
```bash
curl -X POST http://localhost:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer inf_live_YOUR_INFERRA_TOKEN" \
  -d '{
    "model": "meta-llama/Llama-3.3-70B-Instruct",
    "messages": [
      {"role": "user", "content": "Hello, Inferra!"}
    ],
    "temperature": 0.7,
    "stream": true
  }'
```

---

## 🏛️ Monorepo Structure

```
inferra-s-plus/
├── docs/
│   └── assets/                  # High-res logos, favicons, and 2x Retina screenshots
│       ├── logo-dark.png        # Transparent white logo for dark mode
│       ├── logo-light.png       # Transparent black logo for light mode
│       ├── favicon.svg          # Adaptive vector favicon squircle
│       └── screenshots/         # Showcase gallery screenshots
├── inferra-project/
│   ├── apps/
│   │   ├── inferra-impl/        # Backend Control Plane (NestJS 11 + Fastify + Drizzle ORM)
│   │   └── inferra-web/         # Frontend Web Console (Preact 11 + Signals + Tailwind)
│   ├── inferra-deploy/          # Production deployment recipes, systemd units, Caddy configs
│   ├── platform-ops/            # Observability configs (Prometheus, Grafana, Alloy, DCGM)
│   ├── prod-local/              # Docker Compose definitions (PostgreSQL 16, Valkey 8, vLLM)
│   ├── test-master-e2e-vigilio.mjs  # Master 8-gate E2E compliance suite (41/41 passing)
│   └── super-seed-database.mjs  # Enterprise catalog seeder
├── scripts/                     # Operational automation and upgrade utilities
└── README.md                    # Project documentation and specifications
```

---

## 🧪 Rigorous Quality & Verification

Every release of Inferra S+ must satisfy the **Vigilio Master E2E Verification Protocol**, spanning 8 end-to-end gates:

| Gate | Scope | Status | Result |
|---|---|:---:|---|
| **Gate 1** | Identity & Session Family Lifecycle | ✅ PASS | Password, TOTP MFA, session revocation, token rotation |
| **Gate 2** | Organization & Tenancy Isolation | ✅ PASS | Cross-org read/write boundary enforcement |
| **Gate 3** | Zero-Trust API Key Admission | ✅ PASS | Scopes enforcement, hashing, privilege step-up |
| **Gate 4** | Model Registration & Deployment Profile | ✅ PASS | Upstream validation, context window bounds |
| **Gate 5** | Token Quota & Valkey Leases | ✅ PASS | Atomic pre-reservation, in-flight release, monthly cap |
| **Gate 6** | OpenAI v1 SSE Streaming Engine | ✅ PASS | Protocol wire compatibility, chunk decoding |
| **Gate 7** | Latency Telemetry & SLO Aggregation | ✅ PASS | P50, P95, P99 calculation across sliding windows |
| **Gate 8** | Webhook HMAC Signatures & Outbox | ✅ PASS | SHA-256 HMAC digest, timestamp validation |

To execute the test suite against a running instance:
```bash
node inferra-project/test-master-e2e-vigilio.mjs
```

---

## 📄 License & Attribution

Distributed under the **Apache License 2.0**. See [`LICENSE`](LICENSE) for terms.

Engineered with precision by **[Yonatan Vigilio](https://github.com/VigilioYonatan)**.
