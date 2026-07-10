import { describe, expect, it, vi } from "vitest";
import { QuotaService } from "../../../src/modules/quotas/application/services/quota.service";
import { TooManyRequestsException } from "../../../src/shared/http/exceptions";

describe("QuotaService", () => {
  it("rejects non-positive or overly large token reservations immediately", async () => {
    const queryMock: any = { db: {} };
    const service = new QuotaService(queryMock);

    await expect(service.reserve("org-uuid", 0)).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
    await expect(service.reserve("org-uuid", -50)).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
    await expect(service.reserve("org-uuid", 2_000_000)).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
    await expect(service.reserve("org-uuid", 1.5)).rejects.toBeInstanceOf(
      TooManyRequestsException,
    );
  });

  it("settles usage by executing transaction and updating buckets", async () => {
    const executeMock = vi.fn().mockResolvedValue({
      rows: [{ reserved_tokens: "1000", period: "2026-11" }],
    });
    const txMock: any = { execute: executeMock };
    const queryMock: any = {
      db: {
        transaction: async (cb: any) => cb(txMock),
      },
    };

    const service = new QuotaService(queryMock);
    const settled = await service.settle(
      {
        id: "lease-123",
        organization_id: "org-1",
        period: "2026-11",
        reserved_tokens: 1000,
      },
      850,
    );

    expect(settled).toBe(true);
    expect(executeMock).toHaveBeenCalledTimes(2);
  });
});
