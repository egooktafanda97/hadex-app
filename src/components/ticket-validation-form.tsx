'use client';

import { useRef, useState } from 'react';
import { Alert, Button, Card, Checkbox, Descriptions, Input, Select, Typography } from 'antd';
import { formatDateTime } from '@/lib/format';
import type { TicketValidation } from '@/services/ticket-validation.service';

export function TicketValidationForm({ trips }: { trips: { value: string; label: string }[] }) {
  const [code, setCode] = useState('');
  const [passengerName, setPassengerName] = useState('');
  const [tripId, setTripId] = useState<string>();
  const [ticket, setTicket] = useState<TicketValidation | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [canCorrectName, setCanCorrectName] = useState(false);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const pending = useRef(false);

  function resetResult() {
    setTicket(null);
    setError('');
    setCanCorrectName(false);
    setIdentityConfirmed(false);
  }

  async function submit(action: 'inspect' | 'checkin' | 'correct-name') {
    if (pending.current) return;
    if (!code.trim() || !passengerName.trim() || !tripId) {
      setError('Nomor tiket, nama penumpang, dan perjalanan wajib diisi.');
      return;
    }
    pending.current = true;
    setBusy(true);
    setError('');
    const ticketCode = action === 'checkin' ? ticket?.ticket_code : code;
    setTicket(null);
    try {
      const response = await fetch('/api/admin/tickets', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode, passengerName, tripId, action, identityConfirmed }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCanCorrectName(data.code === 'LEGACY_TICKET_NAME' || action === 'correct-name');
        throw new Error(data.error || 'Validasi tiket gagal.');
      }
      setCanCorrectName(false);
      setIdentityConfirmed(false);
      setTicket(data.ticket);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Koneksi gagal. Silakan coba lagi.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <div className='max-w-3xl grid gap-5'>
      <div>
        <Typography.Title level={2}>Validasi Tiket</Typography.Title>
        <Typography.Paragraph>Masukkan nomor tiket, nama lengkap penumpang, dan pilih perjalanan yang sesuai. Ketiganya harus cocok sebelum check-in. Check-in akan menandai tiket sebagai sudah digunakan.</Typography.Paragraph>
      </div>
      <Card>
        <form className='grid gap-3' onSubmit={(event) => { event.preventDefault(); void submit('inspect'); }}>
          <label htmlFor='ticket-code'>Nomor tiket</label>
          <Input id='ticket-code' value={code} maxLength={64} required disabled={busy} placeholder='Contoh: TKT-0123456789' autoComplete='off' onChange={(event) => { setCode(event.target.value); resetResult(); }} />
          <label htmlFor='passenger-name'>Nama lengkap penumpang</label>
          <Input id='passenger-name' value={passengerName} maxLength={80} required disabled={busy} placeholder='Nama lengkap sesuai identitas penumpang' autoComplete='off' onChange={(event) => { setPassengerName(event.target.value); resetResult(); }} />
          <label htmlFor='validation-trip'>Perjalanan</label>
          <Select id='validation-trip' value={tripId} options={trips} showSearch optionFilterProp='label' allowClear disabled={busy} placeholder='Cari kode perjalanan, rute, tanggal, atau bus' notFoundContent='Perjalanan tidak ditemukan' aria-required='true' onChange={(value) => { setTripId(value); resetResult(); }} />
          <Button htmlType='submit' type='primary' loading={busy} disabled={!code.trim() || !passengerName.trim() || !tripId}>Periksa Tiket</Button>
        </form>
      </Card>
      {error && <Alert type='error' showIcon title={error} role='alert' />}
      {canCorrectName && <Card title='Koreksi nama tiket lama'>
        <Typography.Paragraph>Nama otomatis pada tiket <strong>{code.trim().toUpperCase()}</strong> akan diganti menjadi <strong>{passengerName.trim()}</strong>. Perubahan tersimpan pada tiket pelanggan dan dicatat di audit log.</Typography.Paragraph>
        <Checkbox checked={identityConfirmed} disabled={busy} onChange={(event) => setIdentityConfirmed(event.target.checked)}>Saya sudah memeriksa identitas penumpang dan memastikan nama ini benar.</Checkbox>
        <Button className='mt-4' type='primary' loading={busy} disabled={!identityConfirmed || passengerName.trim().length < 2} onClick={() => void submit('correct-name')}>Simpan Nama dan Validasi</Button>
      </Card>}
      {ticket && <Card title={ticket.ticket_code}>
        <Alert className='mb-4' showIcon type={ticket.valid ? 'success' : 'info'} title={ticket.message} />
        <Descriptions column={1} items={[
          { key: 'name', label: 'Penumpang', children: ticket.passenger_name },
          { key: 'booking', label: 'Kode booking', children: ticket.booking_code },
          { key: 'route', label: 'Rute', children: `${ticket.origin} → ${ticket.destination}` },
          { key: 'departure', label: 'Keberangkatan', children: formatDateTime(ticket.departure_at) },
          { key: 'bus', label: 'Bus / Nomor polisi', children: `${ticket.bus_name} / ${ticket.plate_number}` },
          { key: 'seat', label: 'Kursi', children: ticket.seat_number },
          { key: 'status', label: 'Status tiket', children: ({ issued: 'Aktif', used: 'Sudah digunakan', cancelled: 'Dibatalkan' })[ticket.status] ?? ticket.status },
          ...(ticket.used_at ? [{ key: 'used', label: 'Waktu check-in', children: formatDateTime(ticket.used_at) }] : []),
        ]} />
        {ticket.valid && <Button type='primary' className='mt-4' loading={busy} onClick={() => void submit('checkin')}>Konfirmasi Check-in</Button>}
      </Card>}
    </div>
  );
}
