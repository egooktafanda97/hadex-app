const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Database = require('better-sqlite3');

// Exercise the real service against an isolated database; never modify live tickets.
const db = new Database(':memory:');
db.exec(fs.readFileSync('db/schema.sql', 'utf8'));
db.exec(`
  INSERT INTO users VALUES ('admin','Admin','admin@test',NULL,'unused','admin',1,NULL,'now','now');
  INSERT INTO buses VALUES ('bus','BUS','Bus','B 123',1,1,'now','now');
  INSERT INTO bus_seats VALUES ('seat','bus','1A',1,1,1);
  INSERT INTO locations VALUES ('a','A','Jakarta',NULL,1,'now','now'),('b','B','Bandung',NULL,1,'now','now');
  INSERT INTO routes VALUES ('route','a','b',120,100,1,'now','now');
  INSERT INTO trips VALUES ('trip','TRIP','bus','route','2026-09-13T08:00:00Z','2026-09-13T10:00:00Z',100,'scheduled','now','now');
  INSERT INTO bookings (id,booking_code,user_id,trip_id,status,subtotal,grand_total,expires_at,created_at,updated_at)
    VALUES ('booking','BOOK','admin','trip','confirmed',100,100,'later','now','now');
  INSERT INTO trip_seats VALUES ('ts','trip','seat','booked','booking',NULL);
  INSERT INTO booking_passengers (id,booking_id,name,seat_id,created_at,updated_at) VALUES ('passenger','booking','Penumpang','ts','now','now');
  INSERT INTO payments (id,booking_id,amount,status,created_at,updated_at) VALUES ('payment','booking',100,'paid','now','now');
  INSERT INTO tickets VALUES ('ticket','booking','passenger','TKT-TEST123','hash','issued','now',NULL,'now','now');
`);
const audits = [];
const source = ts.transpileModule(fs.readFileSync('src/services/ticket-validation.service.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const service = { exports: {} };
new Function('require', 'module', 'exports', source)((name) => {
  if (name === 'server-only') return {};
  if (name === '@/lib/db') return { db };
  if (name === '@/lib/audit') return { audit: (...args) => audits.push(args) };
  throw new Error(`Unexpected import: ${name}`);
}, service, service.exports);
const criteria = { passengerName: '  PENUMPANG  ', tripId: 'trip' };
const inspectTicket = (code) => service.exports.inspectTicket(code, criteria);
const checkInTicketByCode = (code, userId) => service.exports.checkInTicketByCode(code, userId, criteria);
for (const wrong of [{ passengerName: 'Orang lain', tripId: 'trip' }, { passengerName: 'Penumpang', tripId: 'other-trip' }, { passengerName: '', tripId: 'trip' }, undefined]) {
  assert.throws(() => service.exports.inspectTicket('TKT-TEST123', wrong));
  assert.throws(() => service.exports.checkInTicketByCode('TKT-TEST123', 'admin', wrong));
  assert.equal(db.prepare('SELECT status FROM tickets').get().status, 'issued');
}
assert.equal(audits.length, 0);
db.prepare('UPDATE booking_passengers SET name=?').run('Penumpang 1');
assert.throws(() => service.exports.inspectTicket('TKT-TEST123', { ...criteria, passengerName: 'Penumpang 1' }), /nama otomatis/);
assert.throws(() => checkInTicketByCode('TKT-TEST123', 'admin'), /nama otomatis/);
const correction = { passengerName: '  Ego   Oktafanda  ', tripId: 'trip' };
assert.throws(() => service.exports.correctLegacyTicketName('TKT-TEST123', 'admin', { ...correction, tripId: 'wrong' }), /perjalanan/);
assert.throws(() => service.exports.correctLegacyTicketName('TKT-TEST123', 'admin', { ...correction, passengerName: 'Penumpang 2' }), /nama lengkap/);
db.prepare("UPDATE payments SET status='refunded'").run();
assert.throws(() => service.exports.correctLegacyTicketName('TKT-TEST123', 'admin', correction), /Pembayaran/);
assert.equal(db.prepare('SELECT name FROM booking_passengers').get().name, 'Penumpang 1');
assert.equal(audits.length, 0);
db.prepare("UPDATE payments SET status='paid'").run();
const corrected = service.exports.correctLegacyTicketName('TKT-TEST123', 'admin', correction);
assert.equal(corrected.passenger_name, 'Ego Oktafanda');
assert.equal(corrected.valid, true);
assert.equal(corrected.status, 'issued');
assert.equal(db.prepare('SELECT name FROM booking_passengers').get().name, 'Ego Oktafanda');
assert.throws(() => service.exports.correctLegacyTicketName('TKT-TEST123', 'admin', correction), /sudah diisi/);
assert.equal(audits.length, 1);
assert.equal(audits[0][0], 'ticket.passenger_name_corrected');
assert.equal(audits[0][3], 'admin');
audits.length = 0;
db.prepare('UPDATE booking_passengers SET name=?').run('Ego Oktafanda');
assert.equal(service.exports.inspectTicket('TKT-TEST123', { ...criteria, passengerName: '  EGO   OKTAFANDA ' }).valid, true);
db.prepare('UPDATE booking_passengers SET name=?').run('Penumpang');
assert.equal(inspectTicket('  tkt-test123 ').valid, true);
assert.equal(inspectTicket('TKT-TEST123').passenger_name, 'Penumpang');
assert.throws(() => inspectTicket('missing'), /tidak ditemukan/);
assert.throws(() => inspectTicket("' OR 1=1 --"), /tidak ditemukan/);
for (const [table, status] of [['tickets','cancelled'], ['bookings','cancelled'], ['payments','refunded'], ['trips','arrived'], ['trips','cancelled']]) {
  const original = db.prepare(`SELECT status FROM ${table}`).get().status;
  db.prepare(`UPDATE ${table} SET status=?`).run(status);
  assert.equal(inspectTicket('TKT-TEST123').valid, false, `${table}: ${status}`);
  assert.throws(() => checkInTicketByCode('TKT-TEST123', 'admin'));
  db.prepare(`UPDATE ${table} SET status=?`).run(original);
}
const result = checkInTicketByCode('tkt-test123', 'admin');
assert.equal(result.status, 'used');
assert.ok(result.used_at);
assert.equal(inspectTicket('TKT-TEST123').valid, false);
assert.throws(() => checkInTicketByCode('TKT-TEST123', 'admin'), /sudah digunakan/);
assert.equal(audits.length, 1);
assert.equal(audits[0][3], 'admin');
db.close();
console.log('PASS: lookup, normalization, missing ticket, SQL injection, invalid states, check-in, duplicate check-in, audit.');
