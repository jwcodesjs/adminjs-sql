import { type Knex } from 'knex';
import type { DatabaseMetadata, ResourceMetadata } from "../metadata/index.js";
import type { ConnectionOptions, DatabaseDialect } from "./types/index.js";
export type ParseOptions = {
    ignoredTables: string[];
};
export declare class BaseDatabaseParser {
    protected knex: Knex;
    protected dialect: DatabaseDialect;
    protected connectionOptions: ConnectionOptions;
    static dialects: DatabaseDialect[];
    constructor(dialect: DatabaseDialect, connection: ConnectionOptions);
    protected get configuredSchema(): string;
    parse(_parseOptions: ParseOptions): Promise<DatabaseMetadata>;
    getSchema(): Promise<string>;
    getTables(_schemaName: string, _parseOptions: ParseOptions): Promise<string[]>;
    getResources(_tables: string[], _schemaName: string): Promise<ResourceMetadata[]>;
    getProperties(_table: string): Promise<any[]>;
}
