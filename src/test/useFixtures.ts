import { type BaseRecord, Filter } from "adminjs";
import { beforeAll } from "vitest";
import { Database } from "../Database.js";
import type { Resource } from "../Resource.js";
import { getDatabaseConfig } from "./db.js";
import { buildUser, getAdapter } from "./fixtures.js";
import type { Post, Profile, User } from "./types.js";

export function useFixtures() {
  let database: Database;

  beforeAll(async () => {
    const adapter = getAdapter(getDatabaseConfig());
    const databaseMetadata = await adapter.init();
    database = new Database(databaseMetadata);
  });

  const fixtures = {
    async createUser() {
      const user = await database.resource("user").create(buildUser());
      return user as Required<User>;
    },
    async findMany<T = User | Profile | Post>(
      resource: Resource,
      filterParams: Partial<T>,
    ): Promise<BaseRecord[]> {
      const filter = new Filter({ ...filterParams }, resource);
      return await resource.find(filter);
    },
    async findOne<T = User | Profile | Post>(
      resource: Resource,
      filter: Partial<T>,
    ): Promise<BaseRecord> {
      const records = await fixtures.findMany(resource, filter);
      return records[0];
    },
  };

  return fixtures;
}
