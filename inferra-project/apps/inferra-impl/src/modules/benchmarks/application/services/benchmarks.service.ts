import {
  Injectable,
  NotFoundException,
  type OnModuleDestroy,
} from "@nestjs/common";
import { Queue } from "bullmq";
import { and, desc, eq } from "drizzle-orm";
import Redis from "ioredis";
import { env } from "../../../../config/env.schema";
import { benchmarks, models } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { CreateBenchmarkRequestDto } from "../../presentation/http/dto/create-benchmark.request.dto";
@Injectable()
export class BenchmarksService implements OnModuleDestroy {
  private readonly redis = new Redis(env.VALKEY_URL, {
    maxRetriesPerRequest: null,
  });
  private readonly queue = new Queue("inferra-benchmarks", {
    connection: this.redis,
  });
  constructor(
    private readonly query: QueryService,
    private readonly organizations: OrganizationsService,
  ) {}
  async onModuleDestroy() {
    await this.queue.close();
    await this.redis.quit();
  }
  async listBenchmarks(user_id: string, organization_id: string) {
    await this.organizations.requireMembership(
      user_id,
      organization_id,
      "analyst",
    );
    return this.query.db
      .select()
      .from(benchmarks)
      .where(eq(benchmarks.organization_id, organization_id))
      .orderBy(desc(benchmarks.created_at))
      .limit(50);
  }
  async createBenchmark(
    user_id: string,
    organization_id: string,
    input: CreateBenchmarkRequestDto,
  ) {
    await this.organizations.requireMembership(
      user_id,
      organization_id,
      "operator",
    );
    const [model] = await this.query.db
      .select({ id: models.id })
      .from(models)
      .where(
        and(
          eq(models.id, input.model_id),
          eq(models.organization_id, organization_id),
        ),
      );
    if (!model) throw new NotFoundException("Model not found");
    const [benchmark] = await this.query.db
      .insert(benchmarks)
      .values({
        organization_id,
        model_id: input.model_id,
        configuration: input,
      })
      .returning();
    if (!benchmark) throw new Error("Queue failed");
    await this.queue.add(
      "benchmark",
      { id: benchmark.id },
      {
        jobId: benchmark.id,
        attempts: 1,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
    return benchmark;
  }
  async getBenchmark(user_id: string, organization_id: string, id: string) {
    await this.organizations.requireMembership(
      user_id,
      organization_id,
      "analyst",
    );
    const [item] = await this.query.db
      .select()
      .from(benchmarks)
      .where(
        and(
          eq(benchmarks.id, id),
          eq(benchmarks.organization_id, organization_id),
        ),
      );
    if (!item) throw new NotFoundException();
    return item;
  }
}
