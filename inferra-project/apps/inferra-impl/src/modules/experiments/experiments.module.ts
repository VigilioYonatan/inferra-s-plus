import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { ExperimentsService } from "./application/services/experiments.service";
import { ExperimentsController } from "./presentation/http/controllers/experiments.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, ExperimentsService],
  controllers: [ExperimentsController],
})
export class ExperimentsModule {}
