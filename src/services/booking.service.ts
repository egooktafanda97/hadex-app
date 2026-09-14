import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { bookingSchema } from "@/schemas/booking";
import { audit } from "@/lib/audit";

const HOLD_MINUTES = 15;
const bookingCode = () => `HDEX-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

export function createBooking(userId: string, input: unknown) {
  const data = bookingSchema.parse(input);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString();
  const transaction = db.transaction(() => {
    db.prepare(`UPDATE trip_seats SET status='available',held_by_booking_id=NULL,held_until=NULL WHERE status='held' AND held_until<?`).run(now.toISOString());
    const trip = db.prepare(`SELECT fare,status,departure_at FROM trips WHERE id=?`).get(data.tripId) as { fare: number; status: string; departure_at: string } | undefined;
    if (!trip) throw new Error("Perjalanan tidak ditemukan");
    if (trip.status !== "scheduled") throw new Error("Perjalanan tidak lagi menerima booking");
    if (new Date(trip.departure_at) <= now) throw new Error("Waktu keberangkatan sudah lewat");
    const id = crypto.randomUUID(), code = bookingCode(), subtotal = trip.fare * data.seatIds.length;
    db.prepare(`INSERT INTO bookings (id,booking_code,user_id,trip_id,status,subtotal,admin_fee,discount,grand_total,expires_at,created_at,updated_at) VALUES (?,?,?,?,'pending_payment',?,0,0,?,?,?,?)`).run(id, code, userId, data.tripId, subtotal, subtotal, expiresAt, now.toISOString(), now.toISOString());
    const hold = db.prepare(`UPDATE trip_seats SET status='held',held_by_booking_id=?,held_until=? WHERE id=? AND trip_id=? AND status='available'`);
    const passenger = db.prepare(`INSERT INTO booking_passengers (id,booking_id,name,gender,phone,identity_number,seat_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`);
    data.seatIds.forEach((seatId, index) => {
      if (hold.run(id, expiresAt, seatId, data.tripId).changes !== 1) throw new Error("Kursi sudah tidak tersedia");
      const person = data.passengers[index]; passenger.run(crypto.randomUUID(), id, person.name, person.gender, person.phone || null, person.identityNumber || null, seatId, now.toISOString(), now.toISOString());
    });
    db.prepare(`INSERT INTO payments (id,booking_id,gateway,amount,status,expired_at,created_at,updated_at) VALUES (?,?,'ipaymu',?,'unpaid',?,?,?)`).run(crypto.randomUUID(), id, subtotal, expiresAt, now.toISOString(), now.toISOString());
    audit("booking.created", "Booking", id, userId, undefined, { code, subtotal });
    return { id, code, amount: subtotal, expiresAt };
  });
  return transaction();
}

export function expireBookings() {
  const now = new Date().toISOString();
  return db.transaction(() => {
    const bookings = db.prepare(`SELECT id FROM bookings WHERE status='pending_payment' AND expires_at<?`).all(now) as { id: string }[];
    const expire = db.prepare(`UPDATE bookings SET status='expired',updated_at=? WHERE id=? AND status='pending_payment'`);
    const release = db.prepare(`UPDATE trip_seats SET status='available',held_by_booking_id=NULL,held_until=NULL WHERE held_by_booking_id=? AND status='held'`);
    const payment = db.prepare(`UPDATE payments SET status='expired',updated_at=? WHERE booking_id=? AND status IN ('unpaid','pending')`);
    for (const item of bookings) { if (expire.run(now, item.id).changes) { release.run(item.id); payment.run(now, item.id); } }
    return bookings.length;
  })();
}
