import { describe, expect, it } from "vitest";
import { requestModelImportDto } from "../../../src/modules/model-imports/presentation/http/dto/request-model-import.request.dto";

describe("model import input boundaries", () => {
  it("accepts only repository IDs, not unrestricted source URLs", () =>
    expect(requestModelImportDto.parse({ repository_id: "org/repo" })).toEqual({
      repository_id: "org/repo",
    }));
  it("rejects SSRF-shaped source and shell/metacharacters", () => {
    for (const repository_id of [
      "https://localhost:8000/file",
      "../tmp",
      "org/repo;rm -rf /",
      "org/repo/subdir",
      "org\\repo",
      "",
    ])
      expect(requestModelImportDto.safeParse({ repository_id }).success).toBe(
        false,
      );
  });
});
