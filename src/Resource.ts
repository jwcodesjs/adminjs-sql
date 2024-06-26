import {
  BaseRecord,
  BaseResource,
  type Filter,
  type ParamsType,
  type SupportedDatabasesType,
  flat,
} from "adminjs";
import type { Knex } from "knex";

import type { Property } from "./Property.js";
import type { DatabaseDialect } from "./dialects/index.js";
import { ResourceMetadata } from "./metadata/index.js";
import { safeParseJSON } from "./utils/helpers.js";

type PrimaryKey = string | number;
type ParamValue =
  | string
  | boolean
  | number
  | Record<string, any>
  | null
  | undefined;

export class Resource extends BaseResource {
  private knex: Knex;

  private dialect: DatabaseDialect;

  private propertyMap = new Map<string, Property>();

  private tableName: string;

  private schemaName: string | null;

  private _database: string;

  private _properties: Property[];

  private idColumn: string;

  constructor(info: ResourceMetadata) {
    super(info.tableName);
    this.knex = info.knex;
    this.schemaName = info.schemaName;
    this.tableName = info.tableName;
    this._database = info.database;
    this._properties = info.properties;
    for (const p of this._properties) {
      this.propertyMap.set(p.path(), p);
    }
    this.idColumn = info.idProperty.path();
    this.dialect = info.dialect;
  }

  static override isAdapterFor(resource: any): boolean {
    return resource instanceof ResourceMetadata;
  }

  override databaseName(): string {
    return this._database;
  }

  override databaseType(): SupportedDatabasesType | string {
    const dialectMap: Record<DatabaseDialect, SupportedDatabasesType> = {
      mariadb: "MariaDB",
      mysql: "MySQL",
      postgresql: "Postgres",
    };

    return dialectMap[this.dialect];
  }

  override id(): string {
    return this.tableName;
  }

  override properties(): Property[] {
    return this._properties;
  }

  override property(path: string): Property | null {
    return this.propertyMap.get(path) ?? null;
  }

  override async count(filter: Filter): Promise<number> {
    const [r] = await this.filterQuery(filter).count("* as count");
    return Number(r.count);
  }

  override async find(
    filter: Filter,
    options: {
      limit?: number;
      offset?: number;
      sort?: {
        sortBy?: string;
        direction?: "asc" | "desc";
      };
    } = {},
  ): Promise<BaseRecord[]> {
    const query = this.filterQuery(filter);
    if (options.limit) {
      query.limit(options.limit);
    }
    if (options.offset) {
      query.offset(options.offset);
    }
    if (options.sort?.sortBy) {
      query.orderBy(options.sort.sortBy, options.sort.direction);
    }
    const rows: any[] = await query;
    return rows.map((row) => this.build(row));
  }

  override async findOne(id: PrimaryKey): Promise<BaseRecord | null> {
    const knex = this.schemaName
      ? this.knex(this.tableName).withSchema(this.schemaName)
      : this.knex(this.tableName);
    const res = await knex.where(this.idColumn, id);
    return res[0] ? this.build(res[0]) : null;
  }

  override async findMany(ids: PrimaryKey[]): Promise<BaseRecord[]> {
    const knex = this.schemaName
      ? this.knex(this.tableName).withSchema(this.schemaName)
      : this.knex(this.tableName);
    const res = await knex.whereIn(this.idColumn, ids);
    return res.map((r) => this.build(r));
  }

  override build(params: Record<string, any>): BaseRecord {
    const preparedValues = this.prepareReturnValues(params);
    return new BaseRecord(preparedValues, this);
  }

  private prepareReturnValues(
    params: Record<string, any>,
  ): Record<string, any> {
    const preparedValues: Record<string, any> = {};

    for (const property of this.properties()) {
      const param = flat.get(params, property.path());
      const key = property.path();

      if (property.type() === "key-value" && typeof param === "string") {
        preparedValues[key] = safeParseJSON(param);
      } else {
        preparedValues[key] = param;
      }
    }

    return preparedValues;
  }

  override async create(params: Record<string, any>): Promise<ParamsType> {
    const knex = this.schemaName
      ? this.knex(this.tableName).withSchema(this.schemaName)
      : this.knex(this.tableName);
    await knex.insert(params);

    return params;
  }

  override async update(
    id: string,
    params: Record<string, any>,
  ): Promise<ParamsType> {
    const knex = this.schemaName
      ? this.knex.withSchema(this.schemaName)
      : this.knex;

    const preparedParams = this.prepareParams(params);
    await knex
      .from(this.tableName)
      .update(preparedParams)
      .where(this.idColumn, id);

    const knexQb = this.schemaName
      ? this.knex(this.tableName).withSchema(this.schemaName)
      : this.knex(this.tableName);
    const [row] = await knexQb.where(this.idColumn, id);
    return row;
  }

  private prepareParams(params: Record<string, any>): Record<string, any> {
    const preparedParams: Record<string, any> = {};
    for (const property of this.properties()) {
      const param = flat.get(params, property.path());
      if (param === undefined) {
        continue;
      }

      const key = property.path();
      preparedParams[key] = this.convertParam(property, param);
    }

    return preparedParams;
  }

  private convertParam(property: Property, value: ParamValue): ParamValue {
    const type = property.type();

    if (type === "key-value") {
      return JSON.stringify(value);
    }

    return value;
  }

  override async delete(id: PrimaryKey): Promise<void> {
    const knex = this.schemaName
      ? this.knex.withSchema(this.schemaName)
      : this.knex;
    await knex.from(this.tableName).delete().where(this.idColumn, id);
  }

  private filterQuery(query: Filter | undefined): Knex.QueryBuilder {
    const knex = this.schemaName
      ? this.knex(this.tableName).withSchema(this.schemaName)
      : this.knex(this.tableName);
    const q = knex;

    if (!query) {
      return q;
    }

    for (const [key, filter] of Object.entries(query.filters ?? {})) {
      const property = (filter.property as Property) || undefined;
      if (
        typeof filter.value === "object" &&
        ["date", "datetime"].includes(property.type())
      ) {
        q.whereBetween(key, [filter.value.from, filter.value.to]);
      } else if (property.isEnum()) {
        q.where(key, filter.value);
      } else if (property.type() === "string") {
        if (this.dialect === "postgresql") {
          q.whereILike(key, `%${filter.value}%`);
        } else {
          q.whereLike(key, `%${filter.value}%`);
        }
      } else {
        q.where(key, filter.value);
      }
    }

    return q;
  }
}
