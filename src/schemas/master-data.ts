import { z } from "zod";

export const busSchema = z.object({
  code: z.string().trim().min(2).max(20),
  name: z.string().trim().min(2).max(80),
  plateNumber: z.string().trim().min(3).max(20),
  capacity: z.coerce.number().int().min(1).max(80),
});

export const locationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().max(250).optional().default(""),
});

export const routeSchema = z.object({
  originId: z.uuid(),
  destinationId: z.uuid(),
  durationMinutes: z.coerce.number().int().positive(),
  distanceKm: z.coerce.number().int().nonnegative(),
}).refine((value) => value.originId !== value.destinationId, "Asal dan tujuan harus berbeda");

export const tripSchema = z.object({
  tripCode: z.string().trim().min(4, "Kode trip minimal 4 karakter").max(40, "Kode trip maksimal 40 karakter"),
  busId: z.uuid(),
  routeId: z.uuid(),
  departureAt: z.iso.datetime(),
  arrivalAt: z.iso.datetime(),
  fare: z.coerce.number().int().nonnegative(),
  status: z.enum(['scheduled', 'boarding', 'departed', 'arrived', 'cancelled']).default('scheduled'),
})
  .refine((value) => new Date(value.departureAt) > new Date(), {
    path: ['departureAt'],
    message: "Waktu berangkat harus setelah waktu sekarang",
  })
  .refine((value) => new Date(value.arrivalAt) > new Date(value.departureAt), {
    path: ['arrivalAt'],
    message: "Waktu tiba harus setelah berangkat",
  });

export const userAdminSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.email().trim().toLowerCase(),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/),
  role: z.enum(["customer", "operator"]),
  password: z.string().min(8).max(128).optional(),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/),
});
