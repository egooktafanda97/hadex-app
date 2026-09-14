import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email tidak valid").trim().toLowerCase(),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/, "Nomor telepon tidak valid"),
});
