import { createHash, randomUUID } from "node:crypto";
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { Client } from "minio";
import { env } from "../../../../config/env.schema";
import { artifacts, auditEvents } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";

const allowed = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
  "text/csv",
  "application/json",
]);
const MAX_BYTES = 20 * 1024 * 1024;
function verifySignature(bytes: Buffer, mime: string) {
  if (
    mime === "application/pdf" &&
    !bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))
  )
    return false;
  if (
    mime === "image/png" &&
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    return false;
  if (
    mime === "image/jpeg" &&
    !(bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
  )
    return false;
  return true;
}
@Injectable()
export class ArtifactsService {
  private readonly client: Client | null;
  constructor(
    private readonly query: QueryService,
    private readonly orgs: OrganizationsService,
  ) {
    if (env.RUSTFS_ENDPOINT && env.RUSTFS_ACCESS_KEY && env.RUSTFS_SECRET_KEY) {
      const url = new URL(env.RUSTFS_ENDPOINT);
      if (url.protocol !== "http:" && url.protocol !== "https:")
        throw new Error("Invalid RustFS protocol");
      this.client = new Client({
        endPoint: url.hostname,
        port: Number(url.port || (url.protocol === "https:" ? "443" : "80")),
        useSSL: url.protocol === "https:",
        accessKey: env.RUSTFS_ACCESS_KEY,
        secretKey: env.RUSTFS_SECRET_KEY,
      });
    } else this.client = null;
  }
  private storage() {
    if (!this.client)
      throw new ServiceUnavailableException("RustFS storage not configured");
    return this.client;
  }
  private async ensureBucket() {
    const client = this.storage();
    if (!(await client.bucketExists(env.RUSTFS_BUCKET))) {
      try {
        await client.makeBucket(env.RUSTFS_BUCKET);
      } catch (err) {
        if (!(await client.bucketExists(env.RUSTFS_BUCKET))) throw err;
      }
    }
  }
  async upload(
    user_id: string,
    organization_id: string,
    file: Express.Multer.File | undefined,
  ) {
    await this.orgs.requireMembership(user_id, organization_id, "developer");
    if (!file?.buffer?.length)
      throw new BadRequestException("File is required");
    if (
      file.size > MAX_BYTES ||
      !allowed.has(file.mimetype) ||
      !verifySignature(file.buffer, file.mimetype)
    )
      throw new BadRequestException(
        "Unsupported file type, signature, or size",
      );
    await this.ensureBucket();
    const client = this.storage();
    const original_name = (file.originalname || "artifact")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 140);
    const object_key = `${organization_id}/${randomUUID()}`;
    const checksum = createHash("sha256").update(file.buffer).digest("hex");
    await client.putObject(
      env.RUSTFS_BUCKET,
      object_key,
      file.buffer,
      file.size,
      { "Content-Type": file.mimetype },
    );
    try {
      return await this.query.db.transaction(async (tx) => {
        const [row] = await tx
          .insert(artifacts)
          .values({
            organization_id,
            uploaded_by: user_id,
            original_name,
            object_key,
            content_type: file.mimetype,
            file_size: file.size,
            sha256: checksum,
          })
          .returning({
            id: artifacts.id,
            original_name: artifacts.original_name,
            content_type: artifacts.content_type,
            file_size: artifacts.file_size,
            sha256: artifacts.sha256,
            created_at: artifacts.created_at,
          });
        if (!row) throw new BadRequestException("Failed to persist artifact");
        await tx.insert(auditEvents).values({
          organization_id,
          actor_id: user_id,
          action: "artifact.upload",
          resource_type: "artifact",
          resource_id: row.id,
          metadata: { size: file.size, sha256: checksum },
        });
        return row;
      });
    } catch (err) {
      await client.removeObject(env.RUSTFS_BUCKET, object_key).catch(() => {});
      throw err;
    }
  }
  async list(user_id: string, organization_id: string) {
    await this.orgs.requireMembership(user_id, organization_id);
    return this.query.db
      .select({
        id: artifacts.id,
        original_name: artifacts.original_name,
        content_type: artifacts.content_type,
        file_size: artifacts.file_size,
        sha256: artifacts.sha256,
        created_at: artifacts.created_at,
      })
      .from(artifacts)
      .where(
        and(
          eq(artifacts.organization_id, organization_id),
          isNull(artifacts.deleted_at),
        ),
      )
      .orderBy(desc(artifacts.created_at))
      .limit(100);
  }
  async get(user_id: string, organization_id: string, artifact_id: string) {
    await this.orgs.requireMembership(user_id, organization_id);
    const [row] = await this.query.db
      .select({
        id: artifacts.id,
        original_name: artifacts.original_name,
        content_type: artifacts.content_type,
        file_size: artifacts.file_size,
        sha256: artifacts.sha256,
        created_at: artifacts.created_at,
      })
      .from(artifacts)
      .where(
        and(
          eq(artifacts.organization_id, organization_id),
          eq(artifacts.id, artifact_id),
          isNull(artifacts.deleted_at),
        ),
      )
      .limit(1);
    if (!row) throw new NotFoundException("Artifact not found");
    return row;
  }
  async download(
    user_id: string,
    organization_id: string,
    artifact_id: string,
  ) {
    await this.orgs.requireMembership(user_id, organization_id);
    const [row] = await this.query.db
      .select()
      .from(artifacts)
      .where(
        and(
          eq(artifacts.organization_id, organization_id),
          eq(artifacts.id, artifact_id),
          isNull(artifacts.deleted_at),
        ),
      )
      .limit(1);
    if (!row) throw new NotFoundException("Artifact not found");
    const stream = await this.storage().getObject(
      env.RUSTFS_BUCKET,
      row.object_key,
    );
    return {
      stream,
      original_name: row.original_name,
      content_type: row.content_type,
      file_size: row.file_size,
    };
  }
  async remove(user_id: string, organization_id: string, artifact_id: string) {
    await this.orgs.requireMembership(user_id, organization_id, "admin");
    return this.query.db.transaction(async (tx) => {
      const [row] = await tx
        .update(artifacts)
        .set({ deleted_at: new Date() })
        .where(
          and(
            eq(artifacts.organization_id, organization_id),
            eq(artifacts.id, artifact_id),
            isNull(artifacts.deleted_at),
          ),
        )
        .returning();
      if (!row) throw new NotFoundException("Artifact not found");
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id: user_id,
        action: "artifact.delete",
        resource_type: "artifact",
        resource_id: artifact_id,
        metadata: { object_key: row.object_key },
      });
      return { ok: true };
    });
  }
}
