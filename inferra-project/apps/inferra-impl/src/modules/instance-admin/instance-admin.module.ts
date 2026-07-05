import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { InstanceAdminService } from "./application/services/instance-admin.service";
import { InstanceAdminController } from "./presentation/http/controllers/instance-admin.controller";
@Module({
  providers: [QueryService, InstanceAdminService],
  controllers: [InstanceAdminController],
  exports: [InstanceAdminService],
})
export class InstanceAdminModule {}
