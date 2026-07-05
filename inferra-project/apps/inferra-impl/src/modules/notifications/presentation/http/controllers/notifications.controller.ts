import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { NotificationsService } from "../../../application/services/notifications.service";
import {
  type NotificationSettingsRequestDto,
  notificationSettingsRequestDto,
} from "../dto/notification-settings.request.dto";
@Controller("api/v1/organizations/:organization_id/notifications")
@UseGuards(IdentityGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}
  @Get("settings") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.get(req.identity!.id, org);
  }
  @Put("settings") update(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(notificationSettingsRequestDto))
    input: NotificationSettingsRequestDto,
  ) {
    return this.service.update(req.identity!.id, org, input);
  }
}
