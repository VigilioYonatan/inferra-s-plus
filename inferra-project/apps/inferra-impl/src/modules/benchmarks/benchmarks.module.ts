import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { IdentityModule } from "../identity/identity.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { BenchmarksService } from "./application/services/benchmarks.service";
import { BenchmarksController } from "./presentation/http/controllers/benchmarks.controller";
@Module({
  imports: [IdentityModule, OrganizationsModule],
  providers: [QueryService, BenchmarksService],
  controllers: [BenchmarksController],
})
export class BenchmarksModule {}
