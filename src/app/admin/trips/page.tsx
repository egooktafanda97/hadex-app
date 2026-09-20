import { db } from '@/lib/db';
import { MasterCrud } from '@/components/crud/master-crud';
import { cancelTripAction, saveTripAction } from '@/app/actions/master-data';
export const dynamic = 'force-dynamic';
export default function Page() {
  const buses = db
    .prepare(
      `SELECT id,code,name FROM buses WHERE is_active=1 ORDER BY id DESC`,
    )
    .all() as { id: string; code: string; name: string }[];
  const routes = db
    .prepare(
      `SELECT r.id,o.city origin,d.city destination FROM routes r JOIN locations o ON o.id=r.origin_id JOIN locations d ON d.id=r.destination_id WHERE r.is_active=1 ORDER BY r.id DESC`,
    )
    .all() as { id: string; origin: string; destination: string }[];
  const rows = db
    .prepare(
      `SELECT id,trip_code tripCode,bus_id busId,route_id routeId,departure_at departureAt,arrival_at arrivalAt,fare,status FROM trips ORDER BY id DESC`,
    )
    .all() as never[];
  return (
    <MasterCrud
      title='Perjalanan'
      rows={rows}
      path='/admin/trips'
      action={saveTripAction}
      cancelAction={cancelTripAction}
      fields={[
        {
          name: 'tripCode',
          label: 'Kode Trip',
          required: true,
          minLength: 4,
          maxLength: 40,
        },
        {
          name: 'busId',
          label: 'Bus',
          type: 'select',
          options: buses.map((b) => ({
            value: b.id,
            label: `${b.code} - ${b.name}`,
          })),
          required: true,
        },
        {
          name: 'routeId',
          label: 'Rute',
          type: 'select',
          options: routes.map((r) => ({
            value: r.id,
            label: `${r.origin} - ${r.destination}`,
          })),
          required: true,
        },
        {
          name: 'departureAt',
          label: 'Berangkat',
          type: 'datetime',
          required: true,
          defaultMinutesFromNow: 0,
        },
        {
          name: 'arrivalAt',
          label: 'Tiba',
          type: 'datetime',
          required: true,
          defaultMinutesFromNow: 210,
        },
        { name: 'fare', label: 'Harga', type: 'currency', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'scheduled', label: 'Terjadwal' },
            { value: 'boarding', label: 'Boarding' },
            { value: 'departed', label: 'Berangkat' },
            { value: 'arrived', label: 'Tiba' },
            { value: 'cancelled', label: 'Dibatalkan' },
          ],
          required: true,
        },
      ]}
    />
  );
}
