import { z } from "zod";

const tripSeatIdSchema = z.string().regex(
  /^[0-9a-f]{32}$/i,
  "ID kursi tidak valid",
);

export const bookingSchema = z.object({
  tripId: z.uuid(),
  seatIds: z.array(tripSeatIdSchema).min(1).max(6),
  passengers: z.array(z.object({
    name: z.string().trim().min(2).max(80).refine((name) => !/^penumpang\s+\d+$/i.test(name), 'Masukkan nama lengkap penumpang yang sebenarnya.'),
    gender: z.enum(["male", "female"]),
    phone: z.string().trim().regex(/^\+?[0-9]{9,15}$/).optional().or(z.literal("")),
    identityNumber: z.string().trim().max(40).optional().or(z.literal("")),
  })).min(1).max(6),
}).refine((value) => value.seatIds.length === value.passengers.length, "Jumlah kursi dan penumpang harus sama");
