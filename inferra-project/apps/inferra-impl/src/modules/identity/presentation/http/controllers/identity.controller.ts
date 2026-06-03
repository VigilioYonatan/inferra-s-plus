import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { z } from "zod";

const recoveryDto = z.object({
  email: z.email().transform((v) => v.toLowerCase()),
  code: z.string().regex(/^\d{6}$/),
  new_password: z.string().min(12).max(128),
});

import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { IdentityService } from "../../../application/services/identity.service";
import {
  type AuthenticatePasswordRequestDto,
  authenticatePasswordRequestDto,
} from "../dto/authenticate-password.request.dto";
import {
  type RegisterAccountRequestDto,
  registerAccountRequestDto,
} from "../dto/register-account.request.dto";
import {
  type RequestEmailOtpRequestDto,
  requestEmailOtpRequestDto,
} from "../dto/request-email-otp.request.dto";
import {
  type VerifyEmailOtpRequestDto,
  verifyEmailOtpRequestDto,
} from "../dto/verify-email-otp.request.dto";
@Controller("api/v1/auth")
export class IdentityController {
  constructor(
    @Inject(IdentityService)
    private readonly identityService: IdentityService,
  ) {}
  @Post("register")
  async registerAccount(
    @Body(new ZodPipe(registerAccountRequestDto))
    input: RegisterAccountRequestDto,
  ) {
    const user = await this.identityService.registerAccount(input);
    await this.identityService.requestEmailOtp(user.email, "verify");
    return { ok: true, verification_required: true, email: user.email };
  }
  @Post("email/verification/request") async requestEmailVerification(
    @Body(new ZodPipe(requestEmailOtpRequestDto))
    input: RequestEmailOtpRequestDto,
  ) {
    return this.identityService.requestEmailOtp(input.email, "verify");
  }
  @Post("email/verification/complete") async verifyRegistrationEmail(
    @Body(new ZodPipe(verifyEmailOtpRequestDto))
    input: VerifyEmailOtpRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.identityService.completeEmailVerification(
      input.email,
      input.code,
    );
    return this.identityService.issueSession(user, res);
  }
  @Post("password/login")
  async authenticatePassword(
    @Body(new ZodPipe(authenticatePasswordRequestDto))
    input: AuthenticatePasswordRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.identityService.issueSession(
      await this.identityService.authenticatePassword(input),
      res,
    );
  }
  @Post("otp/request")
  async requestEmailOtp(
    @Body(new ZodPipe(requestEmailOtpRequestDto))
    input: RequestEmailOtpRequestDto,
  ) {
    return this.identityService.requestEmailOtp(input.email);
  }
  @Post("password/recovery/request") async requestPasswordReset(
    @Body(new ZodPipe(requestEmailOtpRequestDto))
    input: RequestEmailOtpRequestDto,
  ) {
    return this.identityService.requestEmailOtp(input.email, "recovery");
  }
  @Post("password/recovery/complete") async completePasswordReset(
    @Body(new ZodPipe(recoveryDto)) input: z.infer<typeof recoveryDto>,
  ) {
    return this.identityService.completePasswordRecovery(
      input.email.toLowerCase(),
      input.code,
      input.new_password,
    );
  }
  @Post("otp/verify")
  async verifyEmailOtp(
    @Body(new ZodPipe(verifyEmailOtpRequestDto))
    input: VerifyEmailOtpRequestDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.identityService.issueSession(
      await this.identityService.verifyEmailOtp(input.email, input.code),
      res,
    );
  }
  @UseGuards(IdentityGuard) @Get("me") async currentUser(
    @Req() req: SessionRequest,
  ) {
    return { user: req.identity };
  }
  @UseGuards(IdentityGuard) @Get("sessions") async listSessions(
    @Req() req: SessionRequest,
  ) {
    return this.identityService.listSessions(req.identity!.id);
  }
  @UseGuards(IdentityGuard)
  @Post("sessions/:session_id/revoke")
  async revokeSession(
    @Req() req: SessionRequest,
    @Param("session_id") session_id: string,
  ) {
    return this.identityService.revokeSession(req.identity!.id, session_id);
  }
  @Post("sessions/rotate") async rotateSession(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.identityService.rotateSession(
      (req as Request & { cookies?: Record<string, string> }).cookies
        ?.inferra_session,
      res,
    );
  }
  @UseGuards(IdentityGuard) @Post("sessions/revoke-all") async revokeAll(
    @Req() req: SessionRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.identityService.logoutAll(req.identity!.id, res);
  }
  @UseGuards(IdentityGuard) @Post("step-up") async stepUp(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(z.object({ password: z.string().min(1) }))) input: {
      password: string;
    },
  ) {
    return this.identityService.recordStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
      input.password,
    );
  }
  @UseGuards(IdentityGuard) @Get("social-accounts") async socialAccounts(
    @Req() req: SessionRequest,
  ) {
    return this.identityService.listSocialAccounts(req.identity!.id);
  }
  @UseGuards(IdentityGuard)
  @Post("social-accounts/:provider/unlink")
  async unlink(
    @Req() req: SessionRequest,
    @Param("provider") provider: string,
  ) {
    if (!["google", "facebook"].includes(provider))
      throw new BadRequestException("Unknown provider");
    await this.identityService.requireRecentStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
    );
    return this.identityService.unlinkSocialAccount(req.identity!.id, provider);
  }
  @Post("logout") async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.identityService.logout(
      (req as Request & { cookies?: Record<string, string> }).cookies
        ?.inferra_session,
      res,
    );
  }
}
