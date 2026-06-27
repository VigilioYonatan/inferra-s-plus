import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import pino from "pino";

const logger = pino({ name: "internal-alerts" });

@Controller("internal/alerts")
export class InternalAlertsController {
  @Post("webhook")
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Body() payload: Record<string, unknown>) {
    logger.warn(
      { alertmanager: payload },
      "Alertmanager webhook notification received",
    );
    return {
      status: "received",
      alerts_count: Array.isArray(payload.alerts) ? payload.alerts.length : 0,
      timestamp: new Date().toISOString(),
    };
  }
}
