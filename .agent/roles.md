# HDEX Trans — Roles & Build Rules

Dokumen ini menjadi acuan utama pembangunan aplikasi **Sistem Informasi Pemesanan Tiket Bus HDEX Trans** menggunakan **Next.js + SQLite + iPaymu**.

## 1. Tujuan Aplikasi

Aplikasi dibangun untuk mendigitalisasi proses pemesanan tiket bus HDEX Trans agar pelanggan dapat melihat jadwal perjalanan, memilih kursi, melakukan booking, membayar melalui iPaymu, menerima e-ticket, dan menggunakan QR ticket saat keberangkatan.

Pihak internal HDEX Trans dapat mengelola bus, rute, jadwal, kursi, booking, pelanggan, pembayaran, check-in, serta laporan operasional dan transaksi.

## 2. Technology Stack

- Framework: Next.js
- Frontend: Next.js App Router + React + Tailwind CSS
- Database: SQLite
- Authentication: Auth.js / NextAuth Session Authentication
- Payment Gateway: iPaymu
- Payment Flow: iPaymu Redirect Payment
- Storage: Local Storage / S3-compatible Storage
- PDF Ticket: React PDF / server-side PDF generator
- QR Ticket: QR Code Library
- Architecture: Next.js App Router + Service Layer + Repository/Data Access Layer

## 3. Role Sistem

Role yang digunakan:

1. Guest
2. Customer
3. Operator
4. Admin
5. Owner

Guest tidak disimpan sebagai role database karena guest adalah user yang belum login.

Role yang disimpan pada tabel `users`:

- customer
- operator
- admin
- owner

Contoh struktur:

```text
users
- id
- name
- email
- phone
- password
- role
- is_active
- email_verified_at
- created_at
- updated_at
```

## 4. Role: Guest

Guest adalah pengunjung yang belum login.

Hak akses:

- melihat beranda,
- mencari perjalanan,
- melihat rute,
- melihat jadwal,
- melihat harga,
- melihat ketersediaan kursi,
- register,
- login.

Guest tidak boleh membuat booking final.

Alur:

```text
Guest
  ↓
Pilih Jadwal
  ↓
Klik Pesan Tiket
  ↓
Login / Register
  ↓
Kembali ke proses booking
```

## 5. Role: Customer

Customer adalah pelanggan HDEX Trans.

Hak akses:

- dashboard customer,
- cari perjalanan,
- pilih jadwal,
- pilih kursi,
- isi data penumpang,
- membuat booking,
- melakukan pembayaran melalui iPaymu,
- melihat status pembayaran,
- melihat tiket,
- download tiket,
- melihat QR tiket,
- melihat riwayat booking,
- membatalkan booking yang belum dibayar,
- mengubah profil.

Batasan:

- hanya boleh melihat booking miliknya,
- hanya boleh melihat payment miliknya,
- hanya boleh melihat ticket miliknya,
- tidak boleh mengubah harga,
- tidak boleh mengubah jadwal,
- tidak boleh mengubah bus,
- tidak boleh mengubah rute,
- tidak boleh mengubah status pembayaran secara manual.

## 6. Role: Operator

Operator adalah petugas HDEX Trans atau petugas loket.

Hak akses:

- dashboard operasional,
- melihat jadwal hari ini,
- melihat manifest penumpang,
- melihat booking,
- mencari booking,
- melihat status pembayaran,
- membuat booking untuk pelanggan di loket,
- mengisi data penumpang,
- melihat ketersediaan kursi,
- generate ulang tiket,
- scan QR tiket,
- check-in penumpang,
- menandai tiket digunakan.

Operator tidak boleh:

- mengubah API Key iPaymu,
- mengelola role Admin,
- menghapus transaksi pembayaran,
- mengubah transaksi PAID menjadi UNPAID,
- menghapus payment webhook,
- menghapus audit log.

## 7. Role: Admin

Admin mempunyai akses utama untuk pengelolaan sistem.

Admin dapat mengelola:

- bus,
- kursi,
- lokasi,
- rute,
- jadwal,
- harga tiket,
- booking,
- customer,
- operator,
- pembayaran,
- promo jika digunakan,
- konfigurasi aplikasi,
- laporan,
- status perjalanan.

