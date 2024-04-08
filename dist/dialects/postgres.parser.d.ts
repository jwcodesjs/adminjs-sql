import { Property } from "../Property.js";
import { DatabaseMetadata, ResourceMetadata } from "../metadata/index.js";
import { BaseDatabaseParser, type ParseOptions } from "./base-database.parser.js";
type Enums = Record<string, string[]>;
export declare class PostgresParser extends BaseDatabaseParser {
    static dialects: "postgresql"[];
    private enums?;
    parse(parseOptions: ParseOptions): Promise<DatabaseMetadata>;
    getSchema(): Promise<any>;
    getTables(schemaName: string, parseOptions: ParseOptions): Promise<string[]>;
    getResources(tables: string[], schemaName: string): Promise<ResourceMetadata[]>;
    getProperties(table: string): Promise<Property[]>;
    getEnums(): Promise<Enums>;
}
export {};
