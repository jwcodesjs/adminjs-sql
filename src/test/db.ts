import knex, { type Knex } from 'knex';
import { getEnv } from "./env.js";
import { getMigrationSource } from "./migration.js";
import type { DatabaseConfig } from "./types.js";

export async function setupDatabase(config: DatabaseConfig, knex: Knex) {
  const migrationSource = getMigrationSource(
    config.schema || config.database,
    config.dialect,
  );

  await knex.migrate.down({
    database: config.database,
    schemaName: config.schema,
    migrationSource,
  });

  await knex.migrate.up({
    database: config.database,
    schemaName: config.schema,
    migrationSource,
  });
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const env = getEnv();

  switch (env.DIALECT) {
    case "mysql":
      return {
        charset: "utf8",
        client: "mysql2",
        database: env.DB_NAME,
        databaseType: "MySQL",
        dialect: env.DIALECT,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        user: env.DB_USER,
      };
    case "mariadb":
      return {
        charset: "utf8",
        client: "mysql2",
        database: env.DB_NAME,
        databaseType: "MariaDB",
        dialect: env.DIALECT,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        user: env.DB_USER,
      };
    case "postgresql":
      return {
        client: "pg",
        database: env.DB_NAME,
        databaseType: "Postgres",
        dialect: env.DIALECT,
        host: env.DB_HOST,
        password: env.DB_PASSWORD,
        port: env.DB_PORT,
        schema: env.DB_SCHEMA,
        user: env.DB_USER,
      };
    default:
      throw new Error(`Unknown database dialect: ${env.DIALECT}`);
  }
};

export const getDatabase = () => {
  const config = getDatabaseConfig();
  return {
    config,
    knex: createKnex(config),
  };
};

export const createKnex = (databaseConfig: DatabaseConfig): Knex =>
  knex({
    client: databaseConfig.client,
    connection: {
      charset: databaseConfig.charset,
      database: databaseConfig.database,
      host: databaseConfig.host,
      password: databaseConfig.password,
      port: databaseConfig.port,
      user: databaseConfig.user,
    },
  });
