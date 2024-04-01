import type { PropertyType } from "adminjs";

import { type ColumnInfo, Property } from "../Property.js";
import { DatabaseMetadata, ResourceMetadata } from "../metadata/index.js";

import {
  BaseDatabaseParser,
  type ParseOptions,
} from "./base-database.parser.js";

type Enum = { schema: string; name: string; value: string };
type EnumCollection = Record<string, string[]>;

const pgArrayAggToArray = (agg: string) =>
  agg.replace(/{/g, "")
  .replace(/}/g, "")
  .split(",");

const getColumnType = (dbType: string): PropertyType => {
  switch (dbType) {
    case "uuid":
      return "uuid";
    case "bigint":
    case "int8":
    case "bigserial":
    case "serial8":
    case "integer":
    case "int":
    case "int4":
    case "smallint":
    case "int2":
    case "serial":
    case "serial4":
    case "smallserial":
    case "serial2":
      return "number";
    case "double precision":
    case "float8":
    case "numeric":
    case "decimal":
    case "real":
    case "float4":
      return "float";
    case "money":
      return "currency";
    case "boolean":
      return "boolean";
    case "time":
    case "time with time zone":
    case "timetz":
    case "time without time zone":
    case "timestamp":
    case "timestamp with time zone":
    case "timestamptz":
    case "timestamp without time zone":
      return "datetime";
    case "date":
      return "date";
    case "json":
    case "jsonb":
      return "key-value";
    case "text":
    case "character varying":
    case "char":
    case "varchar":
      return "string";
    default:
      return "string";
  }
};

export class PostgresParser extends BaseDatabaseParser {
  public static dialects = ["postgresql" as const];

  private enumCollection?: EnumCollection;

  public async parse(parseOptions: ParseOptions) {
    const tableNames = await this.getTables(
      this.configuredSchema,
      parseOptions,
    );
    const resources = await this.getResources(
      tableNames,
      this.configuredSchema,
    );
    const resourceMap = new Map<string, ResourceMetadata>();
    for (const resource of resources) {
      resourceMap.set(resource.tableName, resource);
    }

    return new DatabaseMetadata(this.connectionOptions.database, resourceMap);
  }

  public async getSchema() {
    const query = await this.knex.raw("SELECT current_schema() AS schema_name");
    const result = await query;

    return result.rows?.[0]?.schema_name?.toString() ?? "public";
  }

  public async getTables(schemaName: string, parseOptions: ParseOptions) {
    const query = await this.knex.raw(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_type='BASE TABLE'
      AND table_schema='${schemaName}'
    `);

    const result = await query;

    if (!result?.rows?.length) {
      console.warn(`No tables in database ${this.connectionOptions.database}`);

      return [];
    }

    return result.rows
      .map(({ table_name: table }) => table)
      .filter((table: string) => !parseOptions.ignoredTables.includes(table));
  }

  public async getResources(tables: string[], schemaName: string) {
    const resources = await Promise.all(
      tables.map(async (tableName) => {
        try {
          const resourceMetadata = new ResourceMetadata(
            this.dialect,
            this.knex,
            this.connectionOptions.database,
            schemaName,
            tableName,
            await this.getProperties(tableName),
          );

          return resourceMetadata;
        } catch (error) {
          console.error(error);

          return false;
        }
      }),
    );

    return resources.filter(Boolean) as ResourceMetadata[];
  }

  public async getProperties(table: string) {
    const enumCollection = await this.getEnums();
    const query = this.knex
      .from("information_schema.columns as col")
      .select(
        'col.column_default',
        'col.column_name',
        'col.data_type',
        'col.is_nullable',
        'col.is_updatable',
        'col.ordinal_position',
        'col.udt_name',
        'col.udt_schema',
        'tco.constraint_type as key_type',
      )
      .leftJoin("information_schema.key_column_usage as kcu", (c) =>
        c
          .on("kcu.column_name", "col.column_name")
          .on("kcu.table_name", "col.table_name"),
      )
      .leftJoin("information_schema.table_constraints as tco", (c) =>
        c
          .on("tco.constraint_name", "kcu.constraint_name")
          .on("tco.constraint_schema", "kcu.constraint_schema")
          .onVal("tco.constraint_type", "PRIMARY KEY"),
      )
      .where("col.table_schema", this.configuredSchema)
      .where("col.table_name", table);

    const columns = await query;

    const relQuery = this.knex.raw(`
      select
        (select r.relname from pg_class r where r.oid = c.conrelid) as table, 
        (select array_agg(attname) from pg_attribute 
        where attrelid = c.conrelid and ARRAY[attnum] <@ c.conkey) as col, 
        (select r.relname from pg_class r where r.oid = c.confrelid) as referenced_table
      from pg_constraint c
      where c.conrelid = (select oid from pg_class where relname = '${table}')
      and (select r.relname from pg_class r where r.oid = c.confrelid) is not null
    `);

    const relations = await relQuery;

    return columns.map((col) => {
      const rel = relations.rows.find((r) => {
        const cols = pgArrayAggToArray(r.col);
        if (cols.length > 1) {
          // AdminJS doesn't support multiple foreign keys
          return null;
        }

        return cols.find((c) => c === col.column_name);
      });

      if (rel) {
        col.referenced_table = rel.referenced_table;
      }

      const columnInfo = getColumnInfo(col, enumCollection);
      return new Property(columnInfo);
    });

    function getColumnInfo(column: Record<string, number | string>, enumCollection: EnumCollection = {}): ColumnInfo {
      const availableValues = column.data_type === 'USER-DEFINED'
      && enumCollection[`${column.udt_schema}.${column.udt_name}`]
        ? enumCollection[`${column.udt_schema}.${column.udt_name}`]
        : null;

      return {
        availableValues,
        defaultValue: column.column_default,
        isEditable: column.is_updatable === 'YES',
        isId: column.key_type === 'PRIMARY KEY',
        isNullable: column.is_nullable === 'YES',
        name: column.column_name as string,
        position: column.ordinal_position as number,
        referencedTable: (column.referenced_table ?? null) as string | null,
        type: column.referenced_table ? 'reference' : getColumnType(column.data_type as string),
      };
    }
  }

  async getEnums(): Promise<EnumCollection> {
    if (this.enumCollection) return this.enumCollection;

    const enums = await this.knex.from('pg_enum as enum')
      .join('pg_type as type', 'type.oid', 'enum.enumtypid')
      .join('pg_namespace as namespace', 'namespace.oid', 'type.typnamespace')
      .select('namespace.nspname as schema', 'type.typname as name', 'enum.enumlabel as value')
      .groupBy('namespace.nspname', 'type.typname', 'enum.enumlabel') as Enum[];

    const groupedEnums: EnumCollection = {};
    const createKey = (entry: Enum) => `${entry.schema}.${entry.name}`;
    for (const entry of enums) {
      const key = createKey(entry);
      if (!groupedEnums[key]) {
        groupedEnums[key] = [];
      }

      groupedEnums[key].push(entry.value);
    }

    this.enumCollection = groupedEnums;
    return groupedEnums;
  }
}
