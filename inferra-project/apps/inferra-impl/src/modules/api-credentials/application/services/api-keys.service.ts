import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { and, desc, eq, isNull } from "drizzle-orm";
import { apiKeys, auditEvents } from "../../../../database/schema";
import { QueryService } from "../../../../shared/data/query";
import {
  digest,
  equalDigest,
  secureToken,
} from "../../../../shared/security/crypto";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import type { CreateApiKeyRequestDto } from "../../presentation/http/dto/create-api-key.request.dto";
@Injectable()
export class ApiKeysService {
  constructor(
    private readonly query: QueryService,
    private readonly organizationsService: OrganizationsService,
  ) {}
  async listApiKeys(user_id: string, organization_id: string) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "admin",
    );
    return this.query.db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        token_prefix: apiKeys.token_prefix,
        scopes: apiKeys.scopes,
        created_at: apiKeys.created_at,
        revoked_at: apiKeys.revoked_at,
      })
      .from(apiKeys)
      .where(eq(apiKeys.organization_id, organization_id))
      .orderBy(desc(apiKeys.created_at));
  }
  async getApiKey(user_id: string, organization_id: string, key_id: string) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "admin",
    );
    const [row] = await this.query.db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        token_prefix: apiKeys.token_prefix,
        scopes: apiKeys.scopes,
        created_at: apiKeys.created_at,
        revoked_at: apiKeys.revoked_at,
      })
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.id, key_id),
          eq(apiKeys.organization_id, organization_id),
        ),
      );
    if (!row) throw new NotFoundException("API key not found");
    return row;
  }
  async createApiKey(
    user_id: string,
    organization_id: string,
    input: CreateApiKeyRequestDto,
  ) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "admin",
    );
    const token = `inf_${secureToken(32)}`;
    const token_prefix = token.slice(0, 16);
    const [row] = await this.query.db
      .insert(apiKeys)
      .values({
        organization_id,
        name: input.name,
        token_prefix,
        token_hash: digest(token, "apikey"),
        created_by: user_id,
        scopes: input.scopes,
      })
      .returning({
        id: apiKeys.id,
        name: apiKeys.name,
        token_prefix: apiKeys.token_prefix,
      });
    await this.query.db.insert(auditEvents).values({
      organization_id,
      actor_id: user_id,
      action: "api_key.created",
      resource_type: "api_key",
      resource_id: row?.id,
    });
    return { ...row, token };
  }
  /** Atomically rotates the secret without leaking the old token, returning the new secret once. */
  async rotateApiKey(user_id: string, organization_id: string, key_id: string) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "admin",
    );
    const token = `inf_${secureToken(32)}`;
    const [row] = await this.query.db.transaction(async (tx) => {
      const rows = await tx
        .update(apiKeys)
        .set({
          token_prefix: token.slice(0, 16),
          token_hash: digest(token, "apikey"),
        })
        .where(
          and(
            eq(apiKeys.id, key_id),
            eq(apiKeys.organization_id, organization_id),
            isNull(apiKeys.revoked_at),
          ),
        )
        .returning({
          id: apiKeys.id,
          name: apiKeys.name,
          token_prefix: apiKeys.token_prefix,
        });
      if (!rows.length) throw new NotFoundException("Active key not found");
      await tx.insert(auditEvents).values({
        organization_id,
        actor_id: user_id,
        action: "api_key.rotated",
        resource_type: "api_key",
        resource_id: key_id,
      });
      return rows;
    });
    return { ...row, token };
  }
  async revokeApiKey(user_id: string, organization_id: string, key_id: string) {
    await this.organizationsService.requireMembership(
      user_id,
      organization_id,
      "admin",
    );
    const rows = await this.query.db
      .update(apiKeys)
      .set({ revoked_at: new Date() })
      .where(
        and(
          eq(apiKeys.id, key_id),
          eq(apiKeys.organization_id, organization_id),
        ),
      )
      .returning({ id: apiKeys.id });
    if (!rows.length) throw new NotFoundException("Key not found");
    return { ok: true };
  }
  async authenticateKey(header: string | undefined) {
    if (!header?.startsWith("Bearer inf_"))
      throw new UnauthorizedException("API key required");
    const token = header.slice(7);
    if (token.length > 128) throw new UnauthorizedException("Invalid key");
    const [row] = await this.query.db
      .select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.token_prefix, token.slice(0, 16)),
          isNull(apiKeys.revoked_at),
        ),
      )
      .limit(1);
    if (!row || !equalDigest(row.token_hash, digest(token, "apikey")))
      throw new UnauthorizedException("Invalid key");
    if (!row.scopes.includes("inference:invoke"))
      throw new UnauthorizedException("Missing scope");
    return { organization_id: row.organization_id, key_id: row.id };
  }
}
