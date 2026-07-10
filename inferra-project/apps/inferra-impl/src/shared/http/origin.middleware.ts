import {
  ForbiddenException,
  Injectable,
  type NestMiddleware,
} from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env.schema";
@Injectable()
export class OriginMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const method = req.method.toUpperCase();
    const needs_origin =
      !["GET", "HEAD", "OPTIONS"].includes(method) &&
      !req.path.startsWith("/v1/") &&
      !req.path.startsWith("/internal/");
    if (needs_origin) {
      if (req.headers.origin !== env.APP_ORIGIN)
        throw new ForbiddenException("Invalid request origin");
    }
    next();
  }
}
