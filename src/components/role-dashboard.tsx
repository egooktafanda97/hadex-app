import { db } from '@/lib/db';
import { formatRupiah } from '@/lib/format';
import { formatDateTime } from '@/lib/format';
import type { Role } from '@/lib/permissions';
import { DashboardView } from '@/components/dashboard-view';
import { CustomerDashboard } from '@/components/customer-dashboard';

export function RoleDashboard({
  role,
  userId,
  name,
}: {
  role: Role;
  userId: string;
  name?: string;
}) {
  const where = role === 'customer' ? 'WHERE b.user_id=?' : '';
  const args = role === 'customer' ? [userId] : [];
  const stats = db
    .prepare(
      `SELECT COUNT(*) total, SUM(CASE WHEN b.status='confirmed' THEN 1 ELSE 0 END) confirmed, SUM(CASE WHEN b.status='pending_payment' THEN 1 ELSE 0 END) pending, COALESCE(SUM(CASE WHEN p.status='paid' THEN p.amount ELSE 0 END),0) revenue FROM bookings b LEFT JOIN payments p ON p.booking_id=b.id ${where}`,
    )
    .get(...args) as {
    total: number;
    confirmed: number;
    pending: number;
    revenue: number;
  };
  if (role === 'customer') {
    const bookings = db
      .prepare(
        `SELECT b.id,b.booking_code,o.city origin,d.city destination,t.departure_at,b.grand_total,b.status,p.status payment_status FROM bookings b JOIN trips t ON t.id=b.trip_id JOIN routes r ON r.id=t.route_id JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id LEFT JOIN payments p ON p.booking_id=b.id WHERE b.user_id=? ORDER BY b.created_at DESC LIMIT 5`,
      )
      .all(userId) as {
      id: string;
      booking_code: string;
      origin: string;
      destination: string;
      departure_at: string;
      grand_total: number;
      status: string;
      payment_status: string;
    }[];
    const present = bookings.map((booking) => ({
      ...booking,
      departure_at: formatDateTime(booking.departure_at),
    }));
    const next = present.find(
      (booking) =>
        booking.status === 'confirmed' || booking.status === 'pending_payment',
    );
    return (
      <CustomerDashboard
        name={name ?? 'Pelanggan'}
        stats={{
          total: stats.total,
          confirmed: stats.confirmed ?? 0,
          pending: stats.pending ?? 0,
          paid: stats.revenue ?? 0,
        }}
        bookings={present}
        nextTrip={next}
      />
    );
  }
  const trips = (db
    .prepare(
      "SELECT COUNT(*) count FROM trips WHERE date(departure_at)=date('now')",
    )
    .get() as { count: number }).count;
  const titles = {
    customer: 'Ringkasan perjalananmu',
    operator: 'Operasional hari ini',
    admin: 'Kontrol bisnis HDEX',
    owner: 'Ringkasan manajemen',
  };
  return (
    <DashboardView
      role={role}
      title={titles[role]}
      stats={[
        { title: 'Total booking', value: stats.total },
        { title: 'Terkonfirmasi', value: stats.confirmed },
        { title: 'Perjalanan hari ini', value: trips },
        { title: 'Pendapatan', value: formatRupiah(stats.revenue) },
      ]}
    />
  );
}
