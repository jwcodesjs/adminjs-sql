import { Filter } from "adminjs";
import { beforeAll } from "vitest";
import { Database } from "../Database.js";
import { getDatabaseConfig } from "./db.js";
import { buildUser, getAdapter } from "./fixtures.js";
export function useFixtures() {
    let database;
    beforeAll(async () => {
        const adapter = getAdapter(getDatabaseConfig());
        const databaseMetadata = await adapter.init();
        database = new Database(databaseMetadata);
    });
    const fixtures = {
        async createUser() {
            const user = await database.resource("user").create(buildUser());
            return user;
        },
        async findMany(resource, filterParams) {
            const filter = new Filter({ ...filterParams }, resource);
            return await resource.find(filter);
        },
        async findOne(resource, filter) {
            const records = await fixtures.findMany(resource, filter);
            return records[0];
        },
    };
    return fixtures;
}
//# sourceMappingURL=useFixtures.js.map