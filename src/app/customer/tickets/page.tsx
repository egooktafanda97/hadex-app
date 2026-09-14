import { requireUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { CustomerTicketsView } from '@/components/customer-tickets-view';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireUser(['customer']);
  const tickets = db
    .prepare(
      `SELECT tk.ticket_code,tk.status,b.id booking_id,b.booking_code,bp.name passenger_name,bs.seat_number,t.departure_at,t.arrival_at,o.city origin,d.city destination,bu.name bus_name,bu.plate_number FROM tickets tk JOIN bookings b ON b.id=tk.booking_id JOIN booking_passengers bp ON bp.id=tk.passenger_id JOIN trip_seats ts ON ts.id=bp.seat_id JOIN bus_seats bs ON bs.id=ts.bus_seat_id JOIN trips t ON t.id=b.trip_id JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id JOIN buses bu ON bu.id=t.bus_id WHERE b.user_id=? ORDER BY t.departure_at DESC`,
    )
    .all(user.id) as {
    ticket_code: string;
    status: string;
    booking_id: string;
    booking_code: string;
    passenger_name: string;
    seat_number: string;
    departure_at: string;
    arrival_at: string;
    origin: string;
    destination: string;
    bus_name: string;
    plate_number: string;
  }[];
  return <CustomerTicketsView tickets={tickets} />;
}
