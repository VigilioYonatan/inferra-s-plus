# SLO alert: inference errors >10%
1. Confirm user-facing 5xx and timeframe in Prometheus/Grafana.
2. Check health of API, Valkey, Postgres, vLLM (only from private network).
3. Inspect GPU OOM, tokenizer mismatch, upstream timeout and quota rejects; never log user prompts or API keys.
4. If new runtime profile caused regression, redeploy last known-good verified digest.
5. Record incident and run controlled test after mitigation.
