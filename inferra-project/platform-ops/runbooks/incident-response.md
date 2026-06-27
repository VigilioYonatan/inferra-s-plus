# Incident response
1. Confirm scope without copying prompts, tokens, sessions or secrets to tickets.
2. Preserve access logs and audit rows securely; revoke leaked API keys and user sessions.
3. Restrict Caddy exposure and isolate affected host; never share DB credentials.
4. Restore from signed image digests and offsite backups only after integrity checks.
5. Run incident postmortem and create tests for discovered failure mode.
