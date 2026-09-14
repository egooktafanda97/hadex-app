import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const databasePath = path.resolve(
  process.cwd(),
  process.env.DATABASE_URL?.replace(/^file:/, "") || "data/hdex.db",
);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const migrate = spawnSync(process.execPath, ["scripts/migrate.mjs"], {
  stdio: "inherit",
  env: process.env,
});
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

let needSeed = !fs.existsSync(databasePath);
if (!needSeed) {
  const db = new Database(databasePath);
  try {
    const row = db
      .prepare("SELECT 1 AS x FROM users WHERE email = ?")
      .get("admin@mail.com");
    needSeed = !row;
  } catch {
    needSeed = true;
  } finally {
    db.close();
  }
}

if (needSeed) {
  const seed = spawnSync(process.execPath, ["scripts/seed.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
  if (seed.status !== 0) process.exit(seed.status ?? 1);
} else {
  console.log("Seed dilewati: akun demo sudah ada.");
}
