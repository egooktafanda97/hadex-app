import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/dal';
import { getBooking } from '@/repositories/booking.repository';
import { canAccessBooking } from '@/lib/permissions';
import { formatDateTime, formatRupiah } from '@/lib/format';
import { PaymentButton } from '@/components/payment-button';
export const dynamic = 'force-dynamic';
export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const user = await requireUser(['customer']);
  const { id } = { id: (await params).bookingId };
  const data = getBooking(id);
  if (
    !data ||
    !canAccessBooking(user.role, user.id, String(data.booking.user_id))
  )
    notFound();
  const b = data.booking;
  return (
    <>
      <span className='badge'>{String(b.status)}</span>
      <h1 className='text-3xl font-black my-3'>{String(b.booking_code)}</h1>
      <div className='grid md:grid-cols-2 gap-5'>
        <section className='card p-6'>
          <h2 className='font-black text-xl mb-4'>Perjalanan</h2>
          <p>
            {String(b.origin)} — {String(b.destination)}
          </p>
          <p className='text-gray-600'>
            {formatDateTime(String(b.departure_at))}
          </p>
          <h3 className='font-bold mt-5'>Penumpang</h3>
          {data.passengers.map((p) => (
            <p key={String((p as Record<string, unknown>).id)}>
              {String((p as Record<string, unknown>).name)} · Kursi{' '}
              {String((p as Record<string, unknown>).seat_number)}
            </p>
          ))}
        </section>
        <aside className='card p-6 h-fit'>
          <p className='text-gray-500'>Total pembayaran</p>
          <div className='price text-3xl my-2'>
            {formatRupiah(Number(b.grand_total))}
          </div>
          <p className='mb-5'>
            Status: <b>{String(b.payment_status)}</b>
          </p>
          {b.status === 'pending_payment' && (
            <PaymentButton
              bookingId={id}
              paymentStatus={String(b.payment_status)}
              proofPath={b.proof_path ? String(b.proof_path) : null}
              verificationNote={
                b.verification_note ? String(b.verification_note) : null
              }
            />
          )}
        </aside>
      </div>
    </>
  );
}
