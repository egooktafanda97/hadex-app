'use server';

import { revalidatePath } from 'next/cache';
import { ZodError } from 'zod';
import { requireUser } from '@/lib/dal';
import { deleteNews, saveNews } from '@/services/news.service';

export type NewsActionResult = { ok: boolean; message: string };
const value = (form: FormData, name: string) => String(form.get(name) ?? '');

export async function saveNewsAction(
  _: NewsActionResult | undefined,
  form: FormData,
): Promise<NewsActionResult> {
  try {
    const user = await requireUser(['admin']);
    saveNews(user.id, value(form, 'id') || undefined, {
      title: value(form, 'title'),
      excerpt: value(form, 'excerpt'),
      content: value(form, 'content'),
      thumbnailPath: value(form, 'thumbnailPath'),
      status: value(form, 'status'),
    });
    revalidatePath('/admin/news');
    revalidatePath('/news');
    revalidatePath('/');
    return { ok: true, message: 'Berita tersimpan' };
  } catch (error) {
    const message = error instanceof ZodError
      ? error.issues[0]?.message ?? 'Data berita tidak valid'
      : error instanceof Error ? error.message : 'Berita gagal disimpan';
    return { ok: false, message };
  }
}

export async function deleteNewsAction(id: string) {
  const user = await requireUser(['admin']);
  deleteNews(user.id, id);
  revalidatePath('/admin/news');
  revalidatePath('/news');
  revalidatePath('/');
}
