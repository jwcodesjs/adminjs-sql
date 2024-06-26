import type { Knex } from "knex";

import type { DatabaseDialect } from "../dialects/index.js";

export const isMySqlDialect = (dialect: DatabaseDialect) =>
  ["mysql", "mariadb"].includes(dialect);

const getMigration = (
  schema: string,
  dialect: DatabaseDialect,
): Knex.Migration & { id: string } => ({
  async up(knex: Knex) {
    let upQuery = knex.schema;

    if (dialect === "postgresql") {
      upQuery = upQuery.raw(
        "CREATE TYPE public.status_enum AS ENUM ('active-status-enum', 'inactive-status-enum');",
      );
    }

    return upQuery
      .withSchema(schema)
      .createTable("user", (table) => {
        table.increments("id").notNullable();
        table.string("email", 255).notNullable();
        table.string("name", 255).notNullable();
      })
      .createTable("profile", (table) => {
        if (dialect === "postgresql") {
          table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
          table
            .integer("user_id")
            .notNullable()
            .references("id")
            .inTable(`${schema}.user`);
        } else if (isMySqlDialect(dialect)) {
          table.uuid("id").primary().defaultTo(knex.raw("(uuid())"));
          table
            .integer("user_id")
            .unsigned()
            .notNullable()
            .references("user.id");
        }

        table.text("bio").notNullable();
        table.text("name").notNullable();
      })
      .createTable("post", (table) => {
        table.increments("id").notNullable();
        table.dateTime("created_at").notNullable().defaultTo(knex.fn.now());
        table.dateTime("updated_at").notNullable().defaultTo(knex.fn.now());
        table.json("some_json");

        if (isMySqlDialect(dialect)) {
          table.check("JSON_VALID(some_json)");
        }

        table
          .enum("status", ["ACTIVE", "INACTIVE"], {
            useNative: true,
            enumName: "status_enum",
            schemaName: schema,
          })
          .notNullable();
        table.text("content").notNullable();
        table.string("title", 255).notNullable();
        table.boolean("published").notNullable().defaultTo(false);

        if (dialect === "postgresql") {
          table
            .integer("author_id")
            .notNullable()
            .references("id")
            .inTable(`${schema}.user`);
        } else if (isMySqlDialect(dialect)) {
          table
            .integer("author_id")
            .unsigned()
            .notNullable()
            .references("user.id");
        }
      });
  },
  async down(knex: Knex) {
    let downQuery = knex.schema
      .withSchema(schema)
      .dropTableIfExists("post")
      .dropTableIfExists("profile")
      .dropTableIfExists("user");

    if (dialect === "postgresql") {
      downQuery = downQuery.raw("DROP TYPE IF EXISTS public.status_enum");
      downQuery = downQuery.raw(`DROP TYPE IF EXISTS ${schema}.status_enum`);
    }

    return downQuery;
  },
  id: "initialize",
});

export const getMigrationSource = (
  schema: string,
  dialect: DatabaseDialect,
): Knex.MigrationSource<any> => {
  const migration = getMigration(schema, dialect);
  return {
    getMigration: async () => migration,
    getMigrationName: (migration: string) => migration,
    getMigrations: async () => [migration.id],
  };
};
