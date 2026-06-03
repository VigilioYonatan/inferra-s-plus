import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import argon2 from "argon2";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import type { Response } from "express";
import nodemailer from "nodemailer";
import { env } from "../../../../config/env.schema";
import {
  oauthIdentities,
  otpChallenges,
  sessions,
  users,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import {
  digest,
  equalDigest,
  secureToken,
} from "../../../../shared/security/crypto";
import type { AuthenticatePasswordRequestDto } from "../../presentation/http/dto/authenticate-password.request.dto";
import type { RegisterAccountRequestDto } from "../../presentation/http/dto/register-account.request.dto";
export type IdentityUser = {
  id: string;
  email: string;
  display_name: string | null;
};
@Injectable()
export class IdentityService {
  constructor(private readonly query: QueryService) {}
  async registerAccount(
    input: RegisterAccountRequestDto,
  ): Promise<IdentityUser> {
    if (env.REGISTRATION_ENABLED !== "true")
      throw new ForbiddenException("Registration disabled");
    if (!env.SMTP_URL || !env.SMTP_FROM)
      throw new ServiceUnavailableException("Email verification requires SMTP");
    const password_hash = await argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
    try {
      const [user] = await this.query.db
        .insert(users)
        .values({
          email: input.email,
          password_hash,
          display_name: input.display_name || null,
        })
        .returning({
          id: users.id,
          email: users.email,
          display_name: users.display_name,
        });
      if (!user) throw new Error("User insert failed");
      return user;
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new ConflictException("Email already registered");
      throw err;
    }
  }
  async authenticatePassword(
    input: AuthenticatePasswordRequestDto,
  ): Promise<IdentityUser> {
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);
    // Always compute hash verification to reduce user enumeration via timing.
    const fallback =
      "$argon2id$v=19$m=65536,t=3,p=1$rI+0oKCIoSvA9+2/Ji2T6A$X+9yvpqnpR50d7RDd4bZUKd2mQKi3oDPs/l91xrDKUo";
    let valid = false;
    try {
      valid = await argon2.verify(
        user?.password_hash || fallback,
        input.password,
      );
    } catch {
      valid = false;
    }
    if (!user || !valid || user.disabled_at)
      throw new UnauthorizedException("Invalid credentials");
    if (!user.email_verified)
      throw new ForbiddenException(
        "Verify your email address before signing in",
      );
    return { id: user.id, email: user.email, display_name: user.display_name };
  }
  async issueSession(user: IdentityUser, res: Response) {
    const [verified] = await this.query.db
      .select({ email_verified: users.email_verified })
      .from(users)
      .where(eq(users.id, user.id));
    if (!verified?.email_verified)
      throw new ForbiddenException("Email verification required");
    const token = secureToken();
    const [account] = await this.query.db
      .select({ totp_enabled: users.totp_enabled })
      .from(users)
      .where(eq(users.id, user.id));
    const requires_mfa = account?.totp_enabled === true;
    await this.query.db.insert(sessions).values({
      user_id: user.id,
      token_hash: digest(token, "session"),
      expires_at: new Date(Date.now() + 12 * 3600_000),
      mfa_verified: !requires_mfa,
      last_step_up_at: new Date(),
    });
    res.cookie("inferra_session", token, {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 3600_000,
    });
    return { ok: true, user: requires_mfa ? undefined : user, requires_mfa };
  }
  async currentUser(
    token: string | undefined,
    allow_pre_mfa = false,
  ): Promise<IdentityUser> {
    if (!token) throw new UnauthorizedException("Authentication required");
    const [found] = await this.query.db
      .select({
        id: users.id,
        email: users.email,
        display_name: users.display_name,
        disabled_at: users.disabled_at,
        mfa_verified: sessions.mfa_verified,
      })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.user_id))
      .where(
        and(
          eq(sessions.token_hash, digest(token, "session")),
          gt(sessions.expires_at, new Date()),
          isNull(sessions.revoked_at),
        ),
      )
      .limit(1);
    if (!found || found.disabled_at)
      throw new UnauthorizedException("Session expired");
    if (!allow_pre_mfa && !found.mfa_verified)
      throw new ForbiddenException("MFA challenge required");
    return {
      id: found.id,
      email: found.email,
      display_name: found.display_name,
    };
  }
  async logout(token: string | undefined, res: Response) {
    if (token)
      await this.query.db
        .update(sessions)
        .set({ revoked_at: new Date() })
        .where(eq(sessions.token_hash, digest(token, "session")));
    res.clearCookie("inferra_session", {
      path: "/",
      sameSite: "lax",
      secure: env.COOKIE_SECURE === "true",
    });
    return { ok: true };
  }
  async listSessions(user_id: string) {
    return this.query.db
      .select({
        id: sessions.id,
        created_at: sessions.created_at,
        expires_at: sessions.expires_at,
      })
      .from(sessions)
      .where(and(eq(sessions.user_id, user_id), isNull(sessions.revoked_at)))
      .orderBy(desc(sessions.created_at));
  }
  async revokeSession(user_id: string, session_id: string) {
    const rows = await this.query.db
      .update(sessions)
      .set({ revoked_at: new Date() })
      .where(and(eq(sessions.id, session_id), eq(sessions.user_id, user_id)))
      .returning({ id: sessions.id });
    if (!rows.length) throw new BadRequestException("Unknown session");
    return { ok: true };
  }
  async requestEmailOtp(
    email: string,
    purpose: "login" | "recovery" | "verify" = "login",
  ) {
    if (!env.SMTP_URL || !env.SMTP_FROM)
      throw new ServiceUnavailableException("Email delivery not configured");
    // Rate limiting per normalized email in the primary DB; anti-enumeration response.
    const [last] = await this.query.db
      .select({ created_at: otpChallenges.created_at })
      .from(otpChallenges)
      .where(eq(otpChallenges.email, email))
      .orderBy(desc(otpChallenges.created_at))
      .limit(1);
    if (last && Date.now() - last.created_at.getTime() < 60_000)
      return { ok: true };
    const [user] = await this.query.db
      .select({ id: users.id, email_verified: users.email_verified })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (
      user &&
      (purpose === "verify" ? !user.email_verified : user.email_verified)
    ) {
      const { randomInt } = await import("node:crypto");
      const otp = String(randomInt(0, 1_000_000)).padStart(6, "0");
      await this.query.db.insert(otpChallenges).values({
        email,
        purpose,
        code_hash: digest(otp, `otp:${email}:${purpose}`),
        expires_at: new Date(Date.now() + 5 * 60_000),
      });
      const transport = nodemailer.createTransport(env.SMTP_URL);
      await transport.sendMail({
        from: env.SMTP_FROM,
        to: email,
        subject:
          purpose === "verify"
            ? "Verify your Inferra email"
            : purpose === "recovery"
              ? "Your Inferra password recovery code"
              : "Your Inferra sign-in code",
        text: `Your Inferra ${purpose === "verify" ? "email verification" : purpose === "recovery" ? "password recovery" : "sign-in"} code is ${otp}. It expires in 5 minutes. Do not share it.`,
      });
    }
    return { ok: true };
  }
  async verifyEmailOtp(
    email: string,
    code: string,
    purpose: "login" | "recovery" | "verify" = "login",
  ): Promise<IdentityUser> {
    const result = await this.query.db.transaction(async (tx) => {
      // Locks latest challenge; concurrent replay cannot consume twice.
      const found = await tx.execute(
        sql`SELECT id,code_hash,attempts,expires_at,consumed_at FROM otp_challenges WHERE email=${email} AND purpose=${purpose} ORDER BY created_at DESC LIMIT 1 FOR UPDATE`,
      );
      const challenge = found.rows[0] as
        | {
            id: string;
            code_hash: string;
            attempts: number;
            expires_at: Date;
            consumed_at: Date | null;
          }
        | undefined;
      if (
        !challenge ||
        challenge.consumed_at ||
        new Date(challenge.expires_at).getTime() < Date.now() ||
        challenge.attempts >= 5
      )
        throw new UnauthorizedException("Invalid or expired code");
      await tx
        .update(otpChallenges)
        .set({ attempts: challenge.attempts + 1 })
        .where(eq(otpChallenges.id, challenge.id));
      if (
        !equalDigest(
          challenge.code_hash,
          digest(code, `otp:${email}:${purpose}`),
        )
      )
        return { invalid: true as const };
      await tx
        .update(otpChallenges)
        .set({ consumed_at: new Date() })
        .where(eq(otpChallenges.id, challenge.id));
      const [user] = await tx
        .select({
          id: users.id,
          email: users.email,
          display_name: users.display_name,
        })
        .from(users)
        .where(and(eq(users.email, email), isNull(users.disabled_at)))
        .limit(1);
      if (!user) throw new UnauthorizedException("Invalid or expired code");
      if (purpose !== "verify") {
        const [account] = await tx
          .select({ verified: users.email_verified })
          .from(users)
          .where(eq(users.id, user.id));
        if (!account?.verified)
          throw new UnauthorizedException("Invalid or expired code");
      }
      return user;
    });
    if ("invalid" in result)
      throw new UnauthorizedException("Invalid or expired code");
    return result;
  }
  async completeEmailVerification(email: string, code: string) {
    const user = await this.verifyEmailOtp(email, code, "verify");
    await this.query.db
      .update(users)
      .set({ email_verified: true })
      .where(eq(users.id, user.id));
    return user;
  }
  async completePasswordRecovery(
    email: string,
    code: string,
    new_password: string,
  ) {
    const user = await this.verifyEmailOtp(email, code, "recovery");
    const password_hash = await argon2.hash(new_password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 1,
    });
    await this.query.db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ password_hash })
        .where(eq(users.id, user.id));
      await tx
        .update(sessions)
        .set({ revoked_at: new Date() })
        .where(eq(sessions.user_id, user.id));
    });
    return { ok: true };
  }
  async getUserById(user_id: string) {
    const [user] = await this.query.db
      .select({
        id: users.id,
        email: users.email,
        display_name: users.display_name,
      })
      .from(users)
      .where(and(eq(users.id, user_id), isNull(users.disabled_at)));
    return user;
  }
  async linkProviderIdentity(
    user_id: string,
    provider: string,
    subject: string,
  ) {
    try {
      await this.query.db
        .insert(oauthIdentities)
        .values({ user_id, provider, provider_subject: subject });
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        err.code === "23505"
      )
        throw new ConflictException("Provider identity already linked");
      throw err;
    }
  }
  async getUserByProvider(provider: string, subject: string) {
    const [row] = await this.query.db
      .select({
        id: users.id,
        email: users.email,
        display_name: users.display_name,
      })
      .from(oauthIdentities)
      .innerJoin(users, eq(users.id, oauthIdentities.user_id))
      .where(
        and(
          eq(oauthIdentities.provider, provider),
          eq(oauthIdentities.provider_subject, subject),
        ),
      )
      .limit(1);
    return row;
  }
  async registerProviderIdentity(
    provider: string,
    subject: string,
    email: string | undefined,
    name: string | undefined,
  ) {
    if (env.REGISTRATION_ENABLED !== "true")
      throw new ForbiddenException("Registration disabled");
    // Do not attach an OAuth identity to a preexisting email account: explicit account linking required.
    if (!email) throw new BadRequestException("Verified email is required");
    return this.query.db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);
      if (existing)
        throw new ConflictException(
          "Email belongs to an existing account. Sign in and link the provider separately.",
        );
      const [created] = await tx
        .insert(users)
        .values({
          email: email.toLowerCase(),
          display_name: name || null,
          email_verified: true,
        })
        .returning({
          id: users.id,
          email: users.email,
          display_name: users.display_name,
        });
      if (!created) throw new Error("Could not create user");
      await tx
        .insert(oauthIdentities)
        .values({ user_id: created.id, provider, provider_subject: subject });
      return created;
    });
  }
  async rotateSession(token: string | undefined, res: Response) {
    if (!token) throw new UnauthorizedException("Authentication required");
    const existing_hash = digest(token, "session");
    const next = secureToken();
    const outcome = await this.query.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(sessions)
        .where(eq(sessions.token_hash, existing_hash))
        .for("update")
        .limit(1);
      if (!current) return "unknown" as const;
      if (current.rotated_at) {
        await tx
          .update(sessions)
          .set({ revoked_at: new Date() })
          .where(eq(sessions.family_id, current.family_id));
        return "reused" as const;
      }
      if (current.revoked_at || current.expires_at.getTime() <= Date.now())
        return "expired" as const;
      await tx
        .update(sessions)
        .set({ rotated_at: new Date(), revoked_at: new Date() })
        .where(eq(sessions.id, current.id));
      await tx.insert(sessions).values({
        user_id: current.user_id,
        token_hash: digest(next, "session"),
        family_id: current.family_id,
        mfa_verified: current.mfa_verified,
        last_step_up_at: current.last_step_up_at,
        expires_at: new Date(Date.now() + 12 * 3600_000),
      });
      return "ok" as const;
    });
    if (outcome !== "ok")
      throw new UnauthorizedException(
        outcome === "reused"
          ? "Session reuse detected; family revoked"
          : "Session expired",
      );
    res.cookie("inferra_session", next, {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 3600_000,
    });
    return { ok: true };
  }
  async logoutAll(user_id: string, res: Response) {
    await this.query.db
      .update(sessions)
      .set({ revoked_at: new Date() })
      .where(and(eq(sessions.user_id, user_id), isNull(sessions.revoked_at)));
    res.clearCookie("inferra_session", {
      path: "/",
      sameSite: "lax",
      secure: env.COOKIE_SECURE === "true",
    });
    return { ok: true };
  }
  async requireRecentStepUp(
    user_id: string,
    token: string | undefined,
    maxAgeMinutes = 10,
  ) {
    if (!token) throw new UnauthorizedException();
    const [session] = await this.query.db
      .select({ id: sessions.id, last_step_up_at: sessions.last_step_up_at })
      .from(sessions)
      .where(
        and(
          eq(sessions.token_hash, digest(token, "session")),
          eq(sessions.user_id, user_id),
          isNull(sessions.revoked_at),
        ),
      );
    if (
      !session?.last_step_up_at ||
      Date.now() - session.last_step_up_at.getTime() > maxAgeMinutes * 60_000
    )
      throw new ForbiddenException("Recent authentication required");
  }
  async recordStepUp(
    user_id: string,
    token: string | undefined,
    password: string,
  ) {
    if (!token) throw new UnauthorizedException();
    const [user] = await this.query.db
      .select()
      .from(users)
      .where(eq(users.id, user_id));
    if (
      !user?.password_hash ||
      !(await argon2.verify(user.password_hash, password))
    )
      throw new UnauthorizedException("Invalid credentials");
    await this.query.db
      .update(sessions)
      .set({ last_step_up_at: new Date() })
      .where(
        and(
          eq(sessions.token_hash, digest(token, "session")),
          eq(sessions.user_id, user_id),
          isNull(sessions.revoked_at),
        ),
      );
    return { ok: true };
  }
  async listSocialAccounts(user_id: string) {
    return this.query.db
      .select({
        provider: oauthIdentities.provider,
        id: oauthIdentities.id,
        created_at: oauthIdentities.created_at,
      })
      .from(oauthIdentities)
      .where(eq(oauthIdentities.user_id, user_id));
  }
  async unlinkSocialAccount(user_id: string, provider: string) {
    const linked = await this.query.db
      .select()
      .from(oauthIdentities)
      .where(eq(oauthIdentities.user_id, user_id));
    const [user] = await this.query.db
      .select({ password_hash: users.password_hash })
      .from(users)
      .where(eq(users.id, user_id));
    if (!user?.password_hash && linked.length <= 1)
      throw new ForbiddenException(
        "Set a password before removing your last sign-in method",
      );
    const rows = await this.query.db
      .delete(oauthIdentities)
      .where(
        and(
          eq(oauthIdentities.user_id, user_id),
          eq(oauthIdentities.provider, provider),
        ),
      )
      .returning({ id: oauthIdentities.id });
    if (!rows.length) throw new BadRequestException("Not linked");
    return { ok: true };
  }

  async registerUnverifiedProviderIdentity(
    provider: string,
    subject: string,
    email: string | undefined,
    name: string | undefined,
  ) {
    if (env.REGISTRATION_ENABLED !== "true")
      throw new ForbiddenException("Public registration is disabled");
    if (!email || !env.SMTP_URL || !env.SMTP_FROM)
      throw new ForbiddenException(
        "Email is required for Facebook sign-in verification",
      );
    const normalized = email.trim().toLowerCase();
    // Do not automatically link by email. Facebook email claims are unverified until OTP is completed.
    return this.query.db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, normalized));
      if (existing)
        throw new ConflictException(
          "Email already in use. Sign in and link Facebook from security settings.",
        );
      const [created] = await tx
        .insert(users)
        .values({
          email: normalized,
          email_verified: false,
          display_name: name || null,
        })
        .returning({
          id: users.id,
          email: users.email,
          display_name: users.display_name,
        });
      if (!created) throw new Error("Could not register account");
      await tx
        .insert(oauthIdentities)
        .values({ user_id: created.id, provider, provider_subject: subject });
      return created;
    });
  }
}
