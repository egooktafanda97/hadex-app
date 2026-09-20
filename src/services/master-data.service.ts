import "server-only";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { busSchema, locationSchema, routeSchema, tripCreateSchema, tripUpdateSchema, userAdminSchema } from "@/schemas/master-data";

const now = () => new Date().toISOString();
const entity = (table: string, id: string) => db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);

export function saveBus(actorId: string, id: string | undefined, input: unknown) { const data = busSchema.parse(input); const time = now(); return db.transaction(() => { if (id) { const old = entity("buses", id); if (!old) throw new Error("Bus tidak ditemukan"); db.prepare(`UPDATE buses SET code=?,name=?,plate_number=?,capacity=?,updated_at=? WHERE id=?`).run(data.code, data.name, data.plateNumber, data.capacity, time, id); audit("bus.updated", "Bus", id, actorId, old, data); return id } const newId = crypto.randomUUID(); db.prepare(`INSERT INTO buses (id,code,name,plate_number,capacity,is_active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)`).run(newId, data.code, data.name, data.plateNumber, data.capacity, time, time); const seat = db.prepare(`INSERT INTO bus_seats (id,bus_id,seat_number,seat_row,seat_column,is_active) VALUES (?,?,?,?,?,1)`); for (let n = 1; n <= data.capacity; n++)seat.run(crypto.randomUUID(), newId, String(n).padStart(2, "0"), Math.ceil(n / 4), ((n - 1) % 4) + 1); audit("bus.created", "Bus", newId, actorId, undefined, data); return newId })() }
export function saveLocation(actorId: string, id: string | undefined, input: unknown) { const data = locationSchema.parse(input), time = now(); if (id) { const old = entity("locations", id); if (!old) throw new Error("Lokasi tidak ditemukan"); db.prepare(`UPDATE locations SET name=?,city=?,address=?,updated_at=? WHERE id=?`).run(data.name, data.city, data.address, time, id); audit("location.updated", "Location", id, actorId, old, data); return id } const newId = crypto.randomUUID(); db.prepare(`INSERT INTO locations (id,name,city,address,is_active,created_at,updated_at) VALUES (?,?,?,?,1,?,?)`).run(newId, data.name, data.city, data.address, time, time); audit("location.created", "Location", newId, actorId, undefined, data); return newId }
export function saveRoute(actorId: string, id: string | undefined, input: unknown) { const data = routeSchema.parse(input), time = now(); if (id) { const old = entity("routes", id); if (!old) throw new Error("Rute tidak ditemukan"); db.prepare(`UPDATE routes SET origin_id=?,destination_id=?,duration_minutes=?,distance_km=?,updated_at=? WHERE id=?`).run(data.originId, data.destinationId, data.durationMinutes, data.distanceKm, time, id); audit("route.updated", "Route", id, actorId, old, data); return id } const newId = crypto.randomUUID(); db.prepare(`INSERT INTO routes (id,origin_id,destination_id,duration_minutes,distance_km,is_active,created_at,updated_at) VALUES (?,?,?,?,?,1,?,?)`).run(newId, data.originId, data.destinationId, data.durationMinutes, data.distanceKm, time, time); audit("route.created", "Route", newId, actorId, undefined, data); return newId }
export function saveTrip(actorId: string, id: string | undefined, input: unknown) {
  const data = (id ? tripUpdateSchema : tripCreateSchema).parse(input);
  const time = now();
  return db.transaction(() => {
    if (id) {
      const old = entity("trips", id) as { status: string; bus_id: string } | undefined;
      if (!old) throw new Error("Trip tidak ditemukan");
      if (old.status !== "scheduled") throw new Error("Hanya trip scheduled dapat diubah");

      // Boleh diubah meski ada booking aktif (pending_payment/confirmed).
      // Kursi tidak di-reset kecuali bus diganti dan belum ada kursi yang terikat booking.
      if (old.bus_id !== data.busId) {
        const seatBound = (
          db
            .prepare(
              `SELECT COUNT(*) count
               FROM booking_passengers bp
               JOIN trip_seats ts ON ts.id = bp.seat_id
               WHERE ts.trip_id = ?`,
            )
            .get(id) as { count: number }
        ).count;
        const occupied = (
          db
            .prepare(
              `SELECT COUNT(*) count FROM trip_seats WHERE trip_id=? AND status IN ('held','booked')`,
            )
            .get(id) as { count: number }
        ).count;
        if (seatBound > 0 || occupied > 0) {
          throw new Error(
            "Bus tidak dapat diganti karena sudah ada kursi yang dibooking/ditahan",
          );
        }
        db.prepare(`DELETE FROM trip_seats WHERE trip_id=?`).run(id);
        db.prepare(
          `INSERT INTO trip_seats (id,trip_id,bus_seat_id,status)
           SELECT lower(hex(randomblob(16))),?,id,'available'
           FROM bus_seats WHERE bus_id=? AND is_active=1`,
        ).run(id, data.busId);
      }

      db.prepare(
        `UPDATE trips SET trip_code=?,bus_id=?,route_id=?,departure_at=?,arrival_at=?,fare=?,status=?,updated_at=? WHERE id=?`,
      ).run(
        data.tripCode,
        data.busId,
        data.routeId,
        data.departureAt,
        data.arrivalAt,
        data.fare,
        data.status,
        time,
        id,
      );
      audit("trip.updated", "Trip", id, actorId, old, data);
      return id;
    }
    const newId = crypto.randomUUID();
    db.prepare(
      `INSERT INTO trips (id,trip_code,bus_id,route_id,departure_at,arrival_at,fare,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      newId,
      data.tripCode,
      data.busId,
      data.routeId,
      data.departureAt,
      data.arrivalAt,
      data.fare,
      data.status,
      time,
      time,
    );
    db.prepare(
      `INSERT INTO trip_seats (id,trip_id,bus_seat_id,status)
       SELECT lower(hex(randomblob(16))),?,id,'available'
       FROM bus_seats WHERE bus_id=? AND is_active=1`,
    ).run(newId, data.busId);
    audit("trip.created", "Trip", newId, actorId, undefined, data);
    return newId;
  })();
}
export function toggleActive(actorId: string, table: "buses" | "locations" | "routes" | "users", model: string, id: string) { const old = entity(table, id) as { is_active: number } | undefined; if (!old) throw new Error("Data tidak ditemukan"); const active = old.is_active ? 0 : 1; db.prepare(`UPDATE ${table} SET is_active=?,updated_at=? WHERE id=?`).run(active, now(), id); audit(`${model.toLowerCase()}.${active ? "activated" : "deactivated"}`, model, id, actorId, old, { is_active: active }) }
export function toggleBusDeleted(actorId: string, id: string) { const old = entity("buses", id) as { is_active: number } | undefined; if (!old) throw new Error("Bus tidak ditemukan"); const active = old.is_active ? 0 : 1; db.prepare(`UPDATE buses SET is_active=?,updated_at=? WHERE id=?`).run(active, now(), id); audit(`bus.${active ? "restored" : "deleted"}`, "Bus", id, actorId, old, { is_active: active }) }
export function cancelTrip(actorId: string, id: string) { const old = entity("trips", id) as { status: string } | undefined; if (!old || old.status !== "scheduled") throw new Error("Trip tidak dapat dibatalkan"); db.prepare(`UPDATE trips SET status='cancelled',updated_at=? WHERE id=?`).run(now(), id); audit("trip.cancelled", "Trip", id, actorId, old, { status: "cancelled" }) }
export async function saveUser(actorId: string, id: string | undefined, input: unknown) { const data = userAdminSchema.parse(input), time = now(); if (id) { const old = entity("users", id); if (!old) throw new Error("User tidak ditemukan"); db.prepare(`UPDATE users SET name=?,email=?,phone=?,role=?,updated_at=? WHERE id=?`).run(data.name, data.email, data.phone, data.role, time, id); if (data.password) db.prepare(`UPDATE users SET password_hash=?,updated_at=? WHERE id=?`).run(await bcrypt.hash(data.password, 12), time, id); audit("user.updated", "User", id, actorId, old, { ...data, password: undefined }); return id } if (!data.password) throw new Error("Password wajib untuk user baru"); const newId = crypto.randomUUID(); db.prepare(`INSERT INTO users (id,name,email,phone,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,1,?,?)`).run(newId, data.name, data.email, data.phone, await bcrypt.hash(data.password, 12), data.role, time, time); audit("user.created", "User", newId, actorId, undefined, { ...data, password: undefined }); return newId }
