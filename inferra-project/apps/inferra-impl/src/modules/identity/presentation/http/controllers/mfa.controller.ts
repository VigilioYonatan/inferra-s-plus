import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import { digest } from "../../../../../shared/security/crypto";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { IdentityService } from "../../../application/services/identity.service";
import { MfaService } from "../../../application/services/mfa.service";

const codeDto = z.object({ code: z.string().min(6).max(32) });
@Controller("api/v1/auth/mfa")
export class MfaController {
  constructor(
    private readonly service: MfaService,
    private readonly identity: IdentityService,
  ) {}
  @UseGuards(IdentityGuard) @Post("enroll") async enroll(
    @Req() req: SessionRequest,
  ) {
    return this.service.beginEnrollment(req.identity!.id);
  }
  @UseGuards(IdentityGuard) @Post("enroll/verify") async complete(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(codeDto)) input: z.infer<typeof codeDto>,
  ) {
    return this.service.completeEnrollment(req.identity!.id, input.code);
  }
  @UseGuards(IdentityGuard) @Post("step-up") async stepUp(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(codeDto)) input: z.infer<typeof codeDto>,
  ) {
    return this.service.recordTotpStepUp(
      req.identity!.id,
      req.cookies?.inferra_session,
      input.code,
    );
  }
  @Post("challenge/verify") async verify(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(codeDto)) input: z.infer<typeof codeDto>,
  ) {
    const token = (req as SessionRequest & { cookies?: Record<string, string> })
      .cookies?.inferra_session;
    const user = await this.identity.currentUser(token, true);
    await this.service.verifyChallenge(
      user.id,
      digest(token || "", "session"),
      input.code,
    );
    return { ok: true };
  }
  @UseGuards(IdentityGuard) @Post("disable") async disable(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(codeDto)) input: z.infer<typeof codeDto>,
  ) {
    return this.service.disableTotp(req.identity!.id, input.code);
  }
  @UseGuards(IdentityGuard) @Post("recovery-codes/regenerate") async regenerate(
    @Req() req: SessionRequest,
    @Body(new ZodPipe(codeDto)) input: z.infer<typeof codeDto>,
  ) {
    return this.service.regenerateRecoveryCodes(req.identity!.id, input.code);
  }
}
