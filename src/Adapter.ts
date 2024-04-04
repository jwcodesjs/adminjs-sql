import type { Database as SqlDatabase } from "./Database.js";
import type { Property as SqlProperty } from "./Property.js";
import type { Resource as SqlResource } from "./Resource.js";
import type { ParseOptions } from "./dialects/base-database.parser.js";
import { type DatabaseDialect, parse } from "./dialects/index.js";
import type { ConnectionOptions } from "./dialects/types/index.js";

export class Adapter {
  public static Resource: SqlResource;

  public static Database: SqlDatabase;

  public static Property: SqlProperty;

  private dialect: DatabaseDialect;

  private connection: ConnectionOptions;

  private parseOptions: ParseOptions;

  constructor(
    dialect: DatabaseDialect,
    connection: ConnectionOptions,
    parseOptions?: ParseOptions,
  ) {
    this.dialect = dialect;
    this.connection = connection;
    this.parseOptions = {
      ignoredTables: [],
      ...parseOptions,
    };
  }

  public async init() {
    return parse(this.dialect, this.connection, this.parseOptions);
  }
}
