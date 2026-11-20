'use client';

import { Suspense, useState, useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { loginStudent } from '../authActions';

function LoginFormContent() {
  const [state, formAction, isPending] = useActionState(loginStudent, null);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const mustLoginCart = searchParams.get('reason') === 'cart';

  return (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="text-2xl font-extrabold tracking-tight text-[#071E3D]">
        Masuk Akun Mahasiswa
      </h1>
      <p className="mt-1.5 text-xs text-slate-500">
        Gunakan NPM dan password Anda untuk menambahkan produk ke keranjang &amp;
        memesan merchandise.
      </p>

      {mustLoginCart && !state?.error && (
        <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs font-medium text-[#0B2D52]">
          Silakan masuk menggunakan <strong>NPM</strong> terlebih dahulu sebelum
          menambahkan barang ke keranjang.
        </div>
      )}

      {state?.error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            NPM *
          </label>
          <input
            type="text"
            name="npm"
            inputMode="numeric"
            required
            placeholder="Masukkan NPM (contoh: 50424xxx)"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              placeholder="Masukkan password"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-16 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-sky-700"
            >
              {showPassword ? 'Tutup' : 'Lihat'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-linear-to-r from-[#0B2D52] via-[#0F4C81] to-sky-600 py-3 text-sm font-bold text-white shadow-sm transition hover:from-[#071E3D] hover:to-sky-500 disabled:opacity-50"
        >
          {isPending ? 'Memproses...' : 'Masuk dengan NPM'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Belum punya akun?{' '}
        <Link
          href="/register"
          className="font-bold text-[#0F4C81] hover:text-sky-600"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}

export default function StudentLoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel Kiri: Branding Laut Dalam Nalasakti Abadi */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#061A35] via-[#0F4C81] to-[#1D79AC] p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#061A35] shadow-sm ring-2 ring-cyan-300/45">
            <img
              src="/logo-bem-fti.jpg"
              alt="Logo BEM FTI UG"
              className="h-full w-full object-cover"
            />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            MERCH BEM FTI UG
          </span>
        </Link>

        <div className="relative max-w-md space-y-6">
          <span className="inline-block rounded-full bg-cyan-300/15 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-200 ring-1 ring-cyan-300/30">
            AWAL KISAH • 2026/2027
          </span>
          <blockquote className="text-3xl leading-snug font-bold tracking-tight">
            “Belanja atribut resmi FTI lebih mudah, pembayaran aman, pengambilan
            praktis di 4 region kampus.”
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300/20 text-xs font-bold text-cyan-200 ring-1 ring-cyan-300/40">
              BEM
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Kabinet Nalasakti Abadi
              </p>
              <p className="text-xs text-sky-200">
                BEM FTI Universitas Gunadarma
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-sky-200">
          <span>✓ Login Khusus NPM</span>
          <span>✓ 4 Region Kampus</span>
          <span>✓ Bayar Mudah</span>
        </div>
      </div>

      {/* Panel Kanan: Form Login */}
      <div className="flex flex-col justify-between bg-white p-6 sm:p-12">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <Link href="/" className="hover:text-[#0F4C81]">
            ← Beranda
          </Link>
          <Link href="/register" className="hover:text-[#0F4C81]">
            Buat Akun
          </Link>
        </div>

        <Suspense
          fallback={
            <div className="mx-auto w-full max-w-sm text-center text-xs text-slate-400">
              Memuat formulir masuk...
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>

        <div className="flex flex-col items-center gap-1 text-center text-[11px] text-slate-400">
          <span>
            Kabinet Nalasakti Abadi — BEM FTI Universitas Gunadarma
          </span>
          <Link
            href="/admin/login"
            className="text-slate-400 underline hover:text-[#0F4C81]"
          >
            Portal Pengurus / Admin
          </Link>
        </div>
      </div>
    </div>
  );
}