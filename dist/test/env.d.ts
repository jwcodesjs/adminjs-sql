import type { DatabaseDialect } from "../dialects/index.js";
type Env = {
    DB_HOST: string;
    DB_NAME: string;
    DB_PASSWORD: string;
    DB_PORT: number;
    DB_SCHEMA?: string;
    DB_USER: string;
    DIALECT: DatabaseDialect;
};
export declare const getEnv: () => Env;
export declare const logEnv: (env: Env) => void;
export {};
