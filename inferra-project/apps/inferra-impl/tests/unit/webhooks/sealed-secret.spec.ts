import { describe, expect, it } from "vitest";
import {
  sealSecret,
  unsealSecret,
} from "../../../src/shared/security/sealed-secret";

describe("encrypted webhook secrets", () => {
  it("round trips without storing plaintext", () => {
    const original = "super_secret_value_123456789";
    const sealed = sealSecret(original);
    expect(sealed).not.toContain(original);
    expect(unsealSecret(sealed)).toBe(original);
  });
  it("rejects ciphertext tampering", () => {
    const token = sealSecret("real-key");
    const bytes = Buffer.from(token, "base64url");
    bytes[bytes.length - 1] ^= 1;
    expect(() => unsealSecret(bytes.toString("base64url"))).toThrow();
  });
  it("uses unique nonces per encryption", () => {
    expect(sealSecret("value")).not.toBe(sealSecret("value"));
  });
});
