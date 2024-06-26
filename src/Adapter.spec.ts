import { beforeEach, describe, expect, it } from "vitest";

import type { Adapter } from "./Adapter.js";
import { DatabaseMetadata } from "./metadata/DatabaseMetadata.js";
import { getDatabaseConfig } from "./test/db.js";
import { getAdapter } from "./test/fixtures.js";

describe("Adapter", () => {
  let adapter: Adapter;

  beforeEach(() => {
    const config = getDatabaseConfig();
    adapter = getAdapter(config);
  });

  describe("#init", () => {
    it("should initialize and return database metadata", async () => {
      const databaseMetadata = await adapter.init();

      expect(databaseMetadata).toBeInstanceOf(DatabaseMetadata);
    });
  });
});
