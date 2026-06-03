import {
  BadRequestException,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { env } from "../../../../../config/env.schema";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { IdentityService } from "../../../application/services/identity.service";
import {
  OAuthProvider,
  OAuthService,
} from "../../../application/services/oauth.service";
@Controller("api/v1/auth/oauth")
export class OAuthController {
  constructor(
    private readonly oauthService: OAuthService,
    private readonly identityService: IdentityService,
  ) {}
  private provider(value: string): OAuthProvider {
    if (value !== "google" && value !== "facebook")
      throw new BadRequestException("Unsupported identity provider");
    return value;
  }
  @UseGuards(IdentityGuard) @Get(":provider/link/start") async beginLink(
    @Param("provider") raw: string,
    @Req() req: SessionRequest,
    @Res() res: Response,
  ) {
    const p = this.provider(raw);
    const { url, state } = await this.oauthService.begin(p, req.identity!.id);
    res.cookie("inferra_oauth_state", state, {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/api/v1/auth/oauth",
      maxAge: 300000,
    });
    res.redirect(302, url);
  }
  @Get(":provider/start") async beginOAuthLogin(
    @Param("provider") raw: string,
    @Res() res: Response,
  ) {
    const p = this.provider(raw);
    const { url, state } = await this.oauthService.begin(p);
    res.cookie("inferra_oauth_state", state, {
      httpOnly: true,
      secure: env.COOKIE_SECURE === "true",
      sameSite: "lax",
      path: "/api/v1/auth/oauth",
      maxAge: 300000,
    });
    res.redirect(302, url);
  }
  @Get(":provider/callback") async completeOAuthLogin(
    @Param("provider") raw: string,
    @Query("state") state: string,
    @Query("code") code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const p = this.provider(raw);
    if (!state || !code)
      throw new BadRequestException("Missing authorization code");
    const browser_state = (
      req as Request & { cookies?: Record<string, string> }
    ).cookies?.inferra_oauth_state;
    const currentToken = (req as Request & { cookies?: Record<string, string> })
      .cookies?.inferra_session;
    let currentUserId: string | undefined;
    try {
      const currentUser = await this.identityService.currentUser(currentToken);
      currentUserId = currentUser.id;
    } catch {
      /* sign-in flow has no session */
    }
    const user = await this.oauthService.complete(
      p,
      state,
      code,
      browser_state,
      currentUserId,
    );
    res.clearCookie("inferra_oauth_state", {
      path: "/api/v1/auth/oauth",
      sameSite: "lax",
      secure: env.COOKIE_SECURE === "true",
    });
    const session = await (async () => {
      try {
        return await this.identityService.issueSession(user, res);
      } catch (err) {
        if (err instanceof ForbiddenException) {
          await this.identityService.requestEmailOtp(user.email, "verify");
          res.redirect(
            303,
            `${env.APP_ORIGIN}/register/verify?email=${encodeURIComponent(user.email)}`,
          );
          return null;
        }
        throw err;
      }
    })();
    if (!session) return;
    res.redirect(
      303,
      `${env.APP_ORIGIN}${session.requires_mfa ? "/mfa/challenge" : "/auth/complete"}`,
    );
  }
}
