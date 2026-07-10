import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { CostsService } from "./application/services/costs.service";
import { CostsController } from "./presentation/http/controllers/costs.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, CostsService],
  controllers: [CostsController],
})
export class CostEstimatesModule {}
