import type { Knex } from "knex";
import type { DatabaseDialect } from "../dialects/index.js";
export declare const isMySqlDialect: (dialect: DatabaseDialect) => boolean;
export declare const getMigrationSource: (schema: string, dialect: DatabaseDialect) => Knex.MigrationSource<any>;
