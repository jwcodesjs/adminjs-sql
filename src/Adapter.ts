import { DatabaseDialect, parse } from './dialects';
import { ConnectionOptions } from './dialects/types';
import { Resource as SqlResource } from './Resource';
import { Database as SqlDatabase } from './Database';
import { Property as SqlProperty } from './Property';

export class Adapter {
  public static Resource: SqlResource;

  public static Database: SqlDatabase;

  public static Property: SqlProperty;

  private dialect: DatabaseDialect;

  private connection: ConnectionOptions;

  constructor(dialect: DatabaseDialect, connection: ConnectionOptions) {
    this.dialect = dialect;
    this.connection = connection;
  }

  public async init() {
    return parse(this.dialect, this.connection);
  }
}
