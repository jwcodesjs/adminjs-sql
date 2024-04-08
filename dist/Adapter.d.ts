import type { Database as SqlDatabase } from "./Database.js";
import type { Property as SqlProperty } from "./Property.js";
import type { Resource as SqlResource } from "./Resource.js";
import type { ParseOptions } from "./dialects/base-database.parser.js";
import { type DatabaseDialect } from "./dialects/index.js";
import type { ConnectionOptions } from "./dialects/types/index.js";
export declare class Adapter {
    static Resource: SqlResource;
    static Database: SqlDatabase;
    static Property: SqlProperty;
    private dialect;
    private connection;
    private parseOptions;
    constructor(dialect: DatabaseDialect, connection: ConnectionOptions, parseOptions?: ParseOptions);
    init(): Promise<import("./index.js").DatabaseMetadata>;
}
