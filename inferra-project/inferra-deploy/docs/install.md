# Self-hosted installation
1. Linux with Docker Engine + Compose plugin and a public DNS name for HTTPS, or a private `http://localhost` development profile.
2. `cp inferra-deploy/.env.example inferra-deploy/.env; chmod 600 inferra-deploy/.env`.
3. Replace placeholders. Generate `openssl rand -hex 48` for AUTH_PEPPER; separate passwords for database, Grafana, RustFS and vLLM.
4. `inferra-deploy/scripts/prepare-bootstrap.sh` to save one-time initial account secrets.
5. `inferra-deploy/scripts/install.sh` to build, migrate, bootstrap and start.
6. To enable GPU, install NVIDIA drivers/toolkit, run `nvidia-smi` and `docker compose --profile gpu up -d vllm`. Accept the model license before retrieval.
7. Configure SMTP for OTP/recovery, and OAuth client secrets for Google/Facebook and correct callback URL `https://DOMAIN/api/v1/auth/oauth/{provider}/callback`.
8. Before public use: set `NODE_ENV=production`, `COOKIE_SECURE=true`, HTTPS domain, image digests, Cosign key, alert delivery, external backups and perform restore drill.

## Limitations
This source tree has not undergone successful Docker smoke, full CI, or pentest on target hardware. The default `APP_DOMAIN=http://localhost` is local-only. Version-specific image availability requires confirmation before deployment.
