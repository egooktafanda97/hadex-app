import { db } from '@/lib/db';
import { PaymentReviewTable } from '@/components/payment-review-table';

export const dynamic = 'force-dynamic';
export default function Page() {
  const rows = db
    .prepare(
      `SELECT p.id,b.booking_code,u.name customer,p.amount,p.status,p.proof_path,p.created_at,p.verification_note FROM payments p JOIN bookings b ON b.id=p.booking_id JOIN users u ON u.id=b.user_id ORDER BY p.created_at DESC`,
    )
    .all() as {
    id: string;
    booking_code: string;
    customer: string;
    amount: number;
    status: string;
    proof_path: string | null;
    created_at: string;
    verification_note: string | null;
  }[];
  return <PaymentReviewTable rows={rows} />;
}
