import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const created_at = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    password_hash: text("password_hash"),
    email_verified: boolean("email_verified").notNull().default(false),
    display_name: text("display_name"),
    totp_secret: text("totp_secret"),
    totp_pending: text("totp_pending"),
    totp_enabled: boolean("totp_enabled").notNull().default(false),
    created_at: created_at(),
    disabled_at: timestamp("disabled_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("users_email_unique").on(t.email)],
);
export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    token_hash: text("token_hash").notNull(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    mfa_verified: boolean("mfa_verified").notNull().default(true),
    family_id: uuid("family_id").notNull().defaultRandom(),
    rotated_at: timestamp("rotated_at", { withTimezone: true }),
    last_step_up_at: timestamp("last_step_up_at", { withTimezone: true }),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    created_at: created_at(),
  },
  (t) => [
    uniqueIndex("sessions_token_hash_unique").on(t.token_hash),
    index("sessions_user_idx").on(t.user_id),
  ],
);
export const oauthIdentities = pgTable(
  "oauth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    provider: text("provider").notNull(),
    provider_subject: text("provider_subject").notNull(),
    created_at: created_at(),
  },
  (t) => [
    uniqueIndex("oauth_identity_unique").on(t.provider, t.provider_subject),
  ],
);
export const oauthStates = pgTable("oauth_states", {
  state_hash: text("state_hash").primaryKey(),
  provider: text("provider").notNull(),
  verifier: text("verifier").notNull(),
  user_id: uuid("user_id").references(() => users.id),
  nonce: text("nonce").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  created_at: created_at(),
});
export const otpChallenges = pgTable("otp_challenges", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  purpose: text("purpose").notNull(),
  code_hash: text("code_hash").notNull(),
  attempts: integer("attempts").notNull().default(0),
  expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
  consumed_at: timestamp("consumed_at", { withTimezone: true }),
  created_at: created_at(),
});
export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    created_at: created_at(),
  },
  (t) => [uniqueIndex("organizations_slug_unique").on(t.slug)],
);
export const memberships = pgTable(
  "memberships",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id")
      .notNull()
      .references(() => users.id),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    role: text("role").notNull().default("viewer"),
    created_at: created_at(),
  },
  (t) => [uniqueIndex("membership_unique").on(t.user_id, t.organization_id)],
);
export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    token_prefix: text("token_prefix").notNull(),
    token_hash: text("token_hash").notNull(),
    scopes: jsonb("scopes")
      .$type<string[]>()
      .notNull()
      .default(["inference:invoke"]),
    created_by: uuid("created_by")
      .notNull()
      .references(() => users.id),
    created_at: created_at(),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("api_keys_prefix_unique").on(t.token_prefix)],
);
export const models = pgTable(
  "models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    public_name: text("public_name").notNull(),
    upstream_name: text("upstream_name").notNull(),
    context_window: integer("context_window").notNull().default(8192),
    enabled: boolean("enabled").notNull().default(true),
    created_at: created_at(),
  },
  (t) => [
    uniqueIndex("model_name_per_org_unique").on(
      t.organization_id,
      t.public_name,
    ),
  ],
);
export const deployments = pgTable("deployments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  model_id: uuid("model_id")
    .notNull()
    .references(() => models.id),
  status: text("status").notNull().default("configured"),
  runtime_profile: text("runtime_profile").notNull(),
  created_at: created_at(),
});
export const quotas = pgTable("quotas", {
  organization_id: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id),
  monthly_limit: bigint("monthly_limit", { mode: "number" })
    .notNull()
    .default(1000000),
  concurrent_limit: integer("concurrent_limit").notNull().default(3),
});
export const quotaBuckets = pgTable(
  "quota_buckets",
  {
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    period: text("period").notNull(),
    used_tokens: bigint("used_tokens", { mode: "number" }).notNull().default(0),
    reserved_tokens: bigint("reserved_tokens", { mode: "number" })
      .notNull()
      .default(0),
    in_flight: integer("in_flight").notNull().default(0),
  },
  (t) => [uniqueIndex("quota_bucket_unique").on(t.organization_id, t.period)],
);
export const quotaLeases = pgTable(
  "quota_leases",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    period: text("period").notNull(),
    reserved_tokens: bigint("reserved_tokens", { mode: "number" }).notNull(),
    model_id: uuid("model_id").references(() => models.id),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    created_at: created_at(),
  },
  (t) => [index("quota_leases_expires").on(t.expires_at)],
);
export const inferenceRequests = pgTable(
  "inference_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    model_id: uuid("model_id")
      .notNull()
      .references(() => models.id),
    status: text("status").notNull(),
    prompt_tokens: integer("prompt_tokens").notNull().default(0),
    completion_tokens: integer("completion_tokens").notNull().default(0),
    elapsed_ms: integer("elapsed_ms").notNull(),
    created_at: created_at(),
  },
  (t) => [
    index("inference_requests_org_created").on(t.organization_id, t.created_at),
  ],
);
export const benchmarks = pgTable("benchmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  model_id: uuid("model_id")
    .notNull()
    .references(() => models.id),
  status: text("status").notNull().default("queued"),
  configuration: jsonb("configuration")
    .$type<Record<string, unknown>>()
    .notNull(),
  results: jsonb("results").$type<Record<string, unknown>>(),
  created_at: created_at(),
});
export const auditEvents = pgTable("audit_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id").references(() => organizations.id),
  actor_id: uuid("actor_id").references(() => users.id),
  action: text("action").notNull(),
  resource_type: text("resource_type").notNull(),
  resource_id: text("resource_id"),
  metadata: jsonb("metadata")
    .$type<Record<string, unknown>>()
    .notNull()
    .default({}),
  created_at: created_at(),
});

