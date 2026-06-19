import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { RoutingPoliciesService } from "../../../application/services/routing-policies.service";
import {
  type CreateRoutingPolicyRequestDto,
  createRoutingPolicyRequestDto,
  type UpdateRoutingPolicyRequestDto,
  updateRoutingPolicyRequestDto,
} from "../dto/create-routing-policy.request.dto";
@Controller("api/v1/organizations/:organization_id/routing")
@UseGuards(IdentityGuard)
export class RoutingPoliciesController {
  constructor(private readonly service: RoutingPoliciesService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createRoutingPolicyRequestDto))
    input: CreateRoutingPolicyRequestDto,
  ) {
    return this.service.create(req.identity!.id, org, input);
  }
  @Get(":policy_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("policy_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Patch(":policy_id") update(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("policy_id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(updateRoutingPolicyRequestDto))
    input: UpdateRoutingPolicyRequestDto,
  ) {
    return this.service.update(req.identity!.id, org, id, input);
  }
}
