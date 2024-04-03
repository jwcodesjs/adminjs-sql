import type { Knex } from "knex";

import type { Property } from "../Property.js";
import type { DatabaseDialect } from "../dialects/index.js";

export class ResourceMetadata {
  public idProperty: Property;

  constructor(
    public dialect: DatabaseDialect,
    public readonly knex: Knex,
    public readonly database: string,
    public readonly schemaName: string | null,
    public readonly tableName: string,
    public readonly properties: Property[],
  ) {
    const idProperty = properties.find((p) => p?.isId?.());
    if (!idProperty) {
      throw new Error(`Table "${tableName}" has no primary key`);
    }

    this.idProperty = idProperty;
    this.dialect = dialect;
  }
}
