import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "../../config/env.schema";
export function secureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
export function digest(value: string, purpose: string): string {
  return createHmac("sha256", env.AUTH_PEPPER)
    .update(`${purpose}:${value}`)
    .digest("hex");
}
export function equalDigest(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, "utf8"), Buffer.from(b, "utf8"));
}
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("base64url");
}