Admin juga dapat:

- menonaktifkan customer,
- menonaktifkan operator,
- melakukan reschedule,
- membatalkan perjalanan,
- melihat webhook iPaymu,
- melihat transaksi gagal,
- melihat audit log.

Admin tidak boleh mengubah transaksi menjadi PAID hanya melalui tombol manual. Status PAID harus berasal dari proses pembayaran yang tervalidasi.

## 8. Role: Owner

Owner adalah pemilik atau manajemen.

Hak akses:

- dashboard manajemen,
- melihat pendapatan,
- melihat jumlah tiket terjual,
- melihat occupancy bus,
- melihat perjalanan,
- melihat laporan transaksi,
- melihat laporan penumpang,
- melihat laporan pembayaran,
- melihat statistik rute.

Owner bersifat dominan read-only.

Owner tidak boleh:

- mengubah booking,
- mengubah harga,
- menghapus perjalanan,
- mengubah status pembayaran,
- melakukan check-in.

## 9. Permission Matrix

| Modul | Guest | Customer | Operator | Admin | Owner |
|---|---:|---:|---:|---:|---:|
| Lihat Jadwal | Ya | Ya | Ya | Ya | Ya |
| Booking | Tidak | Ya | Ya | Ya | Tidak |
| Booking Sendiri | Tidak | Ya | Ya | Ya | Lihat |
| Semua Booking | Tidak | Tidak | Ya | Ya | Lihat |
| Bayar iPaymu | Tidak | Ya | Ya | Ya | Tidak |
| E-Ticket | Tidak | Ya | Ya | Ya | Lihat |
| Scan QR | Tidak | Tidak | Ya | Ya | Tidak |
| Kelola Bus | Tidak | Tidak | Tidak | Ya | Lihat |
| Kelola Rute | Tidak | Tidak | Tidak | Ya | Lihat |
| Kelola Jadwal | Tidak | Tidak | Tidak | Ya | Lihat |
| Kelola Harga | Tidak | Tidak | Tidak | Ya | Lihat |
| Kelola User | Tidak | Profil | Tidak | Ya | Tidak |
| Payment Log | Tidak | Sendiri | Lihat | Ya | Lihat |
| Laporan | Tidak | Tidak | Terbatas | Ya | Ya |
| Setting | Tidak | Tidak | Tidak | Ya | Tidak |

## 10. Alur Utama Customer

```text
Beranda
  ↓
Cari Perjalanan
  ↓
Pilih Jadwal
  ↓
Pilih Kursi
  ↓
Isi Data Penumpang
  ↓
Review Booking
  ↓
Buat Booking
  ↓
Bayar via iPaymu
  ↓
Webhook / Validasi Payment
  ↓
Booking Confirmed
  ↓
E-Ticket + QR
```

## 11. Master Data

Master utama:

- Bus
- Kursi Bus
- Lokasi
- Rute
- Jadwal / Trip
- Harga
- User

Relasi:

```text
Bus
  ↓
Bus Seats

Location
  ↓
Route

Bus + Route + Date + Time
  ↓
Trip

Trip
  ↓
Trip Seats
```

## 12. Konsep Trip

Booking tidak langsung dihubungkan ke bus. Booking harus dihubungkan ke `trip`.

Contoh:

```text
BUS
HDEX-01

RUTE
Teluk Kuantan → Pekanbaru

TANGGAL
10 Oktober 2026

JAM
08:00
```

menjadi:

```text
TRIP-20261010-001
```

Relasi:

```text
booking
  ↓
trip
  ↓
bus
  ↓
route
```

## 13. Status Trip

Gunakan status:

- scheduled
- boarding
- departed
- arrived
- cancelled

Flow normal:

```text
scheduled
  ↓
boarding
  ↓
departed
  ↓
arrived
```

Jika dibatalkan:

```text
scheduled
  ↓
cancelled
```

## 14. Seat Management

Gunakan dua konsep:

### bus_seats
Master kursi pada bus.

### trip_seats
Ketersediaan kursi per perjalanan.

Contoh:

```text
Trip A
Seat 01 → available
Seat 02 → booked
Seat 03 → available

Trip B
Seat 01 → booked
Seat 02 → available
Seat 03 → available
```

