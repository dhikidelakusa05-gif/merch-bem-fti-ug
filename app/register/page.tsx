'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { registerStudent } from '../authActions';

export default function StudentRegisterPage() {
  const [state, formAction, isPending] = useActionState(registerStudent, null);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel Kiri: Branding Laut Dalam Nalasakti Abadi */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-[#061A35] via-[#0F4C81] to-[#1D79AC] p-12 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -left-20 h-80 w-80 rounded-full bg-cyan-300/25 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-cyan-300 to-sky-400 font-extrabold text-slate-950 shadow-sm">
            FTI
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            MERCH BEM FTI UG
          </span>
        </Link>

        <div className="relative max-w-md space-y-6">
          <span className="inline-block rounded-full bg-cyan-300/15 px-3 py-1 text-[11px] font-bold tracking-wider text-cyan-200 ring-1 ring-cyan-300/30">
            KABINET NALASAKTI ABADI • 2026/2027
          </span>
          <blockquote className="text-3xl leading-snug font-bold tracking-tight">
            “Daftar sekali, simpan identitas NPM &amp; kelas untuk checkout cepat
            kapan saja.”
          </blockquote>
          <p className="text-sm text-sky-100/85">
            Mendukung pengambilan di seluruh region FTI Universitas Gunadarma:
            Depok, Karawaci, Kalimalang, dan Cengkareng.
          </p>
        </div>

        <div className="relative flex items-center gap-6 text-xs text-sky-200">
          <span>✓ Pembayaran Aman</span>
          <span>✓ 4 Region Kampus</span>
          <span>✓ Bayar Mudah</span>
        </div>
      </div>

      {/* Panel Kanan: Form Daftar */}
      <div className="flex flex-col justify-between bg-white p-6 sm:p-12">
        <div className="flex items-center justify-between text-xs font-medium text-slate-600">
          <Link href="/" className="hover:text-[#0F4C81]">
            ← Beranda
          </Link>
          <Link href="/login" className="hover:text-[#0F4C81]">
            Sudah punya akun? Masuk
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md py-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#071E3D]">
            Buat Akun Mahasiswa
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Lengkapi data mahasiswa FTI UG untuk memesan merchandise resmi.
          </p>

          {state?.error && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
              {state.error}
            </div>
          )}

          <form action={formAction} className="mt-5 space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="Contoh: Dhiki Delakusa"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  NPM *
                </label>
                <input
                  type="text"
                  name="npm"
                  required
                  placeholder="50424xxx"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">
                  Kelas *
                </label>
                <input
                  type="text"
                  name="kelas"
                  required
                  placeholder="2IA01"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="nama@email.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                No. WhatsApp Aktif *
              </label>
              <input
                type="tel"
                name="whatsapp"
                required
                placeholder="0812xxxxxxxx"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">
                Password *
              </label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-linear-to-r from-[#0B2D52] via-[#0F4C81] to-sky-600 py-3 text-sm font-bold text-white shadow-sm transition hover:from-[#071E3D] hover:to-sky-500 disabled:opacity-50"
            >
              {isPending ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-500">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="font-bold text-[#0F4C81] hover:text-sky-600"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <div />
      </div>
    </div>
  );
}