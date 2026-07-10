import { Pool } from "pg";
import { describe, expect, it } from "vitest";

// Never run these tests against a production database: TEST_DATABASE_URL must point to an isolated database.
const url = process.env.TEST_DATABASE_URL;
const suite =
  url && new URL(url).pathname.endsWith("_test") ? describe : describe.skip;
suite("real PostgreSQL migrations", () => {
  it("contains identity and quota tables", async () => {
    const pool = new Pool({ connectionString: url });
    try {
      const r = await pool.query(
        "SELECT to_regclass('public.users') AS users,to_regclass('public.quota_buckets') AS quotas",
      );
      expect(r.rows[0].users).toBe("users");
      expect(r.rows[0].quotas).toBe("quota_buckets");
    } finally {
      await pool.end();
    }
  });
});
