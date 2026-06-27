import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { env } from "../../../../config/env.schema";
import { OrganizationsService } from "../../../organizations/application/services/organizations.service";
import { parseDcgm } from "../../domain/services/dcgm.parser";
@Injectable()
export class GpuNodesService {
  constructor(private readonly orgs: OrganizationsService) {}
  async list(actor: string, org: string) {
    await this.orgs.requireMembership(actor, org, "analyst");
    let response: Response;
    try {
      response = await fetch(env.DCGM_METRICS_URL, {
        signal: AbortSignal.timeout(3000),
      });
    } catch {
      throw new ServiceUnavailableException("GPU exporter not reachable");
    }
    if (!response.ok)
      throw new ServiceUnavailableException("GPU exporter unavailable");
    const body = await response.text();
    if (body.length > 5_000_000)
      throw new ServiceUnavailableException("GPU metric payload too large");
    return parseDcgm(body);
  }
  async get(actor: string, org: string, gpu: string) {
    const all = await this.list(actor, org);
    return all.find((x) => x.gpu === gpu) ?? null;
  }
}
