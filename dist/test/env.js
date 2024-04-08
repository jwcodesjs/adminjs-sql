import path from "node:path";
import { configDotenv } from "dotenv";
export const getEnv = () => {
    const config = configDotenv({
        path: [path.join(__dirname, "../../.env")],
    });
    const env = {
        DIALECT: "mysql",
        ...process.env,
        ...config.parsed,
    };
    env.DB_PORT = Number(env.DB_PORT || "3306");
    return env;
};
export const logEnv = (env) => {
    const envString = Object.entries(env)
        .filter(([key]) => key.startsWith("DB_") || key === "DIALECT" || key === "SERVICE")
        .map(([key, value]) => `${key}=${value}`)
        .join("\n");
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log("Test environment:\n", envString.trim());
};
//# sourceMappingURL=env.js.map