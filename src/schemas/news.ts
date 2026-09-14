import { z } from 'zod';

export const newsSchema = z.object({
  title: z.string().trim()
    .min(5, 'Judul minimal 5 karakter')
    .max(180, 'Judul maksimal 180 karakter'),
  excerpt: z.string().trim()
    .min(10, 'Ringkasan minimal 10 karakter')
    .max(400, 'Ringkasan maksimal 400 karakter'),
  content: z.string().trim()
    .min(20, 'Isi berita minimal 20 karakter')
    .max(200_000, 'Isi berita terlalu panjang'),
  thumbnailPath: z.string()
    .regex(/^\/uploads\/news\/[0-9a-f-]+\.webp$/, 'Path thumbnail tidak valid')
    .optional()
    .or(z.literal('')),
  status: z.enum(['draft', 'published']),
});
