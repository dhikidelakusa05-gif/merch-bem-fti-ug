'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { loginStudent } from '../authActions';

export default function StudentLoginPage() {
  const [state, formAction, isPending] = useActionState(loginStudent, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel Kiri: Branding Gelap */}
      <div className="hidden flex-col justify-between bg-slate-900 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-extrabold text-white shadow-sm">
            FTI
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            MERCH BEM FTI UG
          </span>
        </Link>

        <div className="max-w-md space-y-6">
          <blockquote className="text-3xl leading-snug font-bold tracking-tight">
            “Belanja atribut resmi FTI lebih mudah, pembayaran aman, pengambilan
            praktis di 4 region kampus.”
          </blockquote>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500/20 text-xs font-bold text-orange-400 ring-1 ring-orange-400/30">
              BEM
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Biro Danus &amp; Kewirausahaan
              </p>
              <p className="text-xs text-slate-400">
                BEM FTI Universitas Gunadarma
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>✓ Pembayaran Aman</span>
          <span>✓ 4 Region Kampus</span>
          <span>✓ Bayar Mudah</span>
        </div>
      </div>

      {/* Panel Kanan: Form Login */}
      <div className="flex flex-col justify-between bg-white p-6 sm:p-12">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <Link href="/" className="hover:text-slate-900">
            ← Beranda
          </Link>
          <Link href="/register" className="hover:text-slate-900">
            Buat Akun
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Selamat Datang Kembali
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Masuk ke akun mahasiswa Anda untuk melanjutkan belanja &amp; pantau
            pesanan.
          </p>

          {state?.error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Email Mahasiswa / NPM / Username Admin
              </label>
              <input
                type="text"
                name="email"
                required
                placeholder="nama@student.gunadarma.ac.id atau NPM"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Masukkan password"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 pr-16 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? 'Tutup' : 'Lihat'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
            >
              {isPending ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Belum punya akun?{' '}
            <Link
              href="/register"
              className="font-bold text-slate-900 hover:text-orange-600"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>

        <div className="text-center text-[11px] text-slate-400">
          BEM Fakultas Teknologi Industri — Universitas Gunadarma
        </div>
      </div>
    </div>
  );
}