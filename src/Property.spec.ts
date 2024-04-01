import { beforeAll, describe, expect, it } from "vitest";

import { Database } from "./Database.js";
import type { Property } from "./Property.js";
import { getDatabaseConfig } from "./test/db.js";
import { getAdapter } from "./test/fixtures.js";

const config = getDatabaseConfig();

describe("Property", () => {
  let database: Database;

  beforeAll(async () => {
    const adapter = getAdapter(config);
    const databaseMetadata = await adapter.init();
    database = new Database(databaseMetadata);
  });

  function getProperty(name: string): Property {
    return database.resource("post").property(name)!;
  }

  describe("#name", () => {
    it("returns a name of the property", () => {
      const property = getProperty("id");

      expect(property?.name()).toEqual("id");
    });
  });

  describe("#path", () => {
    it("returns the path of the property", () => {
      const property = getProperty("title");

      expect(property?.path()).toEqual("title");
    });
  });

  describe("#isId", () => {
    it("returns true for primary key", () => {
      const property = getProperty("id");

      expect(property?.isId()).toEqual(true);
    });

    it("returns false for regular column", () => {
      const property = getProperty("title");

      expect(property?.isId()).toEqual(false);
    });
  });

  describe("#isEditable", () => {
    it("returns false for id field", async () => {
      const property = getProperty("id");

      expect(property?.isEditable()).toEqual(false);
    });

    it("returns true for createdAt and updatedAt fields", async () => {
      const createdAt = getProperty("created_at");
      const updatedAt = getProperty("updated_at");

      expect(createdAt?.isEditable()).toEqual(true);
      expect(updatedAt?.isEditable()).toEqual(true);
    });

    it("returns true for a regular field", async () => {
      const property = getProperty("title");

      expect(property?.isEditable()).toEqual(true);
    });
  });

  describe("#reference", () => {
    it("returns the name of the referenced resource if any", () => {
      const property = getProperty("author_id");

      expect(property?.reference()).toEqual("user");
    });

    it("returns null for regular field", () => {
      const property = getProperty("title");

      expect(property?.reference()).toEqual(null);
    });
  });

  describe("#availableValues", () => {
    it("returns null for regular field", () => {
      const property = getProperty("title");

      expect(property?.availableValues()).toEqual(null);
    });

    it('returns available values when enum is given', () => {
      const property = getProperty('status');

      expect(property?.isEnum()).toBe(true);
      expect(property?.availableValues()).toEqual(['ACTIVE', 'INACTIVE']);
    });
  });

  describe("#type", () => {
    it("returns mixed type for an jsonb property", () => {
      const property = getProperty("some_json");

      expect(property?.type()).toEqual("key-value");
    });
  });
});
