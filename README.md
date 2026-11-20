# MERCH BEM FTI UG — Kabinet Nalasakti Abadi (2026/2027)

Platform e-commerce resmi penjualan atribut dan merchandise mahasiswa Fakultas Teknologi Industri (FTI) Universitas Gunadarma.

🌐 **Live Preview:** [merch-bem-fti-ug.vercel.app](https://merch-bem-fti-ug.vercel.app/)

## Tech Stack
- **Framework:** Next.js 16 (App Router) & React (TypeScript)
- **Styling:** Tailwind CSS (Palet Biru Laut Dalam — Kabinet Nalasakti Abadi)
- **Database & ORM:** PostgreSQL (Neon) + Prisma ORM
- **Deployment:** Vercel

## Fitur Aktif (`v1.0.0`)
- Katalog produk dinamis (*Ready Stock* & *Pre-Order*) dengan pemilih ukuran pakaian (`S`–`XXL`).
- Autentikasi mahasiswa berbasis **NPM** (Login & Register).
- Keranjang belanja dengan dukungan pengambilan di **4 Region Kampus** (*Depok, Karawaci, Kalimalang, Cengkareng*).
- Riwayat transaksi mahasiswa (`/pesanan`) & Dashboard Pengurus (`/admin`) untuk manajemen produk serta status pesanan.

## Roadmap Selanjutnya
- [ ] **Custom Domain:** Migrasi dari `.vercel.app` ke domain `.my.id` / `.biz.id` / `.id`.
- [ ] **Hero Widget:** Implementasi tata letak *Bento Grid* 3 kolom untuk etalase kategori & promo.
- [ ] **Security Hardening:** Signed session cookie (HMAC/JWT) dan verifikasi signature webhook pembayaran.