import { describe, expect, it } from "vitest";
import type { QuotaLease } from "../../../src/modules/quotas/application/services/quota.service";

describe("quota lease contract", () => {
  it("represents a bounded reservation tied to tenant/period", () => {
    const lease: QuotaLease = {
      id: "123",
      organization_id: "org1",
      period: "2026-11",
      reserved_tokens: 300,
    };
    expect(lease.reserved_tokens).toBeGreaterThan(0);
    expect(lease.period).toMatch(/^\d{4}-\d{2}$/);
  });
});
