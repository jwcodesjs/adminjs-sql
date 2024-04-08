import { beforeAll, describe, expect, it } from "vitest";
import { Database } from "./Database.js";
import { getDatabaseConfig } from "./test/db.js";
import { getAdapter } from "./test/fixtures.js";
describe("Database", () => {
    let databaseMetadata;
    beforeAll(async () => {
        const config = getDatabaseConfig();
        const adapter = getAdapter(config);
        databaseMetadata = await adapter.init();
    });
    describe(".isAdapterFor", () => {
        it("returns true when Prisma is properly initialized", async () => {
            expect(Database.isAdapterFor(databaseMetadata)).toBe(true);
        });
    });
    describe("#resources", () => {
        it("returns all entities", async () => {
            // user, post, profile
            expect(new Database(databaseMetadata).resources()).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=Database.spec.js.map