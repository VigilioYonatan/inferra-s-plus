import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { and, eq, isNull } from "drizzle-orm";
import { recoveryCodes, sessions, users } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { digest } from "../../../../shared/security/crypto";
import {
  decryptSecret,
  encryptSecret,
  newTotpSecret,
  verifyTotp,
} from "../../domain/services/totp";
@Injectable()
export class MfaService {
  constructor(private readonly query: QueryService) {}
  async beginEnrollment(user_id: string) {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (!user || user.totp_enabled)
      throw new BadRequestException("MFA already enabled or account missing");
    const secret = newTotpSecret();
    await this.query.db
      .update(users)
      .set({ totp_pending: encryptSecret(secret) })
      .where(eq(users.id, user_id));
    const issuer = "Inferra";
    return {
      secret,
      otpauth_url: `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user.email)}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`,
    };
  }
  async completeEnrollment(user_id: string, code: string) {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (!user?.totp_pending)
      throw new BadRequestException("Start enrollment first");
    const secret = decryptSecret(user.totp_pending);
    if (!verifyTotp(secret, code))
      throw new UnauthorizedException("Invalid authenticator code");
    const recovery_codes = Array.from({ length: 10 }, () =>
      randomBytes(12).toString("hex"),
    );
    await this.query.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          totp_secret: user.totp_pending,
          totp_pending: null,
          totp_enabled: true,
        })
        .where(eq(users.id, user_id));
      await tx.insert(recoveryCodes).values(
        recovery_codes.map((c) => ({
          user_id,
          code_hash: digest(c, "recovery"),
        })),
      );
    });
    return { ok: true, recovery_codes };
  }
  async verifyChallenge(user_id: string, token_hash: string, code: string) {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (!user?.totp_enabled || !user.totp_secret)
      throw new ForbiddenException("MFA not enrolled");
    let accepted = verifyTotp(decryptSecret(user.totp_secret), code);
    if (!accepted) {
      const [used] = await this.query.db
        .update(recoveryCodes)
        .set({ used_at: new Date() })
        .where(
          and(
            eq(recoveryCodes.user_id, user_id),
            eq(recoveryCodes.code_hash, digest(code, "recovery")),
            isNull(recoveryCodes.used_at),
          ),
        )
        .returning({ id: recoveryCodes.id });
      accepted = Boolean(used);
    }
    if (!accepted) throw new UnauthorizedException("Invalid MFA code");
    await this.query.db
      .update(sessions)
      .set({ mfa_verified: true, last_step_up_at: new Date() })
      .where(
        and(eq(sessions.user_id, user_id), eq(sessions.token_hash, token_hash)),
      );
    return { ok: true };
  }
  /** Only a fresh TOTP proof may authorize sensitive changes; recovery codes are reserved for login recovery. */
  async recordTotpStepUp(
    user_id: string,
    token: string | undefined,
    code: string,
  ) {
    if (!token) throw new UnauthorizedException("Session required");
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (
      !user?.totp_enabled ||
      !user.totp_secret ||
      !verifyTotp(decryptSecret(user.totp_secret), code)
    )
      throw new UnauthorizedException("Invalid authenticator code");
    const updated = await this.query.db
      .update(sessions)
      .set({ last_step_up_at: new Date() })
      .where(
        and(
          eq(sessions.user_id, user_id),
          eq(sessions.token_hash, digest(token, "session")),
          isNull(sessions.revoked_at),
        ),
      )
      .returning({ id: sessions.id });
    if (!updated.length) throw new UnauthorizedException("Session expired");
    return { ok: true };
  }

  async disableTotp(user_id: string, code: string) {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (!user?.totp_enabled || !user.totp_secret)
      throw new BadRequestException("MFA is not enabled");
    if (!verifyTotp(decryptSecret(user.totp_secret), code))
      throw new UnauthorizedException("Invalid authenticator code");
    await this.query.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({
          totp_secret: null,
          totp_pending: null,
          totp_enabled: false,
        })
        .where(eq(users.id, user_id));
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.user_id, user_id));
    });
    return { ok: true };
  }

  async regenerateRecoveryCodes(user_id: string, code: string) {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (!user?.totp_enabled || !user.totp_secret)
      throw new BadRequestException("MFA is not enabled");
    if (!verifyTotp(decryptSecret(user.totp_secret), code))
      throw new UnauthorizedException("Invalid authenticator code");
    const recovery_codes = Array.from({ length: 10 }, () =>
      randomBytes(12).toString("hex"),
    );
    await this.query.db.transaction(async (tx) => {
      await tx.delete(recoveryCodes).where(eq(recoveryCodes.user_id, user_id));
      await tx.insert(recoveryCodes).values(
        recovery_codes.map((c) => ({
          user_id,
          code_hash: digest(c, "recovery"),
        })),
      );
    });
    return { ok: true, recovery_codes };
  }
}
