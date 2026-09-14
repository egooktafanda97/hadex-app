'use client';

import Link from 'next/link';
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PrinterOutlined,
  RightOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Empty, Tag, Typography } from 'antd';
import { formatDateTime } from '@/lib/format';

type Ticket = {
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
};

const statuses: Record<string, { label: string; color: string }> = {
  issued: { label: 'Aktif', color: 'green' },
  used: { label: 'Sudah Digunakan', color: 'blue' },
  cancelled: { label: 'Dibatalkan', color: 'red' },
};

export function CustomerTicketsView({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className='tickets-page'>
      <header className='tickets-heading'>
        <div>
          <span className='customer-eyebrow'>Dokumen perjalanan</span>
          <Typography.Title level={2} className='my-2!'>
            E-Ticket Saya
          </Typography.Title>
          <Typography.Text type='secondary'>
            Tunjukkan kode tiket kepada petugas saat proses check-in.
          </Typography.Text>
        </div>
        <Tag color='green' icon={<CheckCircleOutlined />}>
          {tickets.filter((ticket) => ticket.status === 'issued').length} Tiket
          Aktif
        </Tag>
      </header>

      {tickets.length ? (
        <div className='ticket-list'>
          {tickets.map((ticket) => {
            const status = statuses[ticket.status] ?? {
              label: ticket.status,
              color: 'default',
            };
            return (
              <article className='digital-ticket' key={ticket.ticket_code}>
                <div className='digital-ticket-main'>
                  <header>
                    <div>
                      <small>HDEX TRANS · E-TICKET</small>
                      <strong>{ticket.ticket_code}</strong>
                    </div>
                    <Tag color={status.color}>{status.label}</Tag>
                  </header>
                  <div className='digital-ticket-route'>
                    <div>
                      <small>ASAL</small>
                      <strong>{ticket.origin}</strong>
                      <span>{formatDateTime(ticket.departure_at)}</span>
                    </div>
                    <div className='ticket-route-line'>
                      <i />
                      <RightOutlined />
                      <i />
                    </div>
                    <div>
                      <small>TUJUAN</small>
                      <strong>{ticket.destination}</strong>
                      <span>{formatDateTime(ticket.arrival_at)}</span>
                    </div>
                  </div>
                  <dl className='digital-ticket-details'>
                    <div>
                      <dt>
                        <UserOutlined /> Penumpang
                      </dt>
                      <dd>{ticket.passenger_name}</dd>
                    </div>
                    <div>
                      <dt>Kursi</dt>
                      <dd className='ticket-seat-number'>
                        {ticket.seat_number}
                      </dd>
                    </div>
                    <div>
                      <dt>Bus</dt>
                      <dd>{ticket.bus_name}</dd>
                    </div>
                    <div>
                      <dt>Nomor Polisi</dt>
                      <dd>{ticket.plate_number}</dd>
                    </div>
                  </dl>
                </div>
                <aside className='digital-ticket-stub'>
                  <Button
                    className='ticket-print-action'
                    icon={<PrinterOutlined />}
                    onClick={(event) => {
                      const article = event.currentTarget.closest('article');
                      document.querySelectorAll('.ticket-print-selected').forEach((node) => node.classList.remove('ticket-print-selected'));
                      article?.classList.add('ticket-print-selected');
                      window.print();
                    }}
                    block
                  >
                    Cetak Tiket / PDF
                  </Button>
                  <span className='ticket-stub-icon'>
                    <FileTextOutlined />
                  </span>
                  <small>KODE BOOKING</small>
                  <strong>{ticket.booking_code}</strong>
                  <p>
                    <CalendarOutlined /> {formatDateTime(ticket.departure_at)}
                  </p>
                  <p>
                    <EnvironmentOutlined /> {ticket.origin} —{' '}
                    {ticket.destination}
                  </p>
                  <Link href={`/customer/bookings/${ticket.booking_id}`}>
                    <Button type='primary' block>
                      Detail Booking
                    </Button>
                  </Link>
                </aside>
              </article>
            );
          })}
        </div>
      ) : (
        <section className='tickets-empty'>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                <b>Belum ada tiket</b>
                <small>
                  Tiket diterbitkan setelah bukti pembayaran diverifikasi admin.
                </small>
              </span>
            }
          >
            <Link href='/customer/bookings'>
              <Button type='primary'>Lihat Booking</Button>
            </Link>
          </Empty>
        </section>
      )}
    </div>
  );
}
