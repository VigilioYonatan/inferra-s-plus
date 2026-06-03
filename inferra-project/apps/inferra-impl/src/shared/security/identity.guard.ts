import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";
import {
  IdentityService,
  IdentityUser,
} from "../../modules/identity/application/services/identity.service";
export interface SessionRequest extends Request {
  identity?: IdentityUser;
}
@Injectable()
export class IdentityGuard implements CanActivate {
  constructor(private readonly identityService: IdentityService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<SessionRequest>();
    const token = (req as SessionRequest & { cookies?: Record<string, string> })
      .cookies?.inferra_session;
    req.identity = await this.identityService.currentUser(token);
    return true;
  }
}
