import {
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { env } from "../../../../config/env.schema";
export function validateWebhookUrl(raw: string) {
  const allowed = env.WEBHOOK_ALLOWED_HOSTS.split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!allowed.length)
    throw new ServiceUnavailableException(
      "Webhook destination allowlist not configured",
    );
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new BadRequestException("Invalid webhook URL");
  }
  if (
    url.protocol !== "https:" ||
    (url.port && url.port !== "443") ||
    url.username ||
    url.password ||
    url.hash ||
    !allowed.includes(url.hostname.toLowerCase())
  )
    throw new BadRequestException(
      "Webhook destination must be an approved HTTPS host",
    );
  return url.toString();
}
// IPv4-only pinned socket: public space only. Additional network firewall egress restrictions are required in production.
export function isPublicIPv4(address: string) {
  const octets = address.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255)
  )
    return false;
  const a = octets[0] ?? -1;
  const b = octets[1] ?? -1;
  return !(
    a === 0 ||
    a === 10 ||
    a === 127 ||
    a >= 224 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && (b === 168 || b === 0 || b === 88)) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19 || b === 51)) ||
    (a === 203 && b === 0)
  );
}
