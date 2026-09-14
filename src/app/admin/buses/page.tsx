import { db } from '@/lib/db';
import { MasterCrud } from '@/components/crud/master-crud';
import {
  saveBusAction,
  toggleBusDeletedAction,
} from '@/app/actions/master-data';
export const dynamic = 'force-dynamic';
export default function Page() {
  const rows = db
    .prepare(
      `SELECT id,code,name,plate_number plateNumber,capacity,is_active FROM buses WHERE is_active=1 ORDER BY id DESC`,
    )
    .all() as never[];
  return (
    <MasterCrud
      title='Bus'
      rows={rows}
      path='/admin/buses'
      action={saveBusAction}
      toggleAction={toggleBusDeletedAction}
      toggleLabels={{
        active: 'Hapus',
        inactive: 'Pulihkan',
        confirm: 'Hapus bus ini? Data bus tetap tersimpan.',
      }}
      fields={[
        { name: 'code', label: 'Kode', required: true },
        { name: 'name', label: 'Nama', required: true },
        { name: 'plateNumber', label: 'Nomor Plat', required: true },
        {
          name: 'capacity',
          label: 'Kapasitas',
          type: 'number',
          required: true,
        },
        { name: 'is_active', label: 'Status' },
      ]}
    />
  );
}
