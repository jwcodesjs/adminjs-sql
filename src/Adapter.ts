import { Database as SqlDatabase } from './Database.js';
import { DatabaseDialect, parse } from './dialects/index.js';
import { ConnectionOptions } from './dialects/types/index.js';
import { Property as SqlProperty } from './Property.js';
import { Resource as SqlResource } from './Resource.js';
import { ParseOptions } from './dialects/base-database.parser.js';

export class Adapter {
  public static Resource: SqlResource;

  public static Database: SqlDatabase;

  public static Property: SqlProperty;

  private dialect: DatabaseDialect;

  private connection: ConnectionOptions;

  private parseOptions: ParseOptions;

  constructor(dialect: DatabaseDialect, connection: ConnectionOptions, parseOptions?: ParseOptions) {
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
