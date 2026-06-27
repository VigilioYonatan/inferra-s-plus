import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { HealthController } from "./presentation/http/controllers/health.controller";
@Module({ providers: [QueryService], controllers: [HealthController] })
export class SystemModule {}
