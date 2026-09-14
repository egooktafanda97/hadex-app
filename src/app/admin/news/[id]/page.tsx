import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { NewsEditorForm } from '@/components/news-editor-form';

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const news = db
    .prepare(
      'SELECT id,title,excerpt,content_html,thumbnail_path,status FROM news WHERE id=? AND deleted_at IS NULL',
    )
    .get(id) as
    | {
        id: string;
        title: string;
        excerpt: string;
        content_html: string;
        thumbnail_path: string | null;
        status: string;
      }
    | undefined;
  if (!news) notFound();
  return (
    <>
      <h2 className='mb-4 text-3xl font-semibold'>Edit Berita</h2>
      <NewsEditorForm news={news} />
    </>
  );
}
