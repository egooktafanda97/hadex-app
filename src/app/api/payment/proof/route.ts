import crypto from "node:crypto";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadPaymentProof } from "@/services/manual-payment.service";

export const runtime = "nodejs";
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) return Response.json({ error: "Belum login" }, { status: 401 });
    const user = db.prepare("SELECT role,is_active FROM users WHERE id=?").get(session.user.id) as { role: string; is_active: number } | undefined;
    if (!user?.is_active || user.role !== "customer") return Response.json({ error: "Akses ditolak" }, { status: 403 });
    const form = await request.formData();
    const bookingId = String(form.get("bookingId") ?? "");
    const file = form.get("file");
    if (!bookingId || !(file instanceof File)) return Response.json({ error: "Booking dan bukti pembayaran wajib diisi" }, { status: 400 });
    if (file.size > MAX_SIZE) return Response.json({ error: "File maksimal 5 MB" }, { status: 413 });
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return Response.json({ error: "Format harus JPG, PNG, atau WebP" }, { status: 415 });
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer, { failOn: "error", limitInputPixels: 24_000_000 });
        const metadata = await image.metadata();
        if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) throw new Error("Invalid image");
        const output = await image.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).webp({ quality: 84 }).toBuffer();
        const name = `${crypto.randomUUID()}.webp`;
        const root = path.join(process.cwd(), "public", "uploads", "payments");
        await mkdir(root, { recursive: true });
        await writeFile(path.join(root, name), output, { flag: "wx" });
        const proofPath = `/uploads/payments/${name}`;
        uploadPaymentProof(session.user.id, bookingId, proofPath);
        return Response.json({ path: proofPath });
    } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : "Bukti pembayaran tidak valid" }, { status: 400 });
    }
}
