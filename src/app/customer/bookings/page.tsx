import { requireUser } from '@/lib/dal';
import { listUserBookings } from '@/repositories/booking.repository';
import { CustomerBookingsTable } from '@/components/customer-bookings-table';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await requireUser(['customer']);
  const rows = listUserBookings(user.id).map((row) => ({
    id: String(row.id),
    booking_code: String(row.booking_code),
    origin: String(row.origin),
    destination: String(row.destination),
    departure_at: String(row.departure_at),
    grand_total: Number(row.grand_total),
    status: String(row.status),
  }));
  return <CustomerBookingsTable rows={rows} />;
}
