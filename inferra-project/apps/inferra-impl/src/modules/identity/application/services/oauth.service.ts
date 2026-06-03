import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { and, eq, gt } from "drizzle-orm";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../../../../config/env.schema";
import { oauthStates } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import {
  digest,
  secureToken,
  sha256,
} from "../../../../shared/security/crypto";
import { IdentityService, IdentityUser } from "./identity.service";
export type OAuthProvider = "google" | "facebook";
const providers = {
  google: {
    auth: "https://accounts.google.com/o/oauth2/v2/auth",
    token: "https://oauth2.googleapis.com/token",
  },
  facebook: {
    auth: "https://www.facebook.com/v22.0/dialog/oauth",
    token: "https://graph.facebook.com/v22.0/oauth/access_token",
  },
} as const;
@Injectable()
export class OAuthService {
  constructor(
    private readonly query: QueryService,
    private readonly identityService: IdentityService,
  ) {}
  private credentials(provider: OAuthProvider) {
    const id =
      provider === "google" ? env.GOOGLE_CLIENT_ID : env.FACEBOOK_CLIENT_ID;
    const secret =
      provider === "google"
        ? env.GOOGLE_CLIENT_SECRET
        : env.FACEBOOK_CLIENT_SECRET;
    if (!id || !secret)
      throw new ServiceUnavailableException(
        `${provider} sign-in not configured`,
      );
    return { id, secret };
  }
  private callback(provider: OAuthProvider) {
    return `${env.API_ORIGIN}/api/v1/auth/oauth/${provider}/callback`;
  }
  async begin(provider: OAuthProvider, link_user_id?: string) {
    const { id } = this.credentials(provider);
    const state = secureToken();
    const verifier = secureToken(48);
    const nonce = secureToken();
    await this.query.db.insert(oauthStates).values({
      state_hash: digest(state, "oauth"),
      provider,
      verifier,
      nonce,
      user_id: link_user_id ?? null,
      expires_at: new Date(Date.now() + 5 * 60_000),
    });
    const q = new URLSearchParams({
      client_id: id,
      redirect_uri: this.callback(provider),
      response_type: "code",
      state,
    });
    if (provider === "google") {
      q.set("scope", "openid email profile");
      q.set("code_challenge", sha256(verifier));
      q.set("code_challenge_method", "S256");
      q.set("nonce", nonce);
      q.set("prompt", "select_account");
    } else {
      q.set("scope", "email,public_profile");
      q.set("code_challenge", sha256(verifier));
      q.set("code_challenge_method", "S256");
    }
    return { url: `${providers[provider].auth}?${q.toString()}`, state };
  }
  async complete(
    provider: OAuthProvider,
    state: string,
    code: string,
    browser_state: string | undefined,
    authenticated_user_id?: string,
  ): Promise<IdentityUser> {
    if (!browser_state || browser_state !== state)
      throw new ForbiddenException("OAuth state mismatch");
    const state_hash = digest(state, "oauth");
    // State is deleted before token exchange, so a replay fails even if upstream is slow.
    const state_row = await this.query.db.transaction(async (tx) => {
      const [found] = await tx
        .delete(oauthStates)
        .where(
          and(
            eq(oauthStates.state_hash, state_hash),
            eq(oauthStates.provider, provider),
            gt(oauthStates.expires_at, new Date()),
          ),
        )
        .returning();
      return found;
    });
    if (!state_row) throw new UnauthorizedException("Expired OAuth state");
    const { id, secret } = this.credentials(provider);
    const form = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: id,
      client_secret: secret,
      code,
      redirect_uri: this.callback(provider),
      code_verifier: state_row.verifier,
    });
    const token_response = await fetch(providers[provider].token, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form,
      signal: AbortSignal.timeout(10000),
    });
    if (!token_response.ok)
      throw new UnauthorizedException("OAuth token exchange failed");
    const token_data = (await token_response.json()) as {
      access_token?: string;
      id_token?: string;
    };
    let subject: string;
    let email: string | undefined;
    let display_name: string | undefined;
    if (provider === "google") {
      if (!token_data.id_token)
        throw new UnauthorizedException("Missing Google ID token");
      const { payload } = await jwtVerify(
        token_data.id_token,
        createRemoteJWKSet(
          new URL("https://www.googleapis.com/oauth2/v3/certs"),
        ),
        {
          issuer: ["https://accounts.google.com", "accounts.google.com"],
          audience: id,
        },
      );
      if (
        payload.nonce !== state_row.nonce ||
        !payload.sub ||
        payload.email_verified !== true
      )
        throw new UnauthorizedException("Invalid Google identity");
      subject = payload.sub;
      email = typeof payload.email === "string" ? payload.email : undefined;
      display_name =
        typeof payload.name === "string" ? payload.name : undefined;
    } else {
      if (!token_data.access_token)
        throw new UnauthorizedException("Missing Facebook token");
      const { createHmac } = await import("node:crypto");
      const proof = createHmac("sha256", secret)
        .update(token_data.access_token)
        .digest("hex");
      const q = new URLSearchParams({
        fields: "id,name,email",
        appsecret_proof: proof,
      });
      const profile_resp = await fetch(
        `https://graph.facebook.com/v22.0/me?${q.toString()}`,
        {
          headers: { authorization: `Bearer ${token_data.access_token}` },
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!profile_resp.ok)
        throw new UnauthorizedException("Facebook identity failed");
      const profile = (await profile_resp.json()) as {
        id?: string;
        name?: string;
        email?: string;
      };
      if (!profile.id)
        throw new UnauthorizedException("Missing Facebook subject");
      subject = profile.id;
      email = profile.email;
      display_name = profile.name;
    }
    const existing = await this.identityService.getUserByProvider(
      provider,
      subject,
    );
    if (state_row.user_id) {
      if (authenticated_user_id !== state_row.user_id)
        throw new ForbiddenException(
          "Link identity requires your existing session",
        );
      if (existing && existing.id !== state_row.user_id)
        throw new ForbiddenException(
          "Identity already linked to another account",
        );
      if (!existing)
        await this.identityService.linkProviderIdentity(
          state_row.user_id,
          provider,
          subject,
        );
      const user = await this.identityService.getUserById(state_row.user_id);
      if (!user) throw new UnauthorizedException("Session user not found");
      return user;
    }
    if (existing) return existing;
    if (provider === "facebook")
      return this.identityService.registerUnverifiedProviderIdentity(
        provider,
        subject,
        email,
        display_name,
      );
    return this.identityService.registerProviderIdentity(
      provider,
      subject,
      email,
      display_name,
    );
  }
}
