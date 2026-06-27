import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { AlertsService } from "./application/services/alerts.service";
import { AlertsController } from "./presentation/http/controllers/alerts.controller";
import { InternalAlertsController } from "./presentation/http/controllers/internal-alerts.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, AlertsService],
  controllers: [AlertsController, InternalAlertsController],
})
export class AlertsModule {}
