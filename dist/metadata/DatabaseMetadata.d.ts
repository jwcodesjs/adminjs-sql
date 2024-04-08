import type { ResourceMetadata } from "./ResourceMetadata.js";
export declare class DatabaseMetadata {
    readonly database: string;
    protected resourceMap: Map<string, ResourceMetadata>;
    constructor(database: string, resourceMap: Map<string, ResourceMetadata>);
    tables(): ResourceMetadata[];
    table(tableName: string): ResourceMetadata;
}
