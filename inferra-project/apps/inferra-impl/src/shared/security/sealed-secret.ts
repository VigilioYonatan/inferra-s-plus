import {
  createCipheriv,
  createDecipheriv,
  hkdfSync,
  randomBytes,
} from "node:crypto";
import { env } from "../../config/env.schema";

const key = Buffer.from(
  hkdfSync(
    "sha256",
    env.AUTH_PEPPER,
    Buffer.from("inferra-secrets"),
    Buffer.from("webhook-signing-v1"),
    32,
  ),
);
export function sealSecret(raw: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(raw, "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64url",
  );
}
export function unsealSecret(sealed: string) {
  const bytes = Buffer.from(sealed, "base64url");
  if (bytes.length < 29) throw new Error("Invalid sealed secret");
  const decipher = createDecipheriv("aes-256-gcm", key, bytes.subarray(0, 12));
  decipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([
    decipher.update(bytes.subarray(28)),
    decipher.final(),
  ]).toString("utf8");
}
