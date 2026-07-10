import { Pool } from "pg";
import { describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;
const suite =
  url && new URL(url).pathname.endsWith("_test") ? describe : describe.skip;
suite("Control plane migrations on isolated PostgreSQL", () => {
  it("creates the required tables and foreign keys", async () => {
    const pool = new Pool({ connectionString: url });
    try {
      const names = [
        "datasets",
        "experiments",
        "routing_policies",
        "invitations",
        "instance_administrators",
        "playground_sessions",
        "model_import_requests",
        "webhook_subscriptions",
        "webhook_outbox",
      ];
      const rows = await pool.query(
        "SELECT tablename FROM pg_tables WHERE schemaname=$1 AND tablename=ANY($2)",
        ["public", names],
      );
      expect(rows.rows.map((row) => row.tablename).sort()).toEqual(
        names.slice().sort(),
      );
    } finally {
      await pool.end();
    }
  });
});
