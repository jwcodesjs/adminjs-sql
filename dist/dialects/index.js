import { MysqlParser } from "./mysql.parser.js";
import { PostgresParser } from "./postgres.parser.js";
export * from "./types/index.js";
const parsers = [PostgresParser, MysqlParser];
export function parse(dialect, connection, parseOptions) {
    const parser = parsers.find((p) => p.dialects.includes(dialect));
    if (!parser) {
        throw new Error(`${dialect} is not supported.`);
    }
    return new parser(dialect, connection).parse(parseOptions);
}
//# sourceMappingURL=index.js.map