import { Test } from "@nestjs/testing";
import { describe, expect, it } from "vitest";
import { AppModule } from "../../src/app.module";

describe("AppModule DI graph", () => {
  it("compiles AppModule DI without missing dependencies", async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    expect(moduleRef).toBeDefined();
    await moduleRef.close();
  });
});
