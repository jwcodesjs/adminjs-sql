import { BaseDatabase } from "adminjs";
import { Resource } from "./Resource.js";
import { DatabaseMetadata } from "./metadata/index.js";
export class Database extends BaseDatabase {
    info;
    static isAdapterFor(info) {
        return info instanceof DatabaseMetadata;
    }
    constructor(info) {
        super(info.database);
        this.info = info;
    }
    resources() {
        const tables = this.info.tables();
        return tables.map((metadata) => new Resource(metadata));
    }
    resource(name) {
        return new Resource(this.info.table(name));
    }
}
//# sourceMappingURL=Database.js.map