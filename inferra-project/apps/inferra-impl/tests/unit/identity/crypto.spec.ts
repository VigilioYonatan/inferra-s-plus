import { describe, expect, it } from "vitest";
import {
  digest,
  equalDigest,
  secureToken,
} from "../../../src/shared/security/crypto";

describe("secure credential primitives", () => {
  it("creates unique high-entropy opaque tokens", () => {
    const x = secureToken();
    expect(x).not.toBe(secureToken());
    expect(x.length).toBeGreaterThan(40);
  });
  it("isolates hashes by purpose", () => {
    expect(digest("123", "otp")).not.toBe(digest("123", "apikey"));
  });
  it("rejects altered digest without short-circuit comparison", () => {
    const a = digest("correct", "session");
    expect(equalDigest(a, a)).toBe(true);
    expect(equalDigest(a, digest("incorrect", "session"))).toBe(false);
    expect(equalDigest(a, "short")).toBe(false);
  });
});
