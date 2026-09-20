export const formatRupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
export const formatDateTime = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" }).format(new Date(value));

/** Format for `<input type="datetime-local">` (local timezone, no seconds/Z). */
export function toDatetimeLocalValue(value?: string | Date | null, fallbackMinutesFromNow = 0) {
  const date =
    value == null || value === ""
      ? new Date(Date.now() + fallbackMinutesFromNow * 60_000)
      : value instanceof Date
        ? value
        : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return toDatetimeLocalValue(null, fallbackMinutesFromNow);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse datetime-local / ISO string to UTC ISO for storage. */
export function toIsoDateTime(value: string) {
  const date = new Date(value);
  if (!value.trim() || Number.isNaN(date.getTime())) {
    throw new Error("Tanggal/waktu tidak valid");
  }
  return date.toISOString();
}
