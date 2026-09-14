import Link from 'next/link';
import { TripCard } from '@/components/trip-card';
import {
  listBookableLocations,
  listTrips,
} from '@/repositories/trip.repository';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Jadwal Perjalanan' };
export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{
    origin?: string;
    destination?: string;
    date?: string;
  }>;
}) {
  const filters = await searchParams;
  const trips = listTrips(filters);
  const locations = listBookableLocations();
  return (
    <main>
      <section className='public-page-head'>
        <div className='container'>
          <span className='landing-kicker'>Jadwal HDEX Trans</span>
          <h1>Temukan perjalanan terbaik.</h1>
          <p>
            Pilih rute dan waktu keberangkatan. Harga dan kursi diperbarui dari
            sistem.
          </p>
        </div>
      </section>
      <section className='container public-results'>
        <form className='landing-search' action='/schedule'>
          <label>
            Asal
            <select name='origin' defaultValue={filters.origin ?? ''}>
              <option value=''>Semua asal</option>
              {locations.map((l) => (
                <option key={l.city}>{l.city}</option>
              ))}
            </select>
          </label>
          <label>
            Tujuan
            <select name='destination' defaultValue={filters.destination ?? ''}>
              <option value=''>Semua tujuan</option>
              {locations.map((l) => (
                <option key={l.city}>{l.city}</option>
              ))}
            </select>
          </label>
          <label>
            Tanggal
            <input type='date' name='date' defaultValue={filters.date ?? ''} />
          </label>
          <button>Cari Jadwal</button>
        </form>
        <div className='results-heading'>
          <div>
            <span>{trips.length} perjalanan ditemukan</span>
            <h2>Jadwal tersedia</h2>
          </div>
          {(filters.origin || filters.destination || filters.date) && (
            <Link href='/schedule'>Reset filter</Link>
          )}
        </div>
        <div className='landing-trip-grid'>
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
          {!trips.length && (
            <div className='landing-empty'>
              <h3>Jadwal belum tersedia</h3>
              <p>Coba tanggal atau rute lain.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
