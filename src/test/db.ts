import { fileURLToPath } from 'url';
import path from 'path';

import knex, { type Knex } from 'knex';
import { SupportedDatabasesType } from 'adminjs';
import { configDotenv } from 'dotenv';

import { DatabaseDialect } from '../dialects/types/index.js';
import { Adapter } from '../Adapter.js';

import { getMigrationSource } from './migration.js';

type DatabaseConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    dialect: DatabaseDialect
    databaseType: SupportedDatabasesType
    schema: string;
    client: 'pg' | 'mysql2'
}

export async function setupDatabase(config: DatabaseConfig, knex: Knex) {
  const migrationSource = getMigrationSource(config.schema, config.dialect);

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

type Env = {
  DIALECT: DatabaseDialect
  MYSQL_DATABASE: string
  MYSQL_DEFAULT_USER: string
  MYSQL_HOST: string
  MYSQL_PASSWORD: string
  MYSQL_ROOT_PASSWORD: string
  POSTGRES_DB: string
  POSTGRES_HOST: string
  POSTGRES_PASSWORD: string
  POSTGRES_USER: string
}

const getEnv = (): Env => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const config = configDotenv({
    path: [path.join(__dirname, '../../.env')],
  });

  return {
    DIALECT: 'mysql',
    ...process.env,
    ...config.parsed,
  } as Env;
};

export const getDatabaseConfig = (): DatabaseConfig => {
  const env = getEnv();
  switch (env.DIALECT) {
  case 'postgresql':
    return {
      client: 'pg',
      database: env.POSTGRES_DB,
      databaseType: 'Postgres',
      dialect: 'postgresql',
      host: env.POSTGRES_HOST,
      password: env.POSTGRES_PASSWORD,
      port: 5432,
      schema: 'public',
      user: env.POSTGRES_USER,
    };
  case 'mysql2':
  case 'mysql':
    return {
      client: 'mysql2',
      database: env.MYSQL_DATABASE,
      databaseType: 'MySQL',
      dialect: 'mysql',
      host: env.MYSQL_HOST,
      password: env.MYSQL_ROOT_PASSWORD,
      port: 3306,
      schema: env.MYSQL_DATABASE,
      user: env.MYSQL_DEFAULT_USER,
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

export const createKnex = (databaseConfig: DatabaseConfig): Knex => knex.default({
  client: databaseConfig.client,
  connection: {
    database: databaseConfig.database,
    host: databaseConfig.host,
    password: databaseConfig.password,
    port: databaseConfig.port,
    user: databaseConfig.user,
  },
});

export const getAdapter = (config: DatabaseConfig) => new Adapter(config.dialect, {
  database: config.database,
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
});
