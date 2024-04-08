import type { Knex } from "knex";
import type { Property } from "../Property.js";
import type { DatabaseDialect } from "../dialects/index.js";
export declare class ResourceMetadata {
    dialect: DatabaseDialect;
    readonly knex: Knex;
    readonly database: string;
    readonly schemaName: string | null;
    readonly tableName: string;
    readonly properties: Property[];
    idProperty: Property;
    constructor(dialect: DatabaseDialect, knex: Knex, database: string, schemaName: string | null, tableName: string, properties: Property[]);
}
