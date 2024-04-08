import { BaseDatabase } from "adminjs";
import { Resource } from "./Resource.js";
import { DatabaseMetadata } from "./metadata/index.js";
export declare class Database extends BaseDatabase {
    private readonly info;
    static isAdapterFor(info: any): boolean;
    constructor(info: DatabaseMetadata);
    resources(): Resource[];
    resource(name: string): Resource;
}