## 15. Status Kursi

Status kursi:

- available
- held
- booked
- blocked

Arti:

- `available`: kursi tersedia,
- `held`: sedang dikunci sementara untuk checkout,
- `booked`: sudah dibayar,
- `blocked`: dinonaktifkan operator/admin.

## 16. Seat Lock

Sistem harus mencegah dua customer membeli kursi yang sama.

Flow:

```text
available
  ↓
held
```

Seat hold memiliki waktu kedaluwarsa, misalnya 15 menit.

Jika tidak dibayar:

```text
held
  ↓
available
```

Jika dibayar:

```text
held
  ↓
booked
```

Proses locking harus menggunakan transaction.

Contoh atomic update:

```sql
UPDATE trip_seats
SET status = 'held'
WHERE id = ?
AND status = 'available';
```

Jika affected row = 1, berhasil. Jika affected row = 0, kursi sudah tidak tersedia.

## 17. Booking

Struktur minimal:

```text
bookings
- id
- booking_code
- user_id
- trip_id
- status
- subtotal
- admin_fee
- discount
- grand_total
- expires_at
- paid_at
- cancelled_at
- created_at
- updated_at
```

Contoh booking code:

```text
HDEX-20261010-A7F2K
```

Jangan tampilkan ID database sebagai kode booking.

## 18. Booking Status

Status booking:

- draft
- pending_payment
- confirmed
- cancelled
- expired
- completed

Flow normal:

```text
draft
  ↓
pending_payment
  ↓
confirmed
  ↓
completed
```

Jika tidak dibayar:

```text
pending_payment
  ↓
expired
```

## 19. Payment Status

Status payment harus terpisah dari status booking.

Gunakan:

- unpaid
- pending
- paid
- failed
- expired
- refunded

Contoh:

```text
booking.status = confirmed
payment.status = paid
```

Jangan gunakan:

```text
booking.status = paid
```

## 20. Integrasi iPaymu

Flow:

```text
Next.js Server Action / Route Handler
  ↓
Create Booking
  ↓
Create Payment Record
  ↓
Request iPaymu
  ↓
Receive Payment URL
  ↓
Redirect Customer
  ↓
iPaymu Payment Page
  ↓
Customer Bayar
  ↓
Webhook / Notification
  ↓
Next.js Route Handler Validate Payment
  ↓
Payment = PAID
  ↓
Booking = CONFIRMED
  ↓
Seat = BOOKED
  ↓
Generate Ticket
```

## 21. Aturan iPaymu

Aturan wajib:

1. Development menggunakan sandbox.
2. API Key dan VA Number disimpan di `.env`.
3. Nominal transaksi dihitung di backend.
4. Return URL bukan bukti pembayaran berhasil.
5. Payment dianggap PAID setelah validasi webhook / status transaksi.
6. Callback harus tervalidasi.
7. Webhook wajib idempotent.
8. Jangan percaya data harga dari frontend.
9. Simpan response payment gateway untuk audit.
10. Jangan tampilkan API Key / Signature di UI maupun log publik.

Contoh `.env`:

```env
IPAYMU_MODE=sandbox
IPAYMU_VA=
IPAYMU_API_KEY=
IPAYMU_RETURN_URL=
IPAYMU_CANCEL_URL=
IPAYMU_NOTIFY_URL=
```

## 22. Callback iPaymu

Endpoint contoh:

```text
POST /api/payment/ipaymu/notify
```

Flow:

```text
Notification masuk
  ↓
Validasi signature / request
  ↓
Cari payment
  ↓
Cek transaction ID
  ↓
Cek nominal
  ↓
Cek status
  ↓
Cek apakah sudah diproses
  ↓
Update Payment
  ↓
Update Booking
  ↓
Update Seat
  ↓
Generate Ticket
```

Webhook harus idempotent. Webhook yang datang berkali-kali tidak boleh membuat tiket atau transaksi ganda.

## 23. Aturan Nominal Payment

Harga harus dihitung backend.

Salah:

```text
Frontend mengirim amount
Backend langsung percaya
```

Benar:

