import knex, { type Knex } from 'knex';
import type { DatabaseConfig } from "./types.js";
export declare function setupDatabase(config: DatabaseConfig, knex: Knex): Promise<void>;
export declare const getDatabaseConfig: () => DatabaseConfig;
export declare const getDatabase: () => {
    config: DatabaseConfig;
    knex: knex.Knex<any, any[]>;
};
export declare const createKnex: (databaseConfig: DatabaseConfig) => Knex;
