import Link from 'next/link';
import {
  Armchair,
  Bus,
  CreditCard,
  QrCode,
  ShieldCheck,
  TicketCheck,
} from 'lucide-react';
import { TripCard } from '@/components/trip-card';
import {
  listBookableLocations,
  listTrips,
} from '@/repositories/trip.repository';
import { db } from '@/lib/db';
import { formatDateTime, formatRupiah } from '@/lib/format';

type LatestNews = {
  slug: string;
  title: string;
  excerpt: string;
  thumbnailPath: string | null;
  publishedAt: string;
};

export const dynamic = 'force-dynamic';
export default function Home() {
  const allTrips = listTrips();
  const trips = allTrips.slice(0, 3);
  const locations = listBookableLocations();
  const featured = trips[0];
  const latestNews = db.prepare(
    `SELECT slug,title,excerpt,thumbnail_path thumbnailPath,published_at publishedAt
     FROM news
     WHERE status='published' AND deleted_at IS NULL
     ORDER BY published_at DESC
     LIMIT 3`,
  ).all() as LatestNews[];
  return (
    <main className='landing'>
      <section className='landing-hero'>
        <div className='landing-grid-pattern' />
        <div className='container landing-hero-grid'>
          <div className='landing-copy'>
            <span className='landing-pill'>
              <i /> Pemesanan tiket bus lebih praktis
            </span>
            <h1>
              Pergi lebih mudah.<strong>Tiba dengan tenang.</strong>
            </h1>
            <p>
              Cari jadwal, pilih kursi, bayar, dan simpan e-ticket dalam satu
              alur sederhana bersama HDEX Trans.
            </p>
            <div className='landing-actions'>
              <Link href='/schedule' className='landing-primary'>
                Cari Tiket
              </Link>
              <a href='#cara-pesan' className='landing-secondary'>
                Lihat Cara Pesan
              </a>
            </div>
            <div className='landing-trust'>
              <div>
                <b>Real-time</b>
                <span>Ketersediaan kursi</span>
              </div>
              <div>
                <b>QR Ticket</b>
                <span>Check-in lebih cepat</span>
              </div>
              <div>
                <b>Online</b>
                <span>Booking & pembayaran</span>
              </div>
            </div>
          </div>
          <div className='landing-visual'>
            <div className='landing-bus-art'>
              <Bus size={120} />
              <span>HDEX TRANS</span>
            </div>
            {featured && (
              <div className='landing-floating-ticket'>
                <small>Perjalanan terdekat</small>
                <b>
                  {featured.origin} → {featured.destination}
                </b>
                <div>
                  <span>{featured.available_seats} kursi</span>
                  <strong>{formatRupiah(featured.fare)}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className='container'>
          <form
            className='landing-search landing-search-float'
            action='/schedule'
          >
            <label>
              Asal
              <select name='origin'>
                <option value=''>Pilih asal</option>
                {locations.map((l) => (
                  <option key={l.city}>{l.city}</option>
                ))}
              </select>
            </label>
            <label>
              Tujuan
              <select name='destination'>
                <option value=''>Pilih tujuan</option>
                {locations.map((l) => (
                  <option key={l.city}>{l.city}</option>
                ))}
              </select>
            </label>
            <label>
              Tanggal
              <input type='date' name='date' />
            </label>
            <button>Cari Jadwal</button>
          </form>
        </div>
      </section>
      <section className='landing-feature-band'>
        <div className='container'>
          {[
            [
              Armchair,
              'Pilih kursi sendiri',
              'Lihat kursi tersedia untuk setiap perjalanan.',
            ],
            [
              ShieldCheck,
              'Pembayaran tervalidasi',
              'Status booking berubah setelah pembayaran terkonfirmasi.',
            ],
            [
              QrCode,
              'E-ticket + QR',
              'Gunakan tiket digital untuk check-in keberangkatan.',
            ],
          ].map(([Icon, title, text]) => (
            <article key={String(title)}>
              <Icon size={24} />
              <div>
                <b>{title as string}</b>
                <p>{text as string}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className='container landing-market'>
        <div className='landing-section-head'>
          <div>
            <span className='landing-kicker'>Market Tiket Online</span>
            <h2>Pilih jadwal, kursi, lalu beli tiket.</h2>
            <p>
              Harga, jam keberangkatan, dan ketersediaan kursi berasal langsung
              dari sistem.
            </p>
          </div>
          <Link href='/schedule'>Lihat semua tiket →</Link>
        </div>
        <div className='landing-trip-grid'>
          {trips.map((t) => (
            <TripCard key={t.id} trip={t} />
          ))}
          {!trips.length && (
            <div className='landing-empty'>Belum ada perjalanan tersedia.</div>
          )}
        </div>
      </section>
      <section id='layanan' className='landing-services'>
        <div className='container'>
          <div className='landing-section-head'>
            <div>
              <span className='landing-kicker'>Layanan terpadu</span>
              <h2>Sederhana dari pesan sampai berangkat.</h2>
            </div>
          </div>
          <div className='landing-service-grid'>
            {[
              [
                Bus,
                'Armada nyaman',
                'Data bus dan kapasitas dikelola untuk tiap perjalanan.',
              ],
              [
                CreditCard,
                'Transaksi aman',
                'Harga dihitung server dan pembayaran divalidasi server.',
              ],
              [
                TicketCheck,
                'Tiket digital',
                'E-ticket tersedia setelah pembayaran berhasil.',
              ],
            ].map(([Icon, title, text], i) => (
              <article key={String(title)}>
                <span>0{i + 1}</span>
                <Icon size={30} />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id='cara-pesan' className='landing-process'>
        <div className='container landing-steps'>
          <div>
            <span className='landing-kicker'>Cara pesan</span>
            <h2>Tiga langkah sampai tiket siap.</h2>
            <p>Alur ringkas untuk menyelesaikan perjalanan tanpa proses.</p>
            <Link href='/schedule' className='landing-primary'>
              Mulai Sekarang
            </Link>
          </div>
          <ol>
            <li>
              <b>01</b>
              <div>
                <h3>Cari perjalanan</h3>
                <p>Tentukan kota asal, tujuan, dan tanggal.</p>
              </div>
            </li>
            <li>
              <b>02</b>
              <div>
                <h3>Pilih kursi</h3>
                <p>Pilih kursi yang tersedia pada perjalanan.</p>
              </div>
            </li>
            <li>
              <b>03</b>
              <div>
                <h3>Bayar & terima tiket</h3>
                <p>Selesaikan pembayaran dan gunakan QR saat check-in.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>
      <section className='container landing-news-callout'>
        <div>
          <span className='landing-kicker'>Media Informasi</span>
          <h2>Berita dan pengumuman terbaru.</h2>
          <p>Ikuti informasi layanan serta perjalanan HDEX Trans.</p>
        </div>
        <Link href='/news'>Lihat semua berita →</Link>
      </section>
      <section className='container news-grid'>
        {latestNews.map((item) => (
          <article className='news-card' key={item.slug}>
            {item.thumbnailPath && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnailPath} alt='' />
            )}
            <div>
              <time>{formatDateTime(item.publishedAt)}</time>
              <h2>{item.title}</h2>
              <p>{item.excerpt}</p>
              <Link href={`/news/${item.slug}`}>Baca berita →</Link>
            </div>
          </article>
        ))}
        {!latestNews.length && (
          <div className='landing-empty'>Belum ada berita diterbitkan.</div>
        )}
      </section>
      <section className='container landing-cta'>
        <div>
          <span>Mulai perjalanan</span>
          <h2>Cari jadwal dan pilih kursi sebelum keberangkatan.</h2>
        </div>
        <Link href='/schedule'>Cari Tiket Sekarang</Link>
      </section>
      <footer className='landing-footer'>
        <div className='container'>
          <div>
            <b>HX</b>
            <div>
              <strong>HDEX Trans</strong>
              <p>Pemesanan tiket bus online terintegrasi.</p>
            </div>
          </div>
          <nav>
            <Link href='/schedule'>Jadwal</Link>
            <a href='#layanan'>Layanan</a>
            <Link href='/login'>Masuk</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
