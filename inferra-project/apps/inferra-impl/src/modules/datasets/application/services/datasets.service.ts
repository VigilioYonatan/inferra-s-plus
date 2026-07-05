import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { artifacts, auditEvents, datasets } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type {
  CreateDatasetRequestDto,
  UpdateDatasetRequestDto,
} from "../../presentation/http/dto/create-dataset.request.dto";
@Injectable()
export class DatasetsService {
  constructor(
    private readonly query: QueryService,
    private readonly organizationsService: OrganizationsService,
  ) {}
  async listDatasets(actor_id: string, organization_id: string) {
    await this.organizationsService.requireMembership(
      actor_id,
      organization_id,
      "analyst",
    );
    return this.query.db
      .select()
      .from(datasets)
      .where(
        and(
          eq(datasets.organization_id, organization_id),
          isNull(datasets.deleted_at),
        ),
      )
      .orderBy(desc(datasets.created_at))
      .limit(100);
  }
  async getDataset(
    actor_id: string,
    organization_id: string,
    dataset_id: string,
  ) {
    await this.organizationsService.requireMembership(
      actor_id,
      organization_id,
      "analyst",
    );
    const [row] = await this.query.db
      .select()
      .from(datasets)
      .where(
        and(
          eq(datasets.id, dataset_id),
          eq(datasets.organization_id, organization_id),
          isNull(datasets.deleted_at),
        ),
      );
    if (!row) throw new NotFoundException("Dataset not found");
    return row;
  }
  async createDataset(
    actor_id: string,
    organization_id: string,
    input: CreateDatasetRequestDto,
  ) {
    await this.organizationsService.requireMembership(
      actor_id,
      organization_id,
      "developer",
    );
    return this.query.db.transaction(async (tx) => {
      if (input.artifact_id) {
        const [owned] = await tx
          .select({ id: artifacts.id })
          .from(artifacts)
          .where(
            and(
              eq(artifacts.id, input.artifact_id),
              eq(artifacts.organization_id, organization_id),
              isNull(artifacts.deleted_at),
            ),
          );
        if (!owned) throw new NotFoundException("Artifact not found");
      }
      const [existing] = await tx
        .select({ id: datasets.id })
        .from(datasets)
        .where(
          and(
            eq(datasets.organization_id, organization_id),
            eq(datasets.name, input.name),
          ),
        );
      if (existing) throw new ConflictException("Dataset name already exists");
      const [row] = await tx
        .insert(datasets)
        .values({ organization_id, created_by: actor_id, ...input })
        .returning();
      if (!row) throw new Error("Dataset insert failed");
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id,
        action: "dataset.created",
        resource_type: "dataset",
        resource_id: row.id,
      });
      return row;
    });
  }
  async updateDataset(
    actor_id: string,
    organization_id: string,
    id: string,
    input: UpdateDatasetRequestDto,
  ) {
    await this.organizationsService.requireMembership(
      actor_id,
      organization_id,
      "developer",
    );
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(datasets)
        .set(input)
        .where(
          and(
            eq(datasets.id, id),
            eq(datasets.organization_id, organization_id),
            isNull(datasets.deleted_at),
          ),
        )
        .returning();
      if (!row) throw new NotFoundException("Dataset not found");
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id,
        action: "dataset.updated",
        resource_type: "dataset",
        resource_id: id,
      });
      return row;
    });
  }
  async removeDataset(actor_id: string, organization_id: string, id: string) {
    await this.organizationsService.requireMembership(
      actor_id,
      organization_id,
      "operator",
    );
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(datasets)
        .set({ deleted_at: new Date() })
        .where(
          and(
            eq(datasets.id, id),
            eq(datasets.organization_id, organization_id),
            isNull(datasets.deleted_at),
          ),
        )
        .returning({ id: datasets.id });
      if (!row) throw new NotFoundException("Dataset not found");
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id,
        action: "dataset.deleted",
        resource_type: "dataset",
        resource_id: id,
      });
      return { ok: true };
    });
  }
}
