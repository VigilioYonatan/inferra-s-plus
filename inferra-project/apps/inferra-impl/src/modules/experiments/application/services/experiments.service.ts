import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  auditEvents,
  benchmarks,
  experiments,
} from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { CreateExperimentRequestDto } from "../../presentation/http/dto/create-experiment.request.dto";
// Benchmark experiment compares recorded, reproducible runs. No hidden GPU test is launched.
@Injectable()
export class ExperimentsService {
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    return this.query.db
      .select()
      .from(experiments)
      .where(eq(experiments.organization_id, org))
      .orderBy(desc(experiments.created_at))
      .limit(100);
  }
  async get(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    const [row] = await this.query.db
      .select()
      .from(experiments)
      .where(and(eq(experiments.id, id), eq(experiments.organization_id, org)));
    if (!row) throw new NotFoundException("Experiment not found");
    return row;
  }
  async create(actor: string, org: string, input: CreateExperimentRequestDto) {
    await this.orgs.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const found = await tx
        .select({ id: benchmarks.id })
        .from(benchmarks)
        .where(
          and(
            eq(benchmarks.organization_id, org),
            inArray(benchmarks.id, [
              input.baseline_benchmark_id,
              input.candidate_benchmark_id,
            ]),
          ),
        );
      if (found.length !== 2)
        throw new NotFoundException(
          "Both benchmark runs must be owned by this organization",
        );
      const [row] = await tx
        .insert(experiments)
        .values({ organization_id: org, created_by: actor, ...input })
        .returning();
      if (!row) throw new Error("Experiment insert failed");
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "experiment.created",
        resource_type: "experiment",
        resource_id: row.id,
      });
      return row;
    });
  }
  async compare(actor: string, org: string, id: string) {
    await this.orgs.requireMembership(actor, org, "operator");
    return this.query.db.transaction(async (tx) => {
      const [experiment] = await tx
        .select()
        .from(experiments)
        .where(
          and(eq(experiments.id, id), eq(experiments.organization_id, org)),
        )
        .for("update");
      if (!experiment) throw new NotFoundException("Experiment not found");
      const runs = await tx
        .select()
        .from(benchmarks)
        .where(
          and(
            eq(benchmarks.organization_id, org),
            inArray(benchmarks.id, [
              experiment.baseline_benchmark_id,
              experiment.candidate_benchmark_id,
            ]),
          ),
        );
      const baseline = runs.find(
          (x) => x.id === experiment.baseline_benchmark_id,
        ),
        candidate = runs.find(
          (x) => x.id === experiment.candidate_benchmark_id,
        );
      if (
        !baseline?.results ||
        !candidate?.results ||
        baseline.status !== "completed" ||
        candidate.status !== "completed"
      )
        throw new BadRequestException(
          "Both benchmark runs must be completed without errors",
        );
      const b = baseline.results,
        c = candidate.results;
      const keys = [
        "latency_p95_ms",
        "throughput_tokens_per_second",
        "completion_tokens",
        "completed",
      ] as const;
      for (const key of keys) {
        if (
          typeof b[key] !== "number" ||
          !Number.isFinite(b[key]) ||
          typeof c[key] !== "number" ||
          !Number.isFinite(c[key])
        )
          throw new BadRequestException(
            "Benchmark results missing a comparable metric",
          );
      }
      const bLatency = Number(b.latency_p95_ms),
        cLatency = Number(c.latency_p95_ms),
        bThroughput = Number(b.throughput_tokens_per_second),
        cThroughput = Number(c.throughput_tokens_per_second);
      const comparison = {
        baseline_id: baseline.id,
        candidate_id: candidate.id,
        baseline_configuration: baseline.configuration,
        candidate_configuration: candidate.configuration,
        latency_p95_change_percent:
          bLatency > 0 ? ((cLatency - bLatency) / bLatency) * 100 : null,
        throughput_change_percent:
          bThroughput > 0
            ? ((cThroughput - bThroughput) / bThroughput) * 100
            : null,
        compared_at: new Date().toISOString(),
      };
      const [updated] = await tx
        .update(experiments)
        .set({ status: "compared", comparison })
        .where(eq(experiments.id, id))
        .returning();
      await tx.insert(auditEvents).values({
        organization_id: org,
        actor_id: actor,
        action: "experiment.compared",
        resource_type: "experiment",
        resource_id: id,
      });
      return updated;
    });
  }
}
