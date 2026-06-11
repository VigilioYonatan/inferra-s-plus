import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ModelImportsService } from "./application/services/model-imports.service";
import { ModelImportsController } from "./presentation/http/controllers/model-imports.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, ModelImportsService],
  controllers: [ModelImportsController],
})
export class ModelImportsModule {}
