import {
  Injectable,
  type LoggerService,
  type NestMiddleware,
} from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  redact: {
    paths: [
      "password",
      "token",
      "access_token",
      "refresh_token",
      "authorization",
      "cookie",
      "req.headers",
      "headers",
    ],
    censor: "[REDACTED]",
  },
});
@Injectable()
export class StructuredLogger implements LoggerService {
  log(message: unknown, context?: string) {
    logger.info({ context }, String(message));
  }
  warn(message: unknown, context?: string) {
    logger.warn({ context }, String(message));
  }
  error(message: unknown, _trace?: string, context?: string) {
    logger.error({ context }, String(message));
  }
  debug(message: unknown, context?: string) {
    logger.debug({ context }, String(message));
  }
  verbose(message: unknown, context?: string) {
    logger.trace({ context }, String(message));
  }
}
@Injectable()
export class HttpLogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();
    res.once("finish", () => {
      logger.info(
        {
          request_id:
            res.getHeader("x-request-id") ||
            res.getHeader("X-Request-Id") ||
            (req as any).requestId ||
            req.headers["x-request-id"],
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration_ms: Math.round(performance.now() - start),
        },
        "request",
      );
    });
    next();
  }
}
