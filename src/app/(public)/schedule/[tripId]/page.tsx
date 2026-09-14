import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SeatBooking } from '@/components/booking/seat-booking';
import { getTrip } from '@/repositories/trip.repository';
import { formatDateTime, formatRupiah } from '@/lib/format';
export const dynamic = 'force-dynamic';
export default async function TripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;
  const data = getTrip(tripId) as {
    trip: Record<string, unknown>;
    seats: {
      id: string;
      seat_number: string;
      seat_row: number;
      seat_column: number;
      status: string;
    }[];
  } | null;
  if (!data) notFound();
  const fare = Number(data.trip.fare);
  return (
    <main className='container booking-page'>
      <Link className='back-link' href='/schedule'>
        ← Kembali ke jadwal
      </Link>
      <div className='booking-hero'>
        <span className='landing-kicker'>Pilih kursi</span>
        <h1>
          {String(data.trip.origin)} <span>→</span>{' '}
          {String(data.trip.destination)}
        </h1>
        <p>
          {formatDateTime(String(data.trip.departure_at))} ·{' '}
          {String(data.trip.bus_name)} · {String(data.trip.plate_number)}
        </p>
      </div>
      <div className='booking-layout'>
        <section>
          <SeatBooking tripId={tripId} seats={data.seats} fare={fare} />
        </section>
        <aside className='booking-summary'>
          <span>Ringkasan perjalanan</span>
          <h2>{String(data.trip.trip_code)}</h2>
          <dl>
            <div>
              <dt>Rute</dt>
              <dd>
                {String(data.trip.origin)} → {String(data.trip.destination)}
              </dd>
            </div>
            <div>
              <dt>Keberangkatan</dt>
              <dd>{formatDateTime(String(data.trip.departure_at))}</dd>
            </div>
            <div>
              <dt>Harga per kursi</dt>
              <dd className='price'>{formatRupiah(fare)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
