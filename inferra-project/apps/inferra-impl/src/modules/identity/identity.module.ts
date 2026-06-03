import { Global, Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityGuard } from "../../shared/security/identity.guard";
import { IdentityService } from "./application/services/identity.service";
import { MfaService } from "./application/services/mfa.service";
import { OAuthService } from "./application/services/oauth.service";
import { IdentityController } from "./presentation/http/controllers/identity.controller";
import { MfaController } from "./presentation/http/controllers/mfa.controller";
import { OAuthController } from "./presentation/http/controllers/oauth.controller";

@Global()
@Module({
  providers: [
    QueryService,
    IdentityService,
    OAuthService,
    IdentityGuard,
    MfaService,
  ],
  controllers: [IdentityController, OAuthController, MfaController],
  exports: [IdentityService, IdentityGuard, MfaService, OAuthService],
})
export class IdentityModule {}
