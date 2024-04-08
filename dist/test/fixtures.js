import crypto from "node:crypto";
import { Adapter } from "../Adapter.js";
export const buildUser = () => ({
    id: crypto.randomInt(1000, 9000),
    name: `Someone ${crypto.randomInt(1000, 9000)}`,
    email: `random-${crypto.randomUUID()}@email.com`,
});
export const buildProfile = (user) => ({
    bio: "Example",
    name: "John Doe",
    user_id: user.id,
    id: crypto.randomUUID(),
});
export const buildPost = (user) => ({
    id: crypto.randomInt(1000, 9000),
    title: "Example",
    content: "Example content",
    some_json: { key: "value" },
    status: "ACTIVE",
    author_id: user.id,
    published: false,
});
export const getAdapter = (config) => {
    const connection = {
        charset: config.charset,
        database: config.database,
        host: config.host,
        password: config.password,
        port: config.port,
        user: config.user,
    };
    if (config.dialect === "postgresql") {
        connection.schema = config.schema;
    }
    return new Adapter(config.dialect, connection, {
        ignoredTables: ["knex_migrations", "knex_migrations_lock"],
    });
};
//# sourceMappingURL=fixtures.js.map