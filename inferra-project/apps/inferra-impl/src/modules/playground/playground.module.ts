import { Module } from "@nestjs/common";
import { QueryService } from "../../shared/data/query";
import { OrganizationsModule } from "../organizations/organizations.module";
import { PlaygroundSessionsService } from "./application/services/playground-sessions.service";
import { PlaygroundSessionsController } from "./presentation/http/controllers/playground-sessions.controller";
@Module({
  imports: [OrganizationsModule],
  providers: [QueryService, PlaygroundSessionsService],
  controllers: [PlaygroundSessionsController],
})
export class PlaygroundModule {}
