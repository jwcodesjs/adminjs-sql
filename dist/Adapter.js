import { parse } from "./dialects/index.js";
export class Adapter {
    static Resource;
    static Database;
    static Property;
    dialect;
    connection;
    parseOptions;
    constructor(dialect, connection, parseOptions) {
        this.dialect = dialect;
        this.connection = connection;
        this.parseOptions = {
            ignoredTables: [],
            ...parseOptions,
        };
    }
    async init() {
        return parse(this.dialect, this.connection, this.parseOptions);
    }
}
//# sourceMappingURL=Adapter.js.map