```text
Frontend mengirim trip_id + seat_id
  ↓
Backend mengambil fare
  ↓
Backend menghitung subtotal
  ↓
Backend menghitung admin_fee
  ↓
Backend menghitung discount
  ↓
Backend menghitung grand_total
  ↓
Backend mengirim amount ke iPaymu
```

Nominal Rupiah disimpan sebagai integer.

Contoh:

```text
120000
```

## 24. Payment Table

```text
payments
- id
- booking_id
- gateway
- gateway_transaction_id
- gateway_session_id
- amount
- status
- payment_method
- payment_channel
- payment_url
- request_payload
- response_payload
- paid_at
- expired_at
- created_at
- updated_at
```

Gateway:

```text
ipaymu
```

## 25. Payment Webhook Log

```text
payment_webhooks
- id
- gateway
- event_id
- transaction_id
- payload
- headers
- status
- processed_at
- created_at
```

Webhook log tidak boleh dihapus sembarangan.

## 26. E-Ticket

Tiket hanya dibuat setelah pembayaran valid.

Tiket minimal menampilkan:

- nama HDEX Trans,
- booking code,
- nama penumpang,
- asal,
- tujuan,
- tanggal,
- jam,
- kursi,
- status payment,
- QR Code.

## 27. Ticket Table

```text
tickets
- id
- booking_id
- passenger_id
- ticket_code
- qr_token
- status
- issued_at
- used_at
- created_at
- updated_at
```

Status:

- issued
- used
- cancelled

## 28. QR Check-in

QR tidak boleh menggunakan ID tiket incremental. Gunakan token acak / UUID.

Flow:

```text
Scan QR
  ↓
Cari Ticket berdasarkan token
  ↓
Validasi ticket
  ↓
Validasi trip
  ↓
Pastikan belum used
  ↓
Check-in
  ↓
Ticket = used
```

## 29. Passenger

Satu user dapat membeli tiket untuk orang lain.

Gunakan:

```text
booking_passengers
- id
- booking_id
- name
- gender
- phone
- identity_number
- seat_id
- created_at
- updated_at
```

## 30. Database Utama

Tabel utama:

```text
users
buses
bus_seats
locations
routes
trips
trip_seats
bookings
booking_passengers
payments
tickets
payment_webhooks
audit_logs
settings
```

Relasi sederhana:

```text
BUS
  ↓
BUS_SEATS

ROUTE
  ↓
TRIP
  ↓
TRIP_SEATS
  ↓
BOOKING
  ├── BOOKING_PASSENGERS
  ├── PAYMENT
  └── TICKET
```

## 31. Data Models / ORM Models

Minimal:

```text
User
Bus
BusSeat
Location
Route
Trip
TripSeat
Booking
BookingPassenger
Payment
Ticket
PaymentWebhook
AuditLog
Setting
```

## 32. Struktur Next.js

```text
src/
├── app/
│   ├── (public)/
│   │   ├── page.tsx
│   │   └── schedule/
│   ├── customer/
│   ├── operator/
│   ├── admin/
│   ├── owner/
│   └── api/
│       └── payment/
│           └── ipaymu/
│               └── notify/
│                   └── route.ts
├── components/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── permissions.ts
├── services/
│   ├── booking/
│   ├── payment/
│   ├── ticket/
│   └── trip/
├── repositories/
├── schemas/
├── types/
└── utils/

prisma/
├── schema.prisma
└── dev.db

public/
└── tickets/
```

# 33. Service Layer

Route Handler dan Server Action tidak boleh berisi business logic besar.

Gunakan pola:

```text
Route Handler / Server Action
  ↓
Service
  ↓
Repository / ORM / Gateway
```

Contoh:

```text
Checkout Action / Route Handler
  ↓
BookingService
  ↓
SeatService
  ↓
PaymentService
  ↓
IPaymuService
```

Contoh class:

```text
src/services/payment/ipaymu.service.ts
```

Method minimal:

```text
createPayment()
checkPayment()
verifyNotification()
```

## 34. Route Group / App Router

## Public

```text
/
/schedule
/schedule/[tripId]
/login
/register
```

## Customer

```text
/customer/dashboard
/customer/bookings
/customer/bookings/[bookingId]
/customer/tickets
/customer/tickets/[ticketId]
/customer/profile
```

## Operator

```text
/operator/dashboard
/operator/trips
/operator/bookings
/operator/passengers
/operator/checkin
```

