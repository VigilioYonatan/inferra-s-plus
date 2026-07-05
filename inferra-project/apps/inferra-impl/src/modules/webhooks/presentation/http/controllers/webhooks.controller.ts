import {
  Body,
  Controller,
  Delete,
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
import { WebhooksService } from "../../../application/services/webhooks.service";
import {
  type CreateWebhookRequestDto,
  createWebhookRequestDto,
  type UpdateWebhookRequestDto,
  updateWebhookRequestDto,
} from "../dto/webhook.request.dto";
@Controller("api/v1/organizations/:organization_id/webhooks")
@UseGuards(IdentityGuard)
export class WebhooksController {
  constructor(private readonly service: WebhooksService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createWebhookRequestDto)) input: CreateWebhookRequestDto,
  ) {
    return this.service.create(req.identity!.id, org, input);
  }
  @Get(":id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Patch(":id") update(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(updateWebhookRequestDto)) input: UpdateWebhookRequestDto,
  ) {
    return this.service.update(req.identity!.id, org, id, input.enabled);
  }
  @Delete(":id") revoke(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.revoke(req.identity!.id, org, id);
  }
  @Post(":id/test") test(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.test(req.identity!.id, org, id);
  }
  @Get(":id/deliveries") deliveries(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.service.deliveries(req.identity!.id, org, id);
  }
}
