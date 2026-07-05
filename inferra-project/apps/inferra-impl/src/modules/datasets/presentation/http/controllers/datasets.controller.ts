import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { DatasetsService } from "../../../application/services/datasets.service";
import {
  type CreateDatasetRequestDto,
  createDatasetRequestDto,
  type UpdateDatasetRequestDto,
  updateDatasetRequestDto,
} from "../dto/create-dataset.request.dto";
@Controller("api/v1/organizations/:organization_id/datasets")
@UseGuards(IdentityGuard)
export class DatasetsController {
  constructor(private readonly service: DatasetsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.listDatasets(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createDatasetRequestDto)) input: CreateDatasetRequestDto,
  ) {
    return this.service.createDataset(req.identity!.id, org, input);
  }
  @Get(":dataset_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("dataset_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getDataset(req.identity!.id, org, id);
  }
  @Patch(":dataset_id") update(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("dataset_id", ParseUUIDPipe) id: string,
    @Body(new ZodPipe(updateDatasetRequestDto)) input: UpdateDatasetRequestDto,
  ) {
    return this.service.updateDataset(req.identity!.id, org, id, input);
  }
  @Delete(":dataset_id") remove(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("dataset_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.removeDataset(req.identity!.id, org, id);
  }
}
