import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { RoutingPoliciesService } from "./application/services/routing-policies.service";
import { RoutingPoliciesController } from "./presentation/http/controllers/routing-policies.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, RoutingPoliciesService],
  controllers: [RoutingPoliciesController],
})
export class RequestRoutingModule {}
