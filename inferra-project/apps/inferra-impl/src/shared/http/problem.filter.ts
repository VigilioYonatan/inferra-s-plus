import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";
@Catch()
export class ProblemFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const req = host.switchToHttp().getRequest<Request>();
    const res = host.switchToHttp().getResponse<Response>();
    const code =
      error instanceof HttpException
        ? error.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const body =
      error instanceof HttpException
        ? error.getResponse()
        : "Internal Server Error";
    const detail =
      typeof body === "string"
        ? body
        : typeof body === "object" &&
            body !== null &&
            "message" in body &&
            typeof (body as { message?: unknown }).message === "string"
          ? (body as { message: string }).message
          : "Request rejected";
    if (code >= 500) {
      console.error("Unhandled exception in ProblemFilter:", error);
    }
    if (res.headersSent) return;

    if (req.url.startsWith("/v1/")) {
      res.status(code).json({
        error: {
          message: detail,
          type: code >= 500 ? "server_error" : "invalid_request_error",
          param: null,
          code: code === HttpStatus.UNAUTHORIZED ? "invalid_api_key" : null,
        },
      });
      return;
    }

    res
      .status(code)
      .type("application/problem+json")
      .json({
        type: "about:blank",
        title: code >= 500 ? "Internal error" : detail,
        status: code,
        instance: req.path,
        request_id: res.getHeader("x-request-id") || undefined,
      });
  }
}
