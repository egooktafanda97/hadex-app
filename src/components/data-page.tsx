import { db } from "@/lib/db";
import { DataTable } from "@/components/data-table";

const queries = {
  trips: `SELECT trip_code kode,departure_at berangkat,status,fare harga FROM trips ORDER BY departure_at DESC`,
  bookings: `SELECT booking_code kode,status,grand_total total,created_at dibuat FROM bookings ORDER BY created_at DESC`,
  payments: `SELECT gateway,status,amount nominal,created_at dibuat FROM payments ORDER BY created_at DESC`,
  users: `SELECT name nama,email,role,is_active aktif FROM users ORDER BY created_at DESC`,
  buses: `SELECT code kode,name nama,plate_number plat,capacity kapasitas,is_active aktif FROM buses`,
  routes: `SELECT o.city asal,d.city tujuan,r.duration_minutes durasi_menit,r.is_active aktif FROM routes r JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id`,
} as const;

export function DataPage({ title, kind }: { title: string; kind: keyof typeof queries }) {
  const rows = db.prepare(queries[kind]).all() as Record<string, unknown>[];
  return <DataTable title={title} rows={rows}/>;
}
