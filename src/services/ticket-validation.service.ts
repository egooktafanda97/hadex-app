import 'server-only';
import { db } from '@/lib/db';
import { audit } from '@/lib/audit';

export type TicketValidation = {
  id: string; ticket_code: string; status: string; used_at: string | null;
  booking_code: string; booking_status: string; payment_status: string | null;
  passenger_name: string; seat_number: string; departure_at: string;
  origin: string; destination: string; bus_name: string; plate_number: string;
  trip_id: string; trip_status: string; valid: boolean; message: string;
};

export type TicketValidationCriteria = { passengerName: string; tripId: string };
const normalizeName = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('id-ID');
const isAutomaticName = (name: string) => /^penumpang\s+\d+$/i.test(name.trim());

export class LegacyTicketNameError extends Error {
  constructor() {
    super('Tiket lama masih menggunakan nama otomatis. Periksa identitas penumpang, lalu simpan nama yang benar melalui tombol koreksi di bawah.');
  }
}

export function inspectTicket(code: string, criteria: TicketValidationCriteria): TicketValidation {
  const ticket = db.prepare(`
    SELECT tk.id,tk.ticket_code,tk.status,tk.used_at,b.booking_code,b.status booking_status,
      p.status payment_status,bp.name passenger_name,bs.seat_number,t.departure_at,t.id trip_id,
      o.city origin,d.city destination,bu.name bus_name,bu.plate_number,t.status trip_status
    FROM tickets tk JOIN bookings b ON b.id=tk.booking_id
    JOIN booking_passengers bp ON bp.id=tk.passenger_id
    JOIN trip_seats ts ON ts.id=bp.seat_id JOIN bus_seats bs ON bs.id=ts.bus_seat_id
    JOIN trips t ON t.id=b.trip_id JOIN routes r ON r.id=t.route_id
    JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id
    JOIN buses bu ON bu.id=t.bus_id LEFT JOIN payments p ON p.booking_id=b.id
    WHERE tk.ticket_code=?
  `).get(code.trim().toUpperCase()) as TicketValidation | undefined;
  if (!ticket) throw new Error('Nomor tiket tidak ditemukan. Periksa kembali nomor tiket.');
  if (!criteria?.passengerName?.trim() || !criteria?.tripId?.trim()) throw new Error('Nama penumpang dan perjalanan wajib diisi.');
  if (ticket.trip_id !== criteria.tripId.trim()) throw new Error('Tiket tidak sesuai dengan perjalanan yang dipilih.');
  if (isAutomaticName(ticket.passenger_name)) throw new LegacyTicketNameError();
  if (normalizeName(ticket.passenger_name) !== normalizeName(criteria.passengerName)) throw new Error('Nama penumpang tidak sesuai dengan tiket.');
  let message = 'Tiket valid dan siap untuk check-in.';
  let valid = false;
  if (ticket.status === 'used') message = 'Tiket sudah digunakan.';
  else if (ticket.status !== 'issued') message = 'Tiket dibatalkan atau tidak aktif.';
  else if (ticket.booking_status !== 'confirmed') message = 'Booking tidak aktif atau belum dikonfirmasi.';
  else if (ticket.payment_status !== 'paid') message = 'Pembayaran belum lunas atau telah dikembalikan.';
  else if (!['scheduled', 'boarding', 'departed'].includes(ticket.trip_status)) message = 'Perjalanan sudah selesai atau dibatalkan.';
  else valid = true;
  return { ...ticket, valid, message };
}

export function correctLegacyTicketName(code: string, userId: string, criteria: TicketValidationCriteria): TicketValidation {
  const name = criteria.passengerName.normalize('NFKC').trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 80 || isAutomaticName(name)) throw new Error('Masukkan nama lengkap sebenarnya (2–80 karakter).');
  return db.transaction(() => {
    const row = db.prepare(`SELECT bp.id,bp.name,b.trip_id,tk.status FROM tickets tk
      JOIN booking_passengers bp ON bp.id=tk.passenger_id JOIN bookings b ON b.id=tk.booking_id
      WHERE tk.ticket_code=?`).get(code.trim().toUpperCase()) as { id: string; name: string; trip_id: string; status: string } | undefined;
    if (!row) throw new Error('Nomor tiket tidak ditemukan.');
    if (row.trip_id !== criteria.tripId.trim()) throw new Error('Tiket tidak sesuai dengan perjalanan yang dipilih.');
    if (row.status !== 'issued') throw new Error('Hanya tiket aktif yang dapat dikoreksi.');
    if (!isAutomaticName(row.name)) throw new Error('Nama tiket sudah diisi. Koreksi hanya tersedia untuk nama otomatis pada tiket lama.');
    const updated = db.prepare('UPDATE booking_passengers SET name=?,updated_at=? WHERE id=? AND name=?').run(name, new Date().toISOString(), row.id, row.name);
    if (updated.changes !== 1) throw new Error('Data berubah. Silakan periksa tiket kembali.');
    const ticket = inspectTicket(code, { ...criteria, passengerName: name });
    if (!ticket.valid) throw new Error(ticket.message);
    audit('ticket.passenger_name_corrected', 'BookingPassenger', row.id, userId, { name: row.name }, { name, ticket_code: ticket.ticket_code });
    return { ...ticket, message: 'Nama penumpang berhasil diperbaiki. Tiket valid dan siap untuk check-in.' };
  })();
}

export function checkInTicketByCode(code: string, userId: string, criteria: TicketValidationCriteria): TicketValidation {
  return db.transaction(() => {
    const ticket = inspectTicket(code, criteria);
    if (!ticket.valid) throw new Error(ticket.message);
    const now = new Date().toISOString();
    const updated = db.prepare("UPDATE tickets SET status='used',used_at=?,updated_at=? WHERE id=? AND status='issued'").run(now, now, ticket.id);
    if (updated.changes !== 1) throw new Error('Tiket sudah digunakan.');
    audit('ticket.checked_in', 'Ticket', ticket.id, userId, { status: 'issued' }, { status: 'used', ticket_code: ticket.ticket_code });
    return { ...ticket, status: 'used', used_at: now, valid: false, message: 'Check-in berhasil. Tiket telah ditandai sebagai digunakan.' };
  })();
}
