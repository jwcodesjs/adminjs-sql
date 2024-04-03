import type {
  BaseDatabaseParser,
  ParseOptions,
} from "./base-database.parser.js";
import { MysqlParser } from "./mysql.parser.js";
import { PostgresParser } from "./postgres.parser.js";
import type { ConnectionOptions, DatabaseDialect } from "./types/index.js";

export * from "./types/index.js";

const parsers: (typeof BaseDatabaseParser)[] = [PostgresParser, MysqlParser];

export function parse(
  dialect: DatabaseDialect,
  connection: ConnectionOptions,
  parseOptions: ParseOptions,
) {
  const parser = parsers.find((p) => p.dialects.includes(dialect));

  if (!parser) {
    throw new Error(`${dialect} is not supported.`);
  }

  return new parser(dialect, connection).parse(parseOptions);
}
