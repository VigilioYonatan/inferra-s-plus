import { describe, expect, it } from "vitest";
import { registerAccountRequestDto } from "../../../src/modules/identity/presentation/http/dto/register-account.request.dto";
import { verifyEmailOtpRequestDto } from "../../../src/modules/identity/presentation/http/dto/verify-email-otp.request.dto";

describe("registration email verification contracts", () => {
  it("requires six decimal digits", () => {
    for (const code of ["12345", "1234567", "1234a6", "000 00", ""]) {
      expect(
        verifyEmailOtpRequestDto.safeParse({ email: "user@example.com", code })
          .success,
      ).toBe(false);
    }
  });
  it("normalizes case before OTP lookup", () => {
    const parsed = verifyEmailOtpRequestDto.parse({
      email: "USER@EXAMPLE.COM",
      code: "123456",
    });
    expect(parsed.email).toBe("user@example.com");
  });
  it("blocks malformed addresses at the registration edge", () => {
    expect(
      registerAccountRequestDto.safeParse({
        email: "not-an-email",
        password: "a-long-valid-password",
      }).success,
    ).toBe(false);
  });
});
