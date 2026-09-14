import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_URL?.replace(/^file:/, "") || "data/hdex.db");
const db = new Database(databasePath);
const now = new Date().toISOString();
const demoPassword = "password";
const password = await bcrypt.hash(demoPassword, 12);
const id = () => crypto.randomUUID();

const seed = db.transaction(() => {
  const findUser = db.prepare(`SELECT id FROM users WHERE email=?`);
  const insertUser = db.prepare(
    `INSERT INTO users (id,name,email,phone,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)`,
  );
  const updateUser = db.prepare(
    `UPDATE users SET name=?,phone=?,password_hash=?,role=?,is_active=1,updated_at=? WHERE id=?`,
  );

  const demoUsers = [
    ["Admin HDEX", "admin@mail.com", "admin"],
    ["Super HDEX", "super@mail.com", "owner"],
    ["Operator HDEX", "operator@mail.com", "operator"],
    ["Pelanggan Demo", "customer@mail.com", "customer"],
  ];

  for (const [name, email, role] of demoUsers) {
    const existing = findUser.get(email);
    if (existing) {
      updateUser.run(name, "081234567890", password, role, now, existing.id);
    } else {
      insertUser.run(id(), name, email, "081234567890", password, role, now, now);
    }
  }

  let busId = id();
  db.prepare(`INSERT OR IGNORE INTO buses (id,code,name,plate_number,capacity,is_active,created_at,updated_at) VALUES (?,?,?,?,20,1,?,?)`).run(busId,"HDEX-01","HDEX Executive 01","BM 7010 HX",now,now);
  busId = db.prepare(`SELECT id FROM buses WHERE code='HDEX-01'`).get().id;
  const seat = db.prepare(`INSERT OR IGNORE INTO bus_seats (id,bus_id,seat_number,seat_row,seat_column,is_active) VALUES (?,?,?,?,?,1)`);
  for (let number=1; number<=20; number++) seat.run(id(),busId,String(number).padStart(2,"0"),Math.ceil(number/4),((number-1)%4)+1);

  db.prepare(`INSERT INTO locations (id,name,city,address,is_active,created_at,updated_at) SELECT ?,?,?,?,1,?,? WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name=?)`).run(id(),"Pool HDEX Teluk Kuantan","Teluk Kuantan","Jl. Proklamasi",now,now,"Pool HDEX Teluk Kuantan");
  db.prepare(`INSERT INTO locations (id,name,city,address,is_active,created_at,updated_at) SELECT ?,?,?,?,1,?,? WHERE NOT EXISTS (SELECT 1 FROM locations WHERE name=?)`).run(id(),"Terminal BRPS","Pekanbaru","Jl. Tuanku Tambusai",now,now,"Terminal BRPS");
  const originId = db.prepare(`SELECT id FROM locations WHERE name=?`).get("Pool HDEX Teluk Kuantan").id;
  const destinationId = db.prepare(`SELECT id FROM locations WHERE name=?`).get("Terminal BRPS").id;

  db.prepare(`INSERT INTO routes (id,origin_id,destination_id,duration_minutes,distance_km,is_active,created_at,updated_at) SELECT ?,?,?,210,165,1,?,? WHERE NOT EXISTS (SELECT 1 FROM routes WHERE origin_id=? AND destination_id=?)`).run(id(),originId,destinationId,now,now,originId,destinationId);
  const routeId = db.prepare(`SELECT id FROM routes WHERE origin_id=? AND destination_id=?`).get(originId,destinationId).id;
  const departure = new Date(); departure.setDate(departure.getDate()+1); departure.setHours(8,0,0,0);
  const arrival = new Date(departure.getTime()+210*60000);
  const tripCode = `TRIP-${departure.toISOString().slice(0,10).replaceAll("-","")}-001`;
  db.prepare(`INSERT OR IGNORE INTO trips (id,trip_code,bus_id,route_id,departure_at,arrival_at,fare,status,created_at,updated_at) VALUES (?,?,?,?,?,?,120000,'scheduled',?,?)`).run(id(),tripCode,busId,routeId,departure.toISOString(),arrival.toISOString(),now,now);
  const tripId = db.prepare(`SELECT id FROM trips WHERE trip_code=?`).get(tripCode).id;
  db.prepare(`INSERT OR IGNORE INTO trip_seats (id,trip_id,bus_seat_id,status) SELECT lower(hex(randomblob(16))), ?, id, 'available' FROM bus_seats WHERE bus_id=?`).run(tripId,busId);
});
seed(); db.close();
console.log(`Seed selesai. Password semua akun demo: ${demoPassword}`);
