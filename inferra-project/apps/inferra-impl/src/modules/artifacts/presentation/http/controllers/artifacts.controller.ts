import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Response } from "express";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { ArtifactsService } from "../../../application/services/artifacts.service";
@Controller("api/v1/organizations/:organization_id/artifacts")
@UseGuards(IdentityGuard)
export class ArtifactsController {
  constructor(private readonly service: ArtifactsService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.list(req.identity!.id, org);
  }
  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 20 * 1024 * 1024, files: 1 },
    }),
  )
  upload(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.upload(req.identity!.id, org, file);
  }
  @Get(":artifact_id") async get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("artifact_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.get(req.identity!.id, org, id);
  }
  @Get(":artifact_id/download") async download(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("artifact_id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.service.download(req.identity!.id, org, id);
    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="artifact"; filename*=UTF-8''${encodeURIComponent(file.original_name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      "Content-Length": String(file.file_size),
    });
    return new StreamableFile(file.stream);
  }
  @Delete(":artifact_id") remove(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("artifact_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(req.identity!.id, org, id);
  }
}