export const recoveryCodes = pgTable("recovery_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  code_hash: text("code_hash").notNull(),
  used_at: timestamp("used_at", { withTimezone: true }),
  created_at: created_at(),
});

export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    uploaded_by: uuid("uploaded_by")
      .notNull()
      .references(() => users.id),
    original_name: text("original_name").notNull(),
    object_key: text("object_key").notNull(),
    content_type: text("content_type").notNull(),
    file_size: bigint("file_size", { mode: "number" }).notNull(),
    sha256: text("sha256").notNull(),
    created_at: created_at(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("artifacts_key_unique").on(t.object_key),
    index("artifacts_org_created_idx").on(t.organization_id, t.created_at),
  ],
);

// Explicit tables for bounded contexts. Every tenant-owned query must constrain organization_id.
export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    email: text("email").notNull(),
    role: text("role").notNull(),
    token_hash: text("token_hash").notNull(),
    invited_by: uuid("invited_by")
      .notNull()
      .references(() => users.id),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    accepted_at: timestamp("accepted_at", { withTimezone: true }),
    revoked_at: timestamp("revoked_at", { withTimezone: true }),
    created_at: created_at(),
  },
  (t) => [
    uniqueIndex("invitation_token_hash_unique").on(t.token_hash),
    index("invitations_org_idx").on(t.organization_id),
  ],
);
export const datasets = pgTable(
  "datasets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    artifact_id: uuid("artifact_id").references(() => artifacts.id),
    created_by: uuid("created_by")
      .notNull()
      .references(() => users.id),
    created_at: created_at(),
    deleted_at: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("dataset_name_unique").on(t.organization_id, t.name)],
);
export const experiments = pgTable("experiments", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  baseline_benchmark_id: uuid("baseline_benchmark_id")
    .notNull()
    .references(() => benchmarks.id),
  candidate_benchmark_id: uuid("candidate_benchmark_id")
    .notNull()
    .references(() => benchmarks.id),
  status: text("status").notNull().default("configured"),
  comparison: jsonb("comparison").$type<Record<string, unknown>>(),
  created_by: uuid("created_by")
    .notNull()
    .references(() => users.id),
  created_at: created_at(),
});
export const routingPolicies = pgTable(
  "routing_policies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    name: text("name").notNull(),
    model_id: uuid("model_id")
      .notNull()
      .references(() => models.id),
    enabled: boolean("enabled").notNull().default(true),
    concurrency_cap: integer("concurrency_cap").notNull().default(1),
    created_at: created_at(),
  },
  (t) => [
    uniqueIndex("routing_model_org_unique").on(t.organization_id, t.model_id),
  ],
);
export const notificationPreferences = pgTable("notification_preferences", {
  organization_id: uuid("organization_id")
    .primaryKey()
    .references(() => organizations.id),
  email_enabled: boolean("email_enabled").notNull().default(true),
  updated_at: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const alertIncidents = pgTable(
  "alert_incidents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    title: text("title").notNull(),
    severity: text("severity").notNull(),
    source: text("source").notNull(),
    occurred_at: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    acknowledged_by: uuid("acknowledged_by").references(() => users.id),
    acknowledged_at: timestamp("acknowledged_at", { withTimezone: true }),
  },
  (t) => [index("alerts_org_idx").on(t.organization_id, t.occurred_at)],
);
export const modelVersions = pgTable(
  "model_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    model_id: uuid("model_id")
      .notNull()
      .references(() => models.id),
    tag: text("tag").notNull(),
    upstream_name: text("upstream_name").notNull(),
    sha256: text("sha256"),
    created_at: created_at(),
  },
  (t) => [uniqueIndex("model_version_unique").on(t.model_id, t.tag)],
);
export const backupRuns = pgTable("backup_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status").notNull(),
  method: text("method").notNull(),
  size_bytes: bigint("size_bytes", { mode: "number" }),
  started_at: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  detail: text("detail"),
});

export const instanceAdministrators = pgTable("instance_administrators", {
  user_id: uuid("user_id")
    .primaryKey()
    .references(() => users.id),
  role: text("role").notNull(),
  created_at: created_at(),
});

export const playgroundSessions = pgTable(
  "playground_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    owner_id: uuid("owner_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    messages: jsonb("messages")
      .$type<{ role: "user" | "assistant"; content: string }[]>()
      .notNull()
      .default([]),
    created_at: created_at(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("playground_org_owner").on(t.organization_id, t.owner_id)],
);
export const modelImportRequests = pgTable("model_import_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  requested_by: uuid("requested_by")
    .notNull()
    .references(() => users.id),
  repository_id: text("repository_id").notNull(),
  status: text("status").notNull().default("operator_review"),
  created_at: created_at(),
  cancelled_at: timestamp("cancelled_at", { withTimezone: true }),
});

export const webhookSubscriptions = pgTable("webhook_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  organization_id: uuid("organization_id")
    .notNull()
    .references(() => organizations.id),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret_encrypted: text("secret_encrypted").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  revoked_at: timestamp("revoked_at", { withTimezone: true }),
  created_at: created_at(),
});
export const webhookOutbox = pgTable(
  "webhook_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    organization_id: uuid("organization_id")
      .notNull()
      .references(() => organizations.id),
    subscription_id: uuid("subscription_id")
      .notNull()
      .references(() => webhookSubscriptions.id),
    event_type: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    attempts: integer("attempts").notNull().default(0),
    next_attempt_at: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    delivered_at: timestamp("delivered_at", { withTimezone: true }),
    dead_at: timestamp("dead_at", { withTimezone: true }),
    last_error: text("last_error"),
    created_at: created_at(),
  },
  (t) => [index("webhook_due_idx").on(t.next_attempt_at)],
);
