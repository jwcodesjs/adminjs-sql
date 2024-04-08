import { BaseRecord, BaseResource, flat, } from "adminjs";
import { ResourceMetadata } from "./metadata/index.js";
import { safeParseJSON } from "./utils/helpers.js";
export class Resource extends BaseResource {
    knex;
    dialect;
    propertyMap = new Map();
    tableName;
    schemaName;
    _database;
    _properties;
    idColumn;
    constructor(info) {
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
    static isAdapterFor(resource) {
        return resource instanceof ResourceMetadata;
    }
    databaseName() {
        return this._database;
    }
    databaseType() {
        const dialectMap = {
            mariadb: "MariaDB",
            mysql: "MySQL",
            postgresql: "Postgres",
        };
        return dialectMap[this.dialect];
    }
    id() {
        return this.tableName;
    }
    properties() {
        return this._properties;
    }
    property(path) {
        return this.propertyMap.get(path) ?? null;
    }
    async count(filter) {
        const [r] = await this.filterQuery(filter).count("* as count");
        return Number(r.count);
    }
    async find(filter, options = {}) {
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
        const rows = await query;
        return rows.map((row) => this.build(row));
    }
    async findOne(id) {
        const knex = this.schemaName
            ? this.knex(this.tableName).withSchema(this.schemaName)
            : this.knex(this.tableName);
        const res = await knex.where(this.idColumn, id);
        return res[0] ? this.build(res[0]) : null;
    }
    async findMany(ids) {
        const knex = this.schemaName
            ? this.knex(this.tableName).withSchema(this.schemaName)
            : this.knex(this.tableName);
        const res = await knex.whereIn(this.idColumn, ids);
        return res.map((r) => this.build(r));
    }
    build(params) {
        const preparedValues = this.prepareReturnValues(params);
        return new BaseRecord(preparedValues, this);
    }
    prepareReturnValues(params) {
        const preparedValues = {};
        for (const property of this.properties()) {
            const param = flat.get(params, property.path());
            const key = property.path();
            if (property.type() === "key-value" && typeof param === "string") {
                preparedValues[key] = safeParseJSON(param);
            }
            else {
                preparedValues[key] = param;
            }
        }
        return preparedValues;
    }
    async create(params) {
        const knex = this.schemaName
            ? this.knex(this.tableName).withSchema(this.schemaName)
            : this.knex(this.tableName);
        await knex.insert(params);
        return params;
    }
    async update(id, params) {
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
    prepareParams(params) {
        const preparedParams = {};
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
    convertParam(property, value) {
        const type = property.type();
        if (type === "key-value") {
            return JSON.stringify(value);
        }
        return value;
    }
    async delete(id) {
        const knex = this.schemaName
            ? this.knex.withSchema(this.schemaName)
            : this.knex;
        await knex.from(this.tableName).delete().where(this.idColumn, id);
    }
    filterQuery(query) {
        const knex = this.schemaName
            ? this.knex(this.tableName).withSchema(this.schemaName)
            : this.knex(this.tableName);
        const q = knex;
        if (!query) {
            return q;
        }
        for (const [key, filter] of Object.entries(query.filters ?? {})) {
            const property = filter.property || undefined;
            if (typeof filter.value === "object" &&
                ["date", "datetime"].includes(property.type())) {
                q.whereBetween(key, [filter.value.from, filter.value.to]);
            }
            else if (property.isEnum()) {
                q.where(key, filter.value);
            }
            else if (property.type() === "string") {
                if (this.dialect === "postgresql") {
                    q.whereILike(key, `%${filter.value}%`);
                }
                else {
                    q.whereLike(key, `%${filter.value}%`);
                }
            }
            else {
                q.where(key, filter.value);
            }
        }
        return q;
    }
}
//# sourceMappingURL=Resource.js.map