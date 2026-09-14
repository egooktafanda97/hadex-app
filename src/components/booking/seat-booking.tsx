'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/lib/format';

type Seat = {
  id: string;
  seat_number: string;
  seat_row: number;
  seat_column: number;
  status: string;
};
export function SeatBooking({
  tripId,
  seats,
  fare,
}: {
  tripId: string;
  seats: Seat[];
  fare: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [people, setPeople] = useState<Record<string, { name: string; gender: 'male' | 'female' }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toggle = (id: string) =>
    setSelected((v) =>
      v.includes(id)
        ? v.filter((x) => x !== id)
        : v.length < 6
        ? [...v, id]
        : v,
    );
  async function book() {
    if (loading) return;
    const passengers = selected.map((id) => ({
      name: people[id]?.name.trim() ?? '',
      gender: people[id]?.gender ?? 'male',
    }));
    if (!selected.length || passengers.some((person) => person.name.length < 2 || person.name.length > 80 || /^penumpang\s+\d+$/i.test(person.name))) {
      setError('Isi nama lengkap sebenarnya untuk setiap penumpang (2–80 karakter).');
      return;
    }
    setLoading(true);
    setError('');
    try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tripId, seatIds: selected, passengers }),
    });
    const json = await res.json();
    if (res.status === 401) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(location.pathname)}`,
      );
      return;
    }
    if (!res.ok) {
      setError(json.error ?? 'Booking gagal');
      return;
    }
    router.push(`/customer/bookings/${json.id}`);
    } catch {
      setError('Koneksi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className='booking-picker'>
      <div className='bus-front'>
        <span>Bagian depan bus</span>
        <b>Pengemudi</b>
      </div>
      <div className='modern-seat-map'>
        {seats.map((s) => (
          <button
            key={s.id}
            style={{
              gridRow: s.seat_row,
              gridColumn: s.seat_column > 2 ? s.seat_column + 1 : s.seat_column,
            }}
            className={`modern-seat ${
              selected.includes(s.id) ? 'selected' : ''
            }`}
            disabled={loading || s.status !== 'available'}
            aria-pressed={selected.includes(s.id)}
            aria-label={`Kursi ${s.seat_number}, ${s.status}`}
            onClick={() => toggle(s.id)}
          >
            {s.seat_number}
          </button>
        ))}
      </div>
      <div className='seat-legend'>
        <span>
          <i className='available' />
          Tersedia
        </span>
        <span>
          <i className='chosen' />
          Dipilih
        </span>
        <span>
          <i className='unavailable' />
          Tidak tersedia
        </span>
      </div>
      {selected.length > 0 && <section className='grid gap-4 my-5'>
        <h3 className='font-semibold'>Data penumpang</h3>
        <p>Isi nama lengkap sesuai identitas. Nama ini dicetak di tiket dan diperiksa saat check-in.</p>
        {selected.map((id) => <fieldset key={id} disabled={loading} className='grid gap-2 border border-stone-200 rounded-lg p-3'>
          <legend>Kursi {seats.find((seat) => seat.id === id)?.seat_number}</legend>
          <label htmlFor={`passenger-${id}`}>Nama lengkap penumpang</label>
          <input id={`passenger-${id}`} className='input' value={people[id]?.name ?? ''} maxLength={80} required placeholder='Nama sesuai identitas'
            onChange={(event) => setPeople((previous) => ({ ...previous, [id]: { name: event.target.value, gender: previous[id]?.gender ?? 'male' } }))} />
          <label htmlFor={`gender-${id}`}>Jenis kelamin</label>
          <select id={`gender-${id}`} className='input' value={people[id]?.gender ?? 'male'}
            onChange={(event) => setPeople((previous) => ({ ...previous, [id]: { name: previous[id]?.name ?? '', gender: event.target.value as 'male' | 'female' } }))}>
            <option value='male'>Laki-laki</option>
            <option value='female'>Perempuan</option>
          </select>
        </fieldset>)}
      </section>}
      {error && <p className='booking-error' role='alert'>{error}</p>}
      <div className='booking-action'>
        <div>
          <small>{selected.length} kursi dipilih</small>
          <strong>{formatRupiah(fare * selected.length)}</strong>
        </div>
        <button disabled={!selected.length || loading} onClick={book}>
          {loading ? 'Memproses...' : `Pesan ${selected.length} kursi`}
        </button>
      </div>
    </div>
  );
}
