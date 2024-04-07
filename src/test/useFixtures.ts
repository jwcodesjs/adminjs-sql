import { type BaseRecord, Filter } from "adminjs";
import type { Database } from "../Database.js";
import type { Resource } from "../Resource.js";
import { buildUser } from "./fixtures.js";
import type { Post, Profile, User } from "./types.js";

export function useFixtures() {
  let database: Database;

  const fixtures = {
    async createUser() {
      const user = await database.resource("user").create(buildUser());
      return user;
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
