import "server-only";
import crypto from "node:crypto";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { confirmPayment } from "@/services/ticket.service";

export function uploadPaymentProof(userId: string, bookingId: string, proofPath: string) {
    const now = new Date().toISOString();
    const payment = db.prepare(`SELECT p.id,p.status,b.booking_code FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE p.booking_id=? AND b.user_id=? AND b.status='pending_payment'`).get(bookingId, userId) as { id: string; status: string; booking_code: string } | undefined;
    if (!payment) throw new Error("Booking tidak dapat menerima bukti pembayaran");
    if (!["unpaid", "rejected", "awaiting_verification"].includes(payment.status)) throw new Error("Status pembayaran tidak dapat diubah");
    db.prepare(`UPDATE payments SET gateway='manual',status='awaiting_verification',proof_path=?,proof_uploaded_at=?,verification_note=NULL,updated_at=? WHERE id=?`).run(proofPath, now, now, payment.id);
    audit("payment.proof_uploaded", "Payment", payment.id, userId, { status: payment.status }, { status: "awaiting_verification", bookingCode: payment.booking_code });
}

export function verifyManualPayment(paymentId: string, verifierId: string, note?: string) {
    const payment = db.prepare(`SELECT p.id,p.booking_id,p.status,b.booking_code,p.amount FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE p.id=?`).get(paymentId) as { id: string; booking_id: string; status: string; booking_code: string; amount: number } | undefined;
    if (!payment || payment.status !== "awaiting_verification") throw new Error("Bukti pembayaran tidak menunggu verifikasi");
    const transactionId = `MANUAL-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
    const bookingId = confirmPayment(transactionId, payment.booking_code, payment.amount, { method: "manual", verifiedBy: verifierId, note });
    const now = new Date().toISOString();
    db.prepare(`UPDATE payments SET verified_by=?,verified_at=?,verification_note=?,updated_at=? WHERE id=?`).run(verifierId, now, note || null, now, paymentId);
    audit("payment.proof_verified", "Payment", paymentId, verifierId, { status: "awaiting_verification" }, { status: "paid" });
    return bookingId;
}

export function rejectPaymentProof(paymentId: string, verifierId: string, note: string) {
    if (!note.trim()) throw new Error("Alasan penolakan wajib diisi");
    const now = new Date().toISOString();
    const result = db.prepare(`UPDATE payments SET status='rejected',verified_by=?,verified_at=?,verification_note=?,updated_at=? WHERE id=? AND status='awaiting_verification'`).run(verifierId, now, note.trim(), now, paymentId);
    if (result.changes !== 1) throw new Error("Bukti pembayaran tidak menunggu verifikasi");
    audit("payment.proof_rejected", "Payment", paymentId, verifierId, { status: "awaiting_verification" }, { status: "rejected", note: note.trim() });
}
