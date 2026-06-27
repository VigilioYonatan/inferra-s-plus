import {
  Controller,
  Get,
  Header,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { sql } from "drizzle-orm";
import { QueryService } from "../../../../../shared/data/query";
import { register } from "../../../../../shared/observability/metrics";
@Controller()
export class HealthController {
  constructor(@Inject(QueryService) private readonly query: QueryService) {}
  @Get("health/live") live() {
    return { status: "ok" };
  }
  @Get("health/ready") async ready() {
    try {
      await this.query.db.execute(sql`select 1`);
      return { status: "ready" };
    } catch (err) {
      console.error("Health ready check failed:", err);
      throw new ServiceUnavailableException("Database unavailable");
    }
  }
  @Get("internal/metrics")
  @Header("Content-Type", "text/plain; version=0.0.4")
  metrics() {
    return register.metrics();
  }
  @Get("api/v1/system/capabilities") capabilities() {
    return {
      version: "0.1.0",
      inference: true,
      providers: {
        google: Boolean(process.env.GOOGLE_CLIENT_ID),
        facebook: Boolean(process.env.FACEBOOK_CLIENT_ID),
        email: Boolean(process.env.SMTP_URL),
      },
    };
  }
}
