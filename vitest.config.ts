import { defineConfig } from "vitest/config";

const reportsDirectory = process.env.REPORTS_DIRECTORY || "coverage";

export default defineConfig({
  test: {
    globalSetup: ["src/test/setup.ts"],
    setupFiles: ["src/test/testSetup.ts"],
    pool: "forks",
    include: ["src/**/*.spec.ts"],
    coverage: {
      exclude: [".eslintrc.cjs", "src/test", "commitlint.config.cjs"],
      clean: true,
      cleanOnRerun: true,
      provider: "istanbul",
      reportsDirectory,
      reportOnFailure: true,
      reporter: ["cobertura", "json", "text", "json-summary"],
    },
  },
});