## Admin

```text
/admin/dashboard
/admin/buses
/admin/routes
/admin/trips
/admin/bookings
/admin/users
/admin/operators
/admin/payments
/admin/reports
/admin/settings
```

## Owner

```text
/owner/dashboard
/owner/reports
/owner/revenue
/owner/trips
/owner/bookings
```

Gunakan layout dan server-side guard per role untuk melindungi setiap area.

# 35. Authorization

Jangan hanya menyembunyikan menu.

Semua akses harus dilindungi di server menggunakan:

- middleware auth,
- middleware role,
- server-side authorization helper / policy layer.

Customer A tidak boleh membuka booking milik Customer B.

## 36. Booking Ownership

Aturan:

```php
$booking->user_id === auth()->id()
```

Customer hanya boleh melihat booking miliknya sendiri.

## 37. Audit Log

Aktivitas kritis wajib dicatat:

- admin update jadwal,
- admin update harga,
- admin cancel trip,
- operator check-in,
- payment webhook,
- refund,
- perubahan role,
- perubahan konfigurasi penting.

Struktur:

```text
audit_logs
- id
- user_id
- action
- model_type
- model_id
- old_values
- new_values
- ip_address
- user_agent
- created_at
```

Audit log tidak boleh mempunyai menu hard delete biasa.

## 38. Aturan Penghapusan Data

Data transaksi tidak boleh hard delete.

Yang tidak boleh hard delete:

- booking,
- payment,
- ticket,
- webhook,
- audit log.

Gunakan status:

- cancelled
- expired
- refunded

Master data sebaiknya menggunakan `is_active = false` atau Soft Delete.

## 39. Security Minimum

Wajib:

- CSRF Protection,
- XSS Escaping,
- SQL Injection Protection melalui Prisma/Drizzle parameterized query,
- Password Hashing (bcrypt/argon2),
- Login Rate Limit,
- Server-side Authorization,
- Zod / server-side schema validation,
- Webhook Verification,
- HTTPS Production,
- Secure Session / Auth.js session,
- Audit Logging,
- Secret Management via `.env`.

Jangan simpan credential langsung di source code.

## 40. Scheduler

Cron / Scheduled Job digunakan untuk:

- release seat expired,
- expire booking,
- cleanup temporary data,
- optional payment reconciliation.

Contoh:

```text
Cari trip_seats
status = held
held_until < now()
  ↓
status = available
```

Booking yang melewati `expires_at`:

```text
pending_payment
  ↓
expired
```

## 41. Dashboard Customer

Minimal menampilkan:

- booking aktif,
- tiket aktif,
- perjalanan berikutnya,
- status payment,
- tombol lihat tiket.

## 42. Dashboard Operator

Minimal menampilkan:

- perjalanan hari ini,
- booking hari ini,
- jumlah penumpang,
- belum check-in,
- manifest per trip.

## 43. Dashboard Admin

Minimal menampilkan:

- pendapatan hari ini,
- total booking,
- paid,
- pending,
- occupancy,
- transaksi terbaru,
- perjalanan terbaru.

## 44. Dashboard Owner

Minimal menampilkan:

- revenue harian,
- revenue bulanan,
- revenue tahunan,
- tiket terjual,
- load factor,
- rute terlaris,
- transaksi gagal,
- ringkasan perjalanan.

## 45. Scope Skripsi

Fitur inti yang wajib:

- Customer
- Operator
- Admin
- Owner read-only
- Bus
- Rute
- Jadwal
- Kursi
- Booking
- Penumpang
- iPaymu
- E-Ticket
- QR Ticket
- Check-in
- Laporan

Tidak perlu masuk scope awal:

- GPS Tracking,
- Driver App,
- Fleet Maintenance,
- Payroll,
- Accounting penuh,
- Chat,
- Loyalty Points,
- Multi-company.

## 46. Project Rules Wajib

