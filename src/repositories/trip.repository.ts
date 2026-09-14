import "server-only";
import { db } from "@/lib/db";

export type TripSummary = { id: string; trip_code: string; departure_at: string; arrival_at: string; fare: number; origin: string; destination: string; bus_name: string; available_seats: number };
export type TripFilters = { origin?: string; destination?: string; date?: string };

export function listBookableLocations() { return db.prepare(`SELECT DISTINCT l.city FROM locations l JOIN routes r ON l.id IN (r.origin_id,r.destination_id) JOIN trips t ON t.route_id=r.id WHERE l.is_active=1 AND r.is_active=1 AND t.status='scheduled' AND t.departure_at>datetime('now') ORDER BY l.city`).all() as { city: string }[] }
export function listTrips(filters: TripFilters = {}) {
  const conditions = [`t.status='scheduled'`, `t.departure_at>datetime('now')`]; const params: string[] = [];
  if (filters.origin) { conditions.push(`o.city=?`); params.push(filters.origin) } if (filters.destination) { conditions.push(`d.city=?`); params.push(filters.destination) } if (filters.date) { conditions.push(`date(t.departure_at,'+7 hours')=?`); params.push(filters.date) }
  return db.prepare(`SELECT t.id,t.trip_code,t.departure_at,t.arrival_at,t.fare,o.city origin,d.city destination,b.name bus_name,
    SUM(CASE WHEN ts.status='available' THEN 1 ELSE 0 END) available_seats
    FROM trips t JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id
    JOIN buses b ON b.id=t.bus_id JOIN trip_seats ts ON ts.trip_id=t.id
    WHERE ${conditions.join(' AND ')} GROUP BY t.id ORDER BY t.departure_at`).all(...params) as TripSummary[];
}

export function getTrip(id: string) {
  const trip = db.prepare(`SELECT t.*,o.city origin,d.city destination,b.name bus_name,b.plate_number FROM trips t JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id JOIN buses b ON b.id=t.bus_id WHERE t.id=?`).get(id);
  const seats = db.prepare(`SELECT ts.id,bs.seat_number,bs.seat_row,bs.seat_column,ts.status FROM trip_seats ts JOIN bus_seats bs ON bs.id=ts.bus_seat_id WHERE ts.trip_id=? ORDER BY bs.seat_row,bs.seat_column`).all(id);
  return trip ? { trip, seats } : null;
}
