export async function POST() {
    return Response.json({ error: "Pembayaran gateway dinonaktifkan. Silakan upload bukti pembayaran." }, { status: 410 });
}
