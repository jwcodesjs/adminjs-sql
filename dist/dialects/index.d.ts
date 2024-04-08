import type { ParseOptions } from "./base-database.parser.js";
import type { ConnectionOptions, DatabaseDialect } from "./types/index.js";
export * from "./types/index.js";
export declare function parse(dialect: DatabaseDialect, connection: ConnectionOptions, parseOptions: ParseOptions): Promise<import("../index.js").DatabaseMetadata>;
