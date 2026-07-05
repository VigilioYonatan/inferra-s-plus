import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { NotificationsService } from "./application/services/notifications.service";
import { NotificationsController } from "./presentation/http/controllers/notifications.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, NotificationsService],
  controllers: [NotificationsController],
})
export class NotificationsModule {}
