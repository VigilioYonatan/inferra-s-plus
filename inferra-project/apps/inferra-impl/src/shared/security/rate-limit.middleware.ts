import {
  Injectable,
  type NestMiddleware,
  ServiceUnavailableException,
} from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import Redis from "ioredis";
import { env } from "../../config/env.schema";
import { TooManyRequestsException } from "../http/exceptions";
import { digest } from "./crypto";
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly redis = new Redis(env.VALKEY_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    connectTimeout: 2000,
  });
  constructor() {
    this.redis.on("error", (err) => {
      // Handled gracefully so Redis connection drops do not crash the Node process
    });
  }
  async use(req: Request, _res: Response, next: NextFunction) {
    if (
      !req.path.startsWith("/api/v1/auth") ||
      ["GET", "HEAD", "OPTIONS"].includes(req.method)
    ) {
      next();
      return;
    }
    const rawClientIp =
      req.ip ||
      (typeof req.headers["x-forwarded-for"] === "string"
        ? req.headers["x-forwarded-for"].split(",")[0]?.trim()
        : undefined) ||
      req.socket.remoteAddress ||
      "gateway";
    const clientIp = rawClientIp.replace(/^::ffff:/, "");
    const prefix = `authlimit:${digest(clientIp, "ip").slice(0, 24)}`;
    const body = (req.body ?? {}) as { email?: unknown };
    const email =
      typeof body.email === "string"
        ? body.email.toLowerCase().slice(0, 254)
        : "";
    const keys = [`${prefix}:${Math.floor(Date.now() / 60000)}`];
    if (email)
      keys.push(
        `email:${digest(email, "rate").slice(0, 32)}:${Math.floor(Date.now() / 60000)}`,
      );
    try {
      for (const [i, key] of keys.entries()) {
        const total = await this.redis.incr(key);
        if (total === 1) await this.redis.expire(key, 65);
        if (total > (i === 0 ? 300 : 10))
          throw new TooManyRequestsException(
            "Too many authentication attempts",
          );
      }
    } catch (err) {
      if (err instanceof TooManyRequestsException) throw err;
      throw new ServiceUnavailableException(
        "Authentication protection unavailable",
      );
    }
    next();
  }
}
