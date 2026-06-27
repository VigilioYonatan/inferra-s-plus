import { Module } from "@nestjs/common";
import { OrganizationsModule } from "../organizations/organizations.module";
import { GpuNodesService } from "./application/services/gpu-nodes.service";
import { GpuNodesController } from "./presentation/http/controllers/gpu-nodes.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [GpuNodesService],
  controllers: [GpuNodesController],
})
export class GpuNodesModule {}
