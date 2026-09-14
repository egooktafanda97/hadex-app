'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MAX_SIZE = 5 * 1024 * 1024;

export function PaymentButton({
  bookingId,
  paymentStatus,
  proofPath,
  verificationNote,
}: {
  bookingId: string;
  paymentStatus?: string;
  proofPath?: string | null;
  verificationNote?: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  async function upload() {
    if (!file) return setMessage('Pilih bukti pembayaran terlebih dahulu');
    if (file.size > MAX_SIZE) return setMessage('File maksimal 5 MB');
    setBusy(true);
    setMessage('');
    try {
      const form = new FormData();
      form.set('bookingId', bookingId);
      form.set('file', file);
      const response = await fetch('/api/payment/proof', {
        method: 'POST',
        body: form,
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      if (!response.ok)
        throw new Error(data?.error || `Upload gagal (${response.status})`);
      setMessage('Bukti pembayaran berhasil dikirim');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload gagal');
    } finally {
      setBusy(false);
    }
  }
  if (paymentStatus === 'awaiting_verification')
    return (
      <p className='text-amber-700'>Bukti pembayaran sedang diperiksa admin.</p>
    );
  return (
    <div className='space-y-3'>
      {paymentStatus === 'rejected' && (
        <p className='text-red-600'>
          Bukti ditolak
          {verificationNote
            ? `: ${verificationNote}`
            : '. Silakan upload ulang.'}
        </p>
      )}
      {proofPath && (
        <a
          className='text-green-700 underline'
          href={proofPath}
          target='_blank'
          rel='noreferrer'
        >
          Lihat bukti terakhir
        </a>
      )}
      <input
        type='file'
        accept='image/jpeg,image/png,image/webp'
        onChange={(event) => setFile(event.target.files?.[0] ?? null)}
      />
      <button className='btn btn-primary' onClick={upload} disabled={busy}>
        {busy ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
      </button>
      {message && (
        <p role='status' className='text-sm text-red-600'>
          {message}
        </p>
      )}
      <p className='text-xs text-gray-500'>
        Format JPG, PNG, atau WebP. Maksimal 5 MB.
      </p>
    </div>
  );
}
