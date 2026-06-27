import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ObservabilityService } from "./application/services/observability.service";
import { ObservabilityController } from "./presentation/http/controllers/observability.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, ObservabilityService],
  controllers: [ObservabilityController],
})
export class ObservabilityQueriesModule {}
