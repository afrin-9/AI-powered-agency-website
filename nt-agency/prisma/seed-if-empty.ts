/* Runs during the Vercel build (see "vercel-build" in package.json).
   Loads the demo data only when SEED_DEMO_DATA=true AND the database has no users yet,
   so a deploy can never wipe real data: once any account exists this does nothing. */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

async function main() {
  if (process.env.SEED_DEMO_DATA !== "true") {
    console.log("Demo seed skipped (SEED_DEMO_DATA is not true).");
    return;
  }
  const prisma = new PrismaClient();
  const users = await prisma.user.count();
  await prisma.$disconnect();
  if (users > 0) {
    console.log(`Demo seed skipped: database already has ${users} user(s).`);
    return;
  }
  console.log("Empty database: loading demo data...");
  execSync("npx prisma db seed", { stdio: "inherit" });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
