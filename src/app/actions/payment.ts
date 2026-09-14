"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/dal";
import { rejectPaymentProof, verifyManualPayment } from "@/services/manual-payment.service";

export type PaymentActionResult = { ok: boolean; message: string };

export async function verifyPaymentAction(form: FormData): Promise<PaymentActionResult> {
    try {
        const user = await requireUser(["admin"]);
        verifyManualPayment(String(form.get("paymentId") ?? ""), user.id, String(form.get("note") ?? ""));
        revalidatePath("/admin/payments"); revalidatePath("/customer/bookings");
        return { ok: true, message: "Pembayaran berhasil diverifikasi" };
    } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Verifikasi pembayaran gagal" };
    }
}

export async function rejectPaymentAction(form: FormData): Promise<PaymentActionResult> {
    try {
        const user = await requireUser(["admin"]);
        rejectPaymentProof(String(form.get("paymentId") ?? ""), user.id, String(form.get("note") ?? ""));
        revalidatePath("/admin/payments"); revalidatePath("/customer/bookings");
        return { ok: true, message: "Bukti pembayaran ditolak" };
    } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Penolakan bukti gagal" };
    }
}
