import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(_req: Request, res: Response, next: NextFunction) {
    res.setHeader("X-Request-Id", randomUUID());
    next();
  }
}
