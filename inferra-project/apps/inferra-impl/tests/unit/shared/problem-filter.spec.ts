import {
  BadRequestException,
  HttpStatus,
  UnauthorizedException,
} from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { ProblemFilter } from "../../../src/shared/http/problem.filter";

describe("ProblemFilter", () => {
  it("formats OpenAI compatible error when request path starts with /v1/", () => {
    const filter = new ProblemFilter();
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const hostMock: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          url: "/v1/chat/completions",
          path: "/v1/chat/completions",
        }),
        getResponse: () => ({
          status: statusMock,
          headersSent: false,
          getHeader: () => "test-req-123",
        }),
      }),
    };

    filter.catch(
      new UnauthorizedException("Invalid API key provided"),
      hostMock,
    );

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith({
      error: {
        message: "Invalid API key provided",
        type: "invalid_request_error",
        param: null,
        code: "invalid_api_key",
      },
    });
  });

  it("formats RFC 7807 Problem Details for regular /api/ routes", () => {
    const filter = new ProblemFilter();
    const jsonMock = vi.fn();
    const typeMock = vi.fn().mockReturnValue({ json: jsonMock });
    const statusMock = vi.fn().mockReturnValue({ type: typeMock });

    const hostMock: any = {
      switchToHttp: () => ({
        getRequest: () => ({ url: "/api/v1/models", path: "/api/v1/models" }),
        getResponse: () => ({
          status: statusMock,
          headersSent: false,
          getHeader: (h: string) =>
            h.toLowerCase() === "x-request-id" ? "req-456" : undefined,
        }),
      }),
    };

    filter.catch(new BadRequestException("Missing required query"), hostMock);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(typeMock).toHaveBeenCalledWith("application/problem+json");
    expect(jsonMock).toHaveBeenCalledWith({
      type: "about:blank",
      title: "Missing required query",
      status: HttpStatus.BAD_REQUEST,
      instance: "/api/v1/models",
      request_id: "req-456",
    });
  });
});
