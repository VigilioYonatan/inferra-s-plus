import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Pool } from "pg";
import { env } from "../config/env.schema";

async function main() {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("SELECT pg_advisory_lock(430090001)");
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const dir = resolve(__dirname, "migrations");
    for (const name of readdirSync(dir)
      .filter((n) => n.endsWith(".sql"))
      .sort()) {
      const existing = await client.query(
        "SELECT name FROM schema_migrations WHERE name=$1",
        [name],
      );
      if (existing.rowCount) continue;
      await client.query("BEGIN");
      try {
        await client.query(readFileSync(resolve(dir, name), "utf8"));
        await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
          name,
        ]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }
  } finally {
    await client.query("SELECT pg_advisory_unlock(430090001)");
    client.release();
    await pool.end();
  }
}
main().catch((err) => {
  console.error("Migration failed", err);
  process.exitCode = 1;
});
