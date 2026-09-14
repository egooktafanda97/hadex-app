import "server-only";

import Database from "better-sqlite3";
import path from "node:path";

const globalForDb = globalThis as unknown as { hdexDb?: Database.Database };
const configuredFile = process.env.DATABASE_URL?.replace(/^file:/, "") || "hdex.db";
const databasePath = path.join(process.cwd(), "data", path.basename(configuredFile));

export const db = globalForDb.hdexDb ?? new Database(databasePath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.pragma("busy_timeout = 5000");

if (process.env.NODE_ENV !== "production") globalForDb.hdexDb = db;
