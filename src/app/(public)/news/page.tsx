import Link from 'next/link';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
export const dynamic = 'force-dynamic';
type News = {
  slug: string;
  title: string;
  excerpt: string;
  thumbnailPath: string | null;
  publishedAt: string;
};
export default function Page() {
  const news = db
    .prepare(
      `SELECT slug,title,excerpt,thumbnail_path thumbnailPath,published_at publishedAt FROM news WHERE status='published' AND deleted_at IS NULL ORDER BY published_at DESC`,
    )
    .all() as News[];
  return (
    <main>
      <section className='public-page-head'>
        <div className='container'>
          <span className='landing-kicker'>Media Informasi</span>
          <h1>Berita HDEX Trans</h1>
          <p>Informasi layanan, perjalanan, dan pengumuman terbaru.</p>
        </div>
      </section>
      <section className='container news-grid'>
        {news.map((item) => (
          <article className='news-card' key={item.slug}>
            {item.thumbnailPath && <img src={item.thumbnailPath} alt='' />}
            <div>
              <time>{formatDateTime(item.publishedAt)}</time>
              <h2>{item.title}</h2>
              <p>{item.excerpt}</p>
              <Link href={`/news/${item.slug}`}>Baca berita →</Link>
            </div>
          </article>
        ))}
        {!news.length && (
          <div className='landing-empty'>Belum ada berita diterbitkan.</div>
        )}
      </section>
    </main>
  );
}
