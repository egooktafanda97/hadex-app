'use client';

import Link from 'next/link';
import { Button, Card, Empty, Table, Tag, Typography } from 'antd';
import { cancelBookingAction } from '@/app/actions/customer';
import { formatDateTime, formatRupiah } from '@/lib/format';

type BookingRow = {
  id: string;
  booking_code: string;
  origin: string;
  destination: string;
  departure_at: string;
  grand_total: number;
  status: string;
};

const statusMeta: Record<string, { label: string; color: string }> = {
  pending_payment: { label: 'Menunggu Pembayaran', color: 'gold' },
  confirmed: { label: 'Terkonfirmasi', color: 'green' },
  completed: { label: 'Selesai', color: 'blue' },
  cancelled: { label: 'Dibatalkan', color: 'red' },
  expired: { label: 'Kedaluwarsa', color: 'default' },
};

export function CustomerBookingsTable({ rows }: { rows: BookingRow[] }) {
  const columns = [
    {
      title: 'Kode',
      dataIndex: 'booking_code',
      render: (value: string) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: 'Rute',
      render: (_: unknown, row: BookingRow) => (
        <span>
          {row.origin} — {row.destination}
        </span>
      ),
    },
    {
      title: 'Berangkat',
      dataIndex: 'departure_at',
      render: (value: string) => formatDateTime(value),
    },
    {
      title: 'Total',
      dataIndex: 'grand_total',
      render: (value: number) => (
        <Typography.Text strong>{formatRupiah(value)}</Typography.Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => {
        const meta = statusMeta[value] ?? { label: value, color: 'default' };
        return <Tag color={meta.color}>{meta.label}</Tag>;
      },
    },
    {
      title: 'Aksi',
      render: (_: unknown, row: BookingRow) => (
        <div className='flex gap-2'>
          <Link href={`/customer/bookings/${row.id}`}>
            <Button>Detail</Button>
          </Link>
          {row.status === 'pending_payment' && (
            <form action={cancelBookingAction}>
              <input type='hidden' name='id' value={row.id} />
              <Button danger htmlType='submit'>
                Batalkan
              </Button>
            </form>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='mb-6'>
        <Typography.Title level={2} className='mb-1!'>
          Booking Saya
        </Typography.Title>
        <Typography.Text type='secondary'>
          Kelola perjalanan dan pembayaran booking Anda.
        </Typography.Text>
      </div>
      <Card className='rounded-2xl! border-slate-200! shadow-sm!'>
        {rows.length ? (
          <Table
            rowKey='id'
            dataSource={rows}
            columns={columns}
            scroll={{ x: 900 }}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        ) : (
          <Empty description='Belum ada booking'>
            <Link href='/schedule'>
              <Button type='primary'>Cari Perjalanan</Button>
            </Link>
          </Empty>
        )}
      </Card>
    </>
  );
}
