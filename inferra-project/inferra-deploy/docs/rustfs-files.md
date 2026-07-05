# RustFS object files (self-hosted)

Start with `docker compose --profile storage up -d rustfs` along with the main services. Only server-side NestJS uses `RUSTFS_ENDPOINT` and credentials; client browsers cannot reach RustFS directly. The `artifacts` API supports authenticated organizational upload, read, and metadata soft-deletion. Allowed MIME types are explicitly restricted and basic magic bytes are checked; maximum payload 20 MB, in-memory. The initial deployment does **not** include antivirus scanning, retained-object deletion worker, full content disarm, presigned access, multipart upload or data-loss recovery for the object store. **Do not accept untrusted/public file uploads in production until malware scanning, scanning worker and retention policy are added.** Never enable public buckets.

RustFS is a third-party self-hosted S3-compatible object server, not AWS. Back up RustFS objects independently. Do not expose port 9000 on the host or public reverse proxy.
