import "server-only";
import { db } from "@/lib/db";

export function listUserBookings(userId: string) {
  return db.prepare(`SELECT b.*,t.departure_at,o.city origin,d.city destination,p.status payment_status,p.payment_url,p.proof_path,p.verification_note
    FROM bookings b JOIN trips t ON t.id=b.trip_id JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id
    LEFT JOIN payments p ON p.booking_id=b.id WHERE b.user_id=? ORDER BY b.created_at DESC`).all(userId) as Record<string, unknown>[];
}

export function getBooking(id: string) {
  const booking = db.prepare(`SELECT b.*,t.departure_at,t.arrival_at,o.city origin,d.city destination,p.status payment_status,p.payment_url,p.proof_path,p.verification_note
    FROM bookings b JOIN trips t ON t.id=b.trip_id JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id LEFT JOIN payments p ON p.booking_id=b.id WHERE b.id=?`).get(id) as Record<string, unknown> | undefined;
  if (!booking) return null;
  const passengers = db.prepare(`SELECT bp.*,bs.seat_number,tk.id ticket_id,tk.status ticket_status FROM booking_passengers bp JOIN trip_seats ts ON ts.id=bp.seat_id JOIN bus_seats bs ON bs.id=ts.bus_seat_id LEFT JOIN tickets tk ON tk.passenger_id=bp.id WHERE bp.booking_id=?`).all(id);
  return { booking, passengers };
}
