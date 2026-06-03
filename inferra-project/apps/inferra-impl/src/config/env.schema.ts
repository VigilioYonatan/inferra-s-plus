import { z } from "zod";
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(12),
  APP_ORIGIN: z.string().url(),
  API_ORIGIN: z.string().url(),
  AUTH_PEPPER: z.string().min(32),
  COOKIE_SECURE: z.enum(["true", "false"]).default("true"),
  REGISTRATION_ENABLED: z.enum(["true", "false"]).default("false"),
  SMTP_URL: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_CLIENT_ID: z.string().optional(),
  FACEBOOK_CLIENT_SECRET: z.string().optional(),
  VLLM_URL: z.string().url().default("http://vllm:8000"),
  VLLM_API_KEY: z.string().optional(),
  VALKEY_URL: z.string().default("redis://valkey:6379"),
  RUSTFS_ENDPOINT: z.string().url().optional(),
  RUSTFS_ACCESS_KEY: z.string().optional(),
  RUSTFS_SECRET_KEY: z.string().optional(),
  RUSTFS_BUCKET: z
    .string()
    .regex(/^[a-z0-9][a-z0-9.-]{2,62}$/)
    .default("inferra-artifacts"),
  GPU_HOURLY_RATE_USD: z.coerce.number().min(0).max(10000).optional(),
  DCGM_METRICS_URL: z
    .string()
    .url()
    .default("http://dcgm-exporter:9400/metrics"),
  WEBHOOK_ALLOWED_HOSTS: z.string().default(""),
  METRICS_ENABLED: z.enum(["true", "false"]).default("true"),
});
export type EnvSchema = z.infer<typeof envSchema>;
export function loadEnv(input: NodeJS.ProcessEnv = process.env): EnvSchema {
  const result = envSchema.safeParse(input);
  if (!result.success)
    throw new Error(
      `Invalid configuration: ${result.error.issues.map((i) => i.path.join(".")).join(", ")}`,
    );
  return result.data;
}
export const env = loadEnv();
