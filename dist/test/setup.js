import { getDatabase, setupDatabase } from "./db.js";
import { getEnv, logEnv } from "./env.js";
export async function setup() {
    logEnv(getEnv());
    const { knex, config } = getDatabase();
    try {
        await setupDatabase(config, knex);
        await knex.destroy();
    }
    catch (error) {
        console.error("Failed setting up the database", error);
        process.exit(1);
    }
}
//# sourceMappingURL=setup.js.map