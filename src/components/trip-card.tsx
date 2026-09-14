import Link from 'next/link';
import { ArrowRight, Bus, Clock3 } from 'lucide-react';
import { formatDateTime, formatRupiah } from '@/lib/format';
import type { TripSummary } from '@/repositories/trip.repository';

export function TripCard({ trip }: { trip: TripSummary }) {
  return (
    <article className='market-ticket'>
      <header>
        <div>
          <small>Perjalanan</small>
          <b>{trip.trip_code}</b>
        </div>
        <span>{trip.available_seats} kursi tersedia</span>
      </header>
      <div className='market-route'>
        <div>
          <strong>{trip.origin}</strong>
          <span>{formatDateTime(trip.departure_at)}</span>
        </div>
        <ArrowRight size={20} />
        <div>
          <strong>{trip.destination}</strong>
          <span>{formatDateTime(trip.arrival_at)}</span>
        </div>
      </div>
      <div className='market-bus'>
        <Bus size={18} />
        <span>{trip.bus_name}</span>
        <Clock3 size={18} />
      </div>
      <footer>
        <div>
          <small>Mulai dari</small>
          <strong>{formatRupiah(trip.fare)}</strong>
        </div>
        <Link href={`/schedule/${trip.id}`}>Pilih Kursi</Link>
      </footer>
    </article>
  );
}
