import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ArtifactsService } from "./application/services/artifacts.service";
import { ArtifactsController } from "./presentation/http/controllers/artifacts.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, ArtifactsService],
  controllers: [ArtifactsController],
  exports: [ArtifactsService],
})
export class ArtifactsModule {}
