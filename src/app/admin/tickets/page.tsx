import { requireUser } from '@/lib/dal';
import { TicketValidationForm } from '@/components/ticket-validation-form';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export default async function Page() {
  await requireUser(['admin']);
  const trips = db.prepare(`SELECT t.id,t.trip_code,t.departure_at,o.city origin,d.city destination,bu.name bus_name
    FROM trips t JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id
    JOIN locations d ON d.id=r.destination_id JOIN buses bu ON bu.id=t.bus_id
    ORDER BY t.departure_at DESC`).all() as { id: string; trip_code: string; departure_at: string; origin: string; destination: string; bus_name: string }[];
  return <TicketValidationForm trips={trips.map((trip) => ({ value: trip.id, label: `${trip.trip_code} | ${trip.origin} → ${trip.destination} | ${formatDateTime(trip.departure_at)} | ${trip.bus_name}` }))} />;
}
