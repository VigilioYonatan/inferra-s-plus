import { describe, expect, it } from "vitest";
import { registerAccountRequestDto } from "../../../src/modules/identity/presentation/http/dto/register-account.request.dto";
import { verifyEmailOtpRequestDto } from "../../../src/modules/identity/presentation/http/dto/verify-email-otp.request.dto";

describe("identity input contracts", () => {
  it("rejects weak passwords", () => {
    expect(
      registerAccountRequestDto.safeParse({ email: "a@b.com", password: "123" })
        .success,
    ).toBe(false);
  });
  it("normalizes email", () => {
    expect(
      registerAccountRequestDto.parse({
        email: "ADMIN@EXAMPLE.COM",
        password: "verysecurepassword",
      }).email,
    ).toBe("admin@example.com");
  });
  it("accepts only six-digit OTP", () => {
    expect(
      verifyEmailOtpRequestDto.safeParse({ email: "a@b.com", code: "12345x" })
        .success,
    ).toBe(false);
  });
});
