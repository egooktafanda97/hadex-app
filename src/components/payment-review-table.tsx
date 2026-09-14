'use client';
import { useState } from 'react';
import { Button, Card, Empty, Input, Table, Tag } from 'antd';
import {
  rejectPaymentAction,
  verifyPaymentAction,
  type PaymentActionResult,
} from '@/app/actions/payment';

type Payment = {
  id: string;
  booking_code: string;
  customer: string;
  amount: number;
  status: string;
  proof_path: string | null;
  created_at: string;
  verification_note: string | null;
};
export function PaymentReviewTable({ rows }: { rows: Payment[] }) {
  const [note, setNote] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const [feedback, setFeedback] = useState<Record<string, PaymentActionResult>>({});
  async function submit(
    action: (form: FormData) => Promise<PaymentActionResult>,
    paymentId: string,
  ) {
    setBusy(paymentId);
    setFeedback((current) => ({ ...current, [paymentId]: { ok: true, message: '' } }));
    try {
      const form = new FormData();
      form.set('paymentId', paymentId);
      form.set('note', note[paymentId] || '');
      const result = await action(form);
      if (!result.ok) {
        setFeedback((current) => ({ ...current, [paymentId]: result }));
        return;
      }
      location.reload();
    } catch {
      setFeedback((current) => ({ ...current, [paymentId]: { ok: false, message: 'Aksi pembayaran gagal' } }));
    } finally {
      setBusy('');
    }
  }
  const columns = [
    { title: 'Booking', dataIndex: 'booking_code' },
    { title: 'Customer', dataIndex: 'customer' },
    {
      title: 'Nominal',
      dataIndex: 'amount',
      render: (value: number) => `Rp ${value.toLocaleString('id-ID')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (value: string) => (
        <Tag
          color={
            value === 'awaiting_verification'
              ? 'orange'
              : value === 'paid'
              ? 'green'
              : 'red'
          }
        >
          {value}
        </Tag>
      ),
    },
    {
      title: 'Bukti',
      dataIndex: 'proof_path',
      render: (value: string | null) =>
        value ? (
          <a href={value} target='_blank' rel='noreferrer'>
            Lihat bukti
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: 'Catatan / Aksi',
      key: 'action',
      render: (_: unknown, row: Payment) =>
        row.status === 'awaiting_verification' ? (
          <div className='space-y-2'>
            <Input
              placeholder='Alasan jika ditolak'
              value={note[row.id] || ''}
              onChange={(event) =>
                setNote({ ...note, [row.id]: event.target.value })
              }
            />
            <Button
              type='primary'
              loading={busy === row.id}
              onClick={() => submit(verifyPaymentAction, row.id)}
            >
              Verifikasi
            </Button>{' '}
            <Button
              danger
              loading={busy === row.id}
              onClick={() => submit(rejectPaymentAction, row.id)}
            >
              Tolak
            </Button>
            {feedback[row.id]?.message && (
              <p className={feedback[row.id].ok ? 'text-green-600' : 'text-red-600'}>
                {feedback[row.id].message}
              </p>
            )}
          </div>
        ) : (
          row.verification_note || '-'
        ),
    },
  ];
  return (
    <Card title='Pembayaran manual'>
      {rows.length ? (
        <Table
          rowKey='id'
          dataSource={rows}
          columns={columns}
          scroll={{ x: true }}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <Empty description='Belum ada pembayaran' />
      )}
    </Card>
  );
}
