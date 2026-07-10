import { describe, expect, it } from "vitest";
import {
  calculateTotp,
  decryptSecret,
  encryptSecret,
  verifyTotp,
} from "../../../src/modules/identity/domain/services/totp";

describe("TOTP RFC6238", () => {
  it("matches RFC example 6 digits (counter=1)", () => {
    expect(calculateTotp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59000)).toBe(
      "287082",
    );
  });
  it("encrypts and decrypts enrollment secrets", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    expect(decryptSecret(encryptSecret(secret))).toBe(secret);
    expect(encryptSecret(secret)).not.toBe(encryptSecret(secret));
  });
  it("rejects incorrect/expired codes", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const code = calculateTotp(secret, 60000);
    expect(verifyTotp(secret, code, 60000)).toBe(true);
    expect(verifyTotp(secret, "abcdef", 60000)).toBe(false);
    expect(verifyTotp(secret, code, 300000)).toBe(false);
  });
});
