import { auth } from '@/auth';
import { db } from '@/lib/db';
import { inspectTicket, checkInTicketByCode, correctLegacyTicketName, LegacyTicketNameError } from '@/services/ticket-validation.service';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user?.id
    ? db.prepare('SELECT id,role,is_active FROM users WHERE id=?').get(session.user.id) as { id: string; role: string; is_active: number } | undefined
    : undefined;
  if (!user?.is_active || user.role !== 'admin') {
    return Response.json({ error: 'Akses ditolak' }, { status: 403 });
  }
  const parsed = z.object({
    ticketCode: z.string().trim().min(1).max(64),
    passengerName: z.string().trim().min(1).max(200),
    tripId: z.string().trim().min(1).max(64),
    action: z.enum(['inspect', 'checkin', 'correct-name']),
    identityConfirmed: z.boolean().optional(),
  }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Nomor tiket, nama penumpang, dan perjalanan wajib diisi dengan benar.' }, { status: 400 });
  try {
    if (parsed.data.action === 'correct-name' && parsed.data.identityConfirmed !== true) {
      return Response.json({ error: 'Konfirmasi bahwa identitas penumpang sudah diperiksa.' }, { status: 400 });
    }
    const ticket = parsed.data.action === 'checkin'
      ? checkInTicketByCode(parsed.data.ticketCode, user.id, parsed.data)
      : parsed.data.action === 'correct-name'
      ? correctLegacyTicketName(parsed.data.ticketCode, user.id, parsed.data)
      : inspectTicket(parsed.data.ticketCode, parsed.data);
    if (parsed.data.action !== 'inspect') {
      revalidatePath('/customer/tickets');
      revalidatePath('/customer/bookings', 'layout');
      revalidatePath('/admin/tickets');
    }
    return Response.json({ ticket }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Validasi tiket gagal.', code: error instanceof LegacyTicketNameError ? 'LEGACY_TICKET_NAME' : undefined }, { status: 400 });
  }
}
