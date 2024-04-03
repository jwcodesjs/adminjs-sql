import * as Knex from "knex";

import type { DatabaseMetadata, ResourceMetadata } from "../metadata/index.js";

import type { ConnectionOptions, DatabaseDialect } from "./types/index.js";

export type ParseOptions = {
  ignoredTables: string[];
};

export class BaseDatabaseParser {
  protected knex: Knex.Knex;

  protected dialect: DatabaseDialect;

  protected connectionOptions: ConnectionOptions;

  public static dialects: DatabaseDialect[];

  constructor(dialect: DatabaseDialect, connection: ConnectionOptions) {
    if (!connection.database) {
      throw new Error("Please provide your database");
    }

    this.dialect = dialect;
    this.connectionOptions = connection;
    this.knex = Knex.knex({
      client: dialect,
      connection,
      searchPath: this.configuredSchema,
    });
  }

  protected get configuredSchema() {
    return this.connectionOptions.schema ?? "public";
  }

  public async parse(_parseOptions: ParseOptions): Promise<DatabaseMetadata> {
    throw new Error('Implement "parse" method for your database parser!');
  }

  public async getSchema(): Promise<string> {
    throw new Error('Implement "getSchema" method for your database parser!');
  }

  public async getTables(
    _schemaName: string,
    _parseOptions: ParseOptions,
  ): Promise<string[]> {
    throw new Error('Implement "getTables" method for your database parser!');
  }

  public async getResources(
    _tables: string[],
    _schemaName: string,
  ): Promise<ResourceMetadata[]> {
    throw new Error(
      'Implement "getResources" method for your database parser!',
    );
  }

  public async getProperties(_table: string): Promise<any[]> {
    throw new Error(
      'Implement "getProperties" method for your database parser!',
    );
  }
}
