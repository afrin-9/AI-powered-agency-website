import { execSync } from "node:child_process";

// Applies migrations to the test database before the run. `migrate deploy` never drops data;
// each test file clears the tables it uses itself.
export default function setup() {
  const url = process.env.DATABASE_URL;
  if (!url || !url.includes("_test")) {
    throw new Error(`Refusing to run tests against a non-test database: ${url}`);
  }
  execSync("npx prisma migrate deploy", { stdio: "pipe", env: { ...process.env, DATABASE_URL: url } });
}
