import { auth } from "@/auth";
import { checkInTicket } from "@/services/ticket.service";
import { z } from "zod";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !["operator", "admin"].includes(session.user.role)) {
    return Response.json({ error: "Akses ditolak" }, { status: 403 });
  }
  const parsed = z.object({ token: z.string().min(20) }).safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Token tidak valid" }, { status: 400 });
  try {
    return Response.json({ id: checkInTicket(parsed.data.token, session.user.id) });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Check-in gagal" }, { status: 400 });
  }
}
