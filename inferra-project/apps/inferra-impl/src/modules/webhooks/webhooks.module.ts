import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { WebhooksService } from "./application/services/webhooks.service";
import { WebhooksController } from "./presentation/http/controllers/webhooks.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
