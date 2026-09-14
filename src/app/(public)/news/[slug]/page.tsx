import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
export const dynamic = 'force-dynamic';
type News = {
  title: string;
  excerpt: string;
  contentHtml: string;
  thumbnailPath: string | null;
  publishedAt: string;
  author: string;
};
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = db
    .prepare(
      `SELECT n.title,n.excerpt,n.content_html contentHtml,n.thumbnail_path thumbnailPath,n.published_at publishedAt,u.name author FROM news n JOIN users u ON u.id=n.author_id WHERE n.slug=? AND n.status='published' AND n.deleted_at IS NULL`,
    )
    .get(slug) as News | undefined;
  if (!news) notFound();
  return (
    <main className='news-detail container'>
      <Link href='/news'>← Semua berita</Link>
      <article>
        {news.thumbnailPath && (
          <img src={news.thumbnailPath} alt={news.title} />
        )}
        <time>
          {formatDateTime(news.publishedAt)} · {news.author}
        </time>
        <h1>{news.title}</h1>
        <p className='news-lead'>{news.excerpt}</p>
        <div
          className='news-content'
          dangerouslySetInnerHTML={{ __html: news.contentHtml }}
        />
      </article>
    </main>
  );
}
