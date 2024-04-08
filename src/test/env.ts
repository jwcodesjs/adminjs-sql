import path from "node:path";

import { configDotenv } from "dotenv";

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

export const getEnv = (): Env => {
  const config = configDotenv({
    path: [path.join(__dirname, "../../.env")],
  });

  const env = {
    DIALECT: "mysql",
    ...process.env,
    ...config.parsed,
  } as Env;

  env.DB_PORT = Number(env.DB_PORT || "3306");
  return env;
};

export const logEnv = (env: Env) => {
  const envString = Object.entries(env)
    .filter(
      ([key]) =>
        key.startsWith("DB_") || key === "DIALECT" || key === "SERVICE",
    )
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  // biome-ignore lint/suspicious/noConsoleLog: <explanation>
  console.log("Test environment:\n", envString.trim());
};
