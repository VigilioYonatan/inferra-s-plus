# Operating monitoring
Run `docker compose --profile observability up -d` to enable Prometheus, Grafana, Loki, Tempo and Collector; run `--profile gpu-observability` only after validating NVIDIA exporter image and GPU driver. Backends remain private.
The API exports `/internal/metrics` and OTLP traces when `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` is configured; Caddy never exposes internal paths. Grafana datasources and example dashboard are provisioned.
**Known gaps:** Docker logs are not yet forwarded to Loki; no validated Alertmanager delivery channel; no SLO burn-rate multiwindow alert, no proof of DCGM image/runtime compatibility and no retention/privacy audit. Production remains blocked until validated and secured. 
