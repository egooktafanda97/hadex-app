import Link from 'next/link';
import { db } from '@/lib/db';
import { NewsTable, type NewsRow } from '@/components/news-table';

export const dynamic = 'force-dynamic';

export default function Page() {
  const rows = db
    .prepare(
      `SELECT id,title,slug,status,updated_at updatedAt FROM news WHERE deleted_at IS NULL ORDER BY updated_at DESC`,
    )
    .all() as NewsRow[];
  return (
    <>
      <div className='mb-6 flex items-center justify-between'>
        <h2 className='m-0 text-3xl font-semibold'>Berita</h2>
        <Link
          className='rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
          href='/admin/news/new'
        >
          Tambah berita
        </Link>
      </div>
      <NewsTable rows={rows} />
    </>
  );
}
