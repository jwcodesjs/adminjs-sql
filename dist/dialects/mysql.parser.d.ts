import { Property } from "../Property.js";
import { DatabaseMetadata, ResourceMetadata } from "../metadata/index.js";
import { BaseDatabaseParser, type ParseOptions } from "./base-database.parser.js";
export declare class MysqlParser extends BaseDatabaseParser {
    static dialects: ("mysql" | "mariadb")[];
    parse(parseOptions: ParseOptions): Promise<DatabaseMetadata>;
    getTables(schemaName: string, parseOptions: ParseOptions): Promise<string[]>;
    getResources(tables: string[]): Promise<ResourceMetadata[]>;
    getProperties(table: string): Promise<Property[]>;
}
