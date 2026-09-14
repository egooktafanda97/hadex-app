'use client';

import Link from 'next/link';
import {
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SearchOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { Button, Card, Empty, Tag } from 'antd';

type Booking = {
  id: string;
  booking_code: string;
  origin: string;
  destination: string;
  departure_at: string;
  grand_total: number;
  status: string;
  payment_status: string;
};

type Props = {
  name: string;
  stats: { total: number; confirmed: number; pending: number; paid: number };
  bookings: Booking[];
  nextTrip?: Booking;
};

const statusLabel: Record<string, string> = {
  confirmed: 'Terkonfirmasi',
  pending_payment: 'Menunggu pembayaran',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
};

const statusColor: Record<string, string> = {
  confirmed: 'green',
  pending_payment: 'gold',
  completed: 'blue',
  cancelled: 'red',
  expired: 'default',
};

export function CustomerDashboard({ name, stats, bookings, nextTrip }: Props) {
  return (
    <div className='customer-dashboard'>
      <section className='customer-welcome'>
        <div>
          <span className='customer-eyebrow'>Ruang perjalananmu</span>
          <h1>Selamat datang, {name.split(' ')[0]}.</h1>
          <p>Pantau booking, tiket, dan perjalananmu dari satu tempat.</p>
        </div>
        <div className='customer-welcome-mark'>
          <FileTextOutlined />
        </div>
      </section>

      <div className='customer-stat-grid'>
        <Card className='customer-stat-card customer-stat-card--primary'>
          <span>Total booking</span>
          <strong>{stats.total}</strong>
          <small>Semua perjalananmu</small>
        </Card>
        <Card className='customer-stat-card'>
          <span>Terkonfirmasi</span>
          <strong>{stats.confirmed}</strong>
          <small className='customer-stat-positive'>
            <CheckCircleOutlined /> Siap berangkat
          </small>
        </Card>
        <Card className='customer-stat-card'>
          <span>Menunggu pembayaran</span>
          <strong>{stats.pending}</strong>
          <small>
            <WalletOutlined /> Perlu ditindaklanjuti
          </small>
        </Card>
        <Card className='customer-stat-card'>
          <span>Total dibayar</span>
          <strong>Rp {stats.paid.toLocaleString('id-ID')}</strong>
          <small>Riwayat transaksi</small>
        </Card>
      </div>

      <section className='customer-content-grid'>
        <div className='customer-main-column'>
          {nextTrip ? (
            <Card
              className='next-trip-card'
              title={
                <span>
                  <CalendarOutlined /> Perjalanan berikutnya
                </span>
              }
              extra={
                <Tag color='green'>
                  {statusLabel[nextTrip.status] ?? nextTrip.status}
                </Tag>
              }
            >
              <div className='next-trip-route'>
                <div>
                  <small>ASAL</small>
                  <strong>{nextTrip.origin}</strong>
                </div>
                <ArrowRightOutlined />
                <div>
                  <small>TUJUAN</small>
                  <strong>{nextTrip.destination}</strong>
                </div>
              </div>
              <div className='next-trip-meta'>
                <span>
                  <CalendarOutlined /> {nextTrip.departure_at}
                </span>
                <span>
                  Kode <b>{nextTrip.booking_code}</b>
                </span>
              </div>
              <Link href={`/customer/bookings/${nextTrip.id}`}>
                <Button type='primary' block>
                  Lihat detail perjalanan <ArrowRightOutlined />
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className='next-trip-card'>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='Belum ada perjalanan berikutnya'
              >
                <Link href='/schedule'>
                  <Button type='primary' icon={<SearchOutlined />}>
                    Cari perjalanan
                  </Button>
                </Link>
              </Empty>
            </Card>
          )}

          <Card
            className='recent-bookings-card'
            title='Booking terbaru'
            extra={
              <Link className='customer-card-link' href='/customer/bookings'>
                Lihat semua <ArrowRightOutlined />
              </Link>
            }
          >
            {bookings.length ? (
              <div className='recent-booking-list'>
                {bookings.map((booking) => (
                  <Link
                    className='recent-booking-row'
                    href={`/customer/bookings/${booking.id}`}
                    key={booking.id}
                  >
                    <span className='recent-booking-icon'>
                      <FileTextOutlined />
                    </span>
                    <span className='recent-booking-info'>
                      <b>
                        {booking.origin} <span>ke</span> {booking.destination}
                      </b>
                      <small>
                        {booking.booking_code} · {booking.departure_at}
                      </small>
                    </span>
                    <span className='recent-booking-status'>
                      <Tag color={statusColor[booking.status] ?? 'default'}>
                        {statusLabel[booking.status] ?? booking.status}
                      </Tag>
                      <ArrowRightOutlined />
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description='Belum ada booking'
              />
            )}
          </Card>
        </div>

        <aside className='customer-side-column'>
          <Card className='quick-actions-card' title='Akses cepat'>
            <Link href='/schedule' className='quick-action'>
              <span className='quick-action-icon'>
                <SearchOutlined />
              </span>
              <span>
                <b>Cari perjalanan</b>
                <small>Temukan rute terbaik untukmu</small>
              </span>
              <ArrowRightOutlined />
            </Link>
            <Link href='/customer/tickets' className='quick-action'>
              <span className='quick-action-icon'>
                <FileTextOutlined />
              </span>
              <span>
                <b>Tiket saya</b>
                <small>Akses tiket dan QR check-in</small>
              </span>
              <ArrowRightOutlined />
            </Link>
            <Link href='/customer/profile' className='quick-action'>
              <span className='quick-action-icon'>
                <CheckCircleOutlined />
              </span>
              <span>
                <b>Perbarui profil</b>
                <small>Pastikan data tetap lengkap</small>
              </span>
              <ArrowRightOutlined />
            </Link>
          </Card>
          <Card className='customer-help-card'>
            <span className='customer-eyebrow'>Butuh bantuan?</span>
            <h3>Kami siap menemani perjalananmu.</h3>
            <p>
              Periksa detail booking atau hubungi tim HDEX jika membutuhkan
              bantuan.
            </p>
            <Link href='/customer/bookings'>
              Buka booking <ArrowRightOutlined />
            </Link>
          </Card>
        </aside>
      </section>
    </div>
  );
}
