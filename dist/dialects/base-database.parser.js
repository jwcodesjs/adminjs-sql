import knex from 'knex';
const dialectMap = {
    mysql: "mysql2",
    mariadb: "mysql2",
    postgresql: "pg",
};
export class BaseDatabaseParser {
    knex;
    dialect;
    connectionOptions;
    static dialects;
    constructor(dialect, connection) {
        if (!connection.database) {
            throw new Error("Please provide your database");
        }
        this.dialect = dialect;
        this.connectionOptions = connection;
        this.knex = knex({
            client: dialectMap[dialect],
            connection,
            searchPath: this.configuredSchema,
        });
    }
    get configuredSchema() {
        return this.connectionOptions.schema ?? "public";
    }
    async parse(_parseOptions) {
        throw new Error('Implement "parse" method for your database parser!');
    }
    async getSchema() {
        throw new Error('Implement "getSchema" method for your database parser!');
    }
    async getTables(_schemaName, _parseOptions) {
        throw new Error('Implement "getTables" method for your database parser!');
    }
    async getResources(_tables, _schemaName) {
        throw new Error('Implement "getResources" method for your database parser!');
    }
    async getProperties(_table) {
        throw new Error('Implement "getProperties" method for your database parser!');
    }
}
//# sourceMappingURL=base-database.parser.js.map