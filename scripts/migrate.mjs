import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const configuredPath = process.env.DATABASE_URL?.replace(/^file:/, '');
const databasePath = configuredPath
  ? path.resolve(process.cwd(), configuredPath)
  : path.join(process.cwd(), 'data', 'hdex.db');
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
const database = new Database(databasePath);
database.pragma('foreign_keys = ON');
database.exec(
  fs.readFileSync(path.join(process.cwd(), 'db', 'schema.sql'), 'utf8'),
);
const paymentSql =
  database
    .prepare(
      "SELECT sql FROM sqlite_master WHERE type='table' AND name='payments'",
    )
    .get()?.sql || '';
if (!paymentSql.includes('awaiting_verification')) {
  database.pragma('foreign_keys = OFF');
  database.exec(`ALTER TABLE payments RENAME TO payments_legacy;
    CREATE TABLE payments (
      id TEXT PRIMARY KEY, booking_id TEXT NOT NULL UNIQUE REFERENCES bookings(id), gateway TEXT NOT NULL DEFAULT 'manual',
      gateway_transaction_id TEXT UNIQUE, gateway_session_id TEXT, amount INTEGER NOT NULL CHECK(amount>=0),
      status TEXT NOT NULL CHECK(status IN ('unpaid','pending','awaiting_verification','paid','failed','rejected','expired','refunded')), payment_method TEXT, payment_channel TEXT,
      payment_url TEXT, proof_path TEXT, proof_uploaded_at TEXT, verified_by TEXT REFERENCES users(id), verified_at TEXT, verification_note TEXT,
      request_payload TEXT, response_payload TEXT, paid_at TEXT, expired_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    );
    INSERT INTO payments (id,booking_id,gateway,gateway_transaction_id,gateway_session_id,amount,status,payment_method,payment_channel,payment_url,request_payload,response_payload,paid_at,expired_at,created_at,updated_at)
      SELECT id,booking_id,gateway,gateway_transaction_id,gateway_session_id,amount,status,payment_method,payment_channel,payment_url,request_payload,response_payload,paid_at,expired_at,created_at,updated_at FROM payments_legacy;
    DROP TABLE payments_legacy;`);
  database.pragma('foreign_keys = ON');
}
const columns = database.prepare('PRAGMA table_info(payments)').all();
const existing = new Set(columns.map((column) => column.name));
const additions = [
  ['proof_path', 'TEXT'],
  ['proof_uploaded_at', 'TEXT'],
  ['verified_by', 'TEXT'],
  ['verified_at', 'TEXT'],
  ['verification_note', 'TEXT'],
];
for (const [name, type] of additions) {
  if (!existing.has(name))
    database.exec(`ALTER TABLE payments ADD COLUMN ${name} ${type}`);
}
database.close();
console.log(`Migrasi selesai: ${databasePath}`);
