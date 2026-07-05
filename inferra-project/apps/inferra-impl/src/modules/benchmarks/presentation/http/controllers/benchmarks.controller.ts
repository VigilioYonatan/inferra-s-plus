import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ZodPipe } from "../../../../../shared/http/zod.pipe";
import {
  IdentityGuard,
  type SessionRequest,
} from "../../../../../shared/security/identity.guard";
import { BenchmarksService } from "../../../application/services/benchmarks.service";
import {
  type CreateBenchmarkRequestDto,
  createBenchmarkRequestDto,
} from "../dto/create-benchmark.request.dto";
@Controller("api/v1/organizations/:organization_id/benchmarks")
@UseGuards(IdentityGuard)
export class BenchmarksController {
  constructor(private readonly service: BenchmarksService) {}
  @Get() list(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
  ) {
    return this.service.listBenchmarks(req.identity!.id, org);
  }
  @Post() create(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Body(new ZodPipe(createBenchmarkRequestDto))
    input: CreateBenchmarkRequestDto,
  ) {
    return this.service.createBenchmark(req.identity!.id, org, input);
  }
  @Get(":benchmark_id") get(
    @Req() req: SessionRequest,
    @Param("organization_id", ParseUUIDPipe) org: string,
    @Param("benchmark_id", ParseUUIDPipe) id: string,
  ) {
    return this.service.getBenchmark(req.identity!.id, org, id);
  }
}