1. Framework wajib Next.js.
2. Database wajib SQLite.
3. Frontend menggunakan Next.js App Router + React + Tailwind CSS.
4. Payment gateway menggunakan iPaymu.
5. Checkout web menggunakan iPaymu Redirect Payment.
6. Development payment wajib menggunakan sandbox.
7. Credential iPaymu tidak boleh berada di source code.
8. Harga selalu dihitung di backend.
9. Return URL tidak boleh dianggap bukti pembayaran.
10. Payment dianggap PAID hanya setelah verifikasi payment notification / API.
11. Webhook wajib idempotent.
12. Booking status dan payment status harus terpisah.
13. Kursi wajib dikunci sebelum checkout.
14. Satu kursi hanya boleh dimiliki satu booking aktif pada trip yang sama.
15. Seat hold harus memiliki expiration.
16. Expired booking harus melepaskan kursi.
17. Gunakan DB transaction pada proses seat booking.
18. Customer hanya dapat mengakses datanya sendiri.
19. Operator hanya mempunyai akses operasional.
20. Admin mempunyai akses master dan konfigurasi.
21. Owner difokuskan untuk monitoring dan reporting.
22. Authorization wajib dilakukan di server.
23. Menyembunyikan menu frontend saja tidak cukup.
24. Semua input wajib menggunakan Zod / server-side schema validation.
25. Transaksi keuangan tidak boleh hard delete.
26. Payment webhook wajib disimpan sebagai log.
27. Aktivitas kritis wajib masuk audit log.
28. Tiket hanya diterbitkan setelah pembayaran valid.
29. Setiap tiket mempunyai token QR unik.
30. QR tidak menggunakan sequential database ID.
31. Harga perjalanan disimpan sebagai integer Rupiah.
32. Booking harus menyimpan snapshot harga saat transaksi.
33. Perubahan harga setelah booking tidak boleh mengubah booking lama.
34. Perubahan jadwal wajib masuk audit log.
35. Jangan meletakkan business logic besar di Controller.
36. Gunakan Service Layer untuk Booking, Seat, Payment, dan Ticket.
37. Gunakan server-side authorization helper / policy layer untuk authorization.
38. Credential production hanya berasal dari `.env`.
39. Error payment tidak boleh menampilkan API Key / signature.
40. Production wajib HTTPS.
41. SQLite harus digunakan dengan transaction pada proses kritis.
42. Booking code harus unik dan tidak memakai ID incremental.
43. Ticket code harus unik.
44. QR token harus sulit ditebak.
45. Webhook tidak boleh membuat tiket ganda.
46. Payment update harus idempotent.
47. Seat update harus atomic.
48. Semua nominal ditentukan backend.
49. User tidak boleh mengubah role sendiri.
50. Admin tidak boleh menghapus audit history.
51. Payment record harus menyimpan gateway reference.
52. Booking harus memiliki `expires_at`.
53. Payment pending harus dapat expired.
54. Trip cancelled harus mencegah booking baru.
55. Trip departed tidak boleh menerima booking baru.
56. Trip arrived tidak boleh menerima check-in baru.
57. Ticket `used` tidak boleh digunakan ulang.
58. Owner tidak boleh melakukan perubahan operasional.
59. Soft delete atau `is_active` digunakan untuk master data.
60. Semua endpoint sensitif harus menggunakan auth + authorization.

## 47. Ringkasan Alur Sistem

```text
CUSTOMER
  ↓
Cari Jadwal
  ↓
Pilih Trip
  ↓
Pilih Kursi
  ↓
Seat = HELD
  ↓
Isi Data Penumpang
  ↓
Booking = PENDING_PAYMENT
  ↓
iPaymu
  ↓
Payment Validation
  ↓
Payment = PAID
  ↓
Booking = CONFIRMED
  ↓
Seat = BOOKED
  ↓
Generate E-Ticket
  ↓
Generate QR
  ↓
Operator Scan
  ↓
Ticket = USED
  ↓
Perjalanan
  ↓
Booking = COMPLETED
```

## 48. Prinsip Utama

Aplikasi harus dibangun dengan prinsip:

- aman,
- sederhana,
- konsisten,
- mudah dikembangkan,
- tidak mencampur business logic dengan controller,
- payment tervalidasi,
- kursi tidak dapat double booking,
- akses role selalu dicek server-side,
- semua transaksi penting memiliki audit trail.

Dokumen `roles.md` ini menjadi aturan utama untuk developer atau AI coding agent selama membangun aplikasi HDEX Trans.
