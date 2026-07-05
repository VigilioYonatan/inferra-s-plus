import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { DatasetsService } from "./application/services/datasets.service";
import { DatasetsController } from "./presentation/http/controllers/datasets.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, DatasetsService],
  controllers: [DatasetsController],
})
export class DatasetsModule {}
