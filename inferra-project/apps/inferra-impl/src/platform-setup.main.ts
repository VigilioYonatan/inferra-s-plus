import "reflect-metadata";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import argon2 from "argon2";
import { Pool } from "pg";
import { env } from "./config/env.schema";

async function main() {
  const emailFile = process.env.BOOTSTRAP_EMAIL_FILE;
  const passwordFile = process.env.BOOTSTRAP_PASSWORD_FILE;
  if (!emailFile || !passwordFile)
    throw new Error(
      "Provide BOOTSTRAP_EMAIL_FILE and BOOTSTRAP_PASSWORD_FILE from protected read-only secret files",
    );
  const email = readFileSync(emailFile, "utf8").trim().toLowerCase();
  const password = readFileSync(passwordFile, "utf8").trim();
  if (
    !/^\S+@\S+\.\S+$/.test(email) ||
    password.length < 16 ||
    password.length > 128
  )
    throw new Error("Invalid bootstrap email or password length (16–128)");
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(11012399)");
    const count = await client.query(
      "SELECT count(*)::integer AS n FROM users",
    );
    if (Number(count.rows[0]?.n) !== 0)
      throw new Error("Bootstrap is permitted only on empty user databases");
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
    });
    const user_id = randomUUID();
    const org_id = randomUUID();
    await client.query(
      "INSERT INTO users(id,email,password_hash,display_name,email_verified) VALUES($1,$2,$3,$4,true)",
      [user_id, email, hash, "Instance Owner"],
    );
    await client.query(
      "INSERT INTO organizations(id,slug,name) VALUES($1,$2,$3)",
      [org_id, "default", "Default Workspace"],
    );
    await client.query(
      "INSERT INTO memberships(user_id,organization_id,role) VALUES($1,$2,$3)",
      [user_id, org_id, "owner"],
    );
    await client.query("INSERT INTO quotas(organization_id) VALUES($1)", [
      org_id,
    ]);
    await client.query(
      "INSERT INTO instance_administrators(user_id,role) VALUES($1,$2)",
      [user_id, "owner"],
    );
    await client.query(
      "INSERT INTO audit_events(organization_id,actor_id,action,resource_type,resource_id) VALUES($1,$2,$3,$4,$5)",
      [org_id, user_id, "platform.bootstrap", "instance", org_id],
    );
    await client.query("COMMIT");
    console.log("Bootstrap successful. Remove bootstrap secret files.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}
main().catch((err) => {
  console.error(err instanceof Error ? err.message : "Bootstrap failed");
  process.exitCode = 1;
});
