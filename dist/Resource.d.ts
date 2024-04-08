import { BaseRecord, BaseResource, type Filter, type ParamsType, type SupportedDatabasesType } from "adminjs";
import type { Property } from "./Property.js";
import { ResourceMetadata } from "./metadata/index.js";
type PrimaryKey = string | number;
export declare class Resource extends BaseResource {
    private knex;
    private dialect;
    private propertyMap;
    private tableName;
    private schemaName;
    private _database;
    private _properties;
    private idColumn;
    constructor(info: ResourceMetadata);
    static isAdapterFor(resource: any): boolean;
    databaseName(): string;
    databaseType(): SupportedDatabasesType | string;
    id(): string;
    properties(): Property[];
    property(path: string): Property | null;
    count(filter: Filter): Promise<number>;
    find(filter: Filter, options?: {
        limit?: number;
        offset?: number;
        sort?: {
            sortBy?: string;
            direction?: "asc" | "desc";
        };
    }): Promise<BaseRecord[]>;
    findOne(id: PrimaryKey): Promise<BaseRecord | null>;
    findMany(ids: PrimaryKey[]): Promise<BaseRecord[]>;
    build(params: Record<string, any>): BaseRecord;
    private prepareReturnValues;
    create(params: Record<string, any>): Promise<ParamsType>;
    update(id: string, params: Record<string, any>): Promise<ParamsType>;
    private prepareParams;
    private convertParam;
    delete(id: PrimaryKey): Promise<void>;
    private filterQuery;
}
export {};
