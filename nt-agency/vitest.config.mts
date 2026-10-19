import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import { fileURLToPath } from "node:url";

const env = loadEnv("test", process.cwd(), "");

// Tests run against a separate database (nt_agency -> nt_agency_test) so dev data is never touched.
const testDb = env.TEST_DATABASE_URL || (env.DATABASE_URL ?? "").replace("/nt_agency", "/nt_agency_test");

// Set on process.env so both globalSetup (main process) and the test workers see the same values.
Object.assign(process.env, {
  DATABASE_URL: testDb,
  JWT_SECRET: env.JWT_SECRET || "test-secret-test-secret-test-secret-123",
  // Empty key: tests always use the local fallback classifier, so results are predictable.
  ANTHROPIC_API_KEY: "",
});

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globalSetup: ["tests/globalSetup.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
