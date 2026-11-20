'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { logoutStudent } from '../authActions';

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  npm: string;
  kelas: string;
  whatsapp: string;
} | null;

export default function NavbarClient({ user }: { user: SessionUser }) {
  const { totalItems } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-sky-800/40 bg-linear-to-r from-[#061A35] via-[#0B2D52] to-[#0E3B68] text-white shadow-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-cyan-300 to-sky-500 text-xs font-extrabold text-slate-950 shadow-sm shadow-cyan-400/30">
            FTI
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white">
              MERCH BEM FTI UG
            </p>
            <p className="hidden text-[11px] text-sky-200/80 sm:block">
              Kabinet Nalasakti Abadi • 2026/2027
            </p>
          </div>
        </Link>

        {/* Menu Tengah */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-sky-100/85 md:flex">
          <Link href="/" className="transition hover:text-cyan-300">
            Beranda
          </Link>
          <Link href="/#katalog" className="transition hover:text-cyan-300">
            Katalog
          </Link>
          <Link href="/pesanan" className="transition hover:text-cyan-300">
            Pesanan Saya
          </Link>
        </nav>

        {/* Kanan: Keranjang + Profil / Masuk */}
        <div className="flex items-center gap-3">
          <Link
            href="/keranjang"
            className="relative flex items-center gap-1.5 rounded-xl border border-sky-400/25 bg-[#092444]/80 px-3 py-2 text-xs font-semibold text-white transition hover:border-cyan-300/60 hover:bg-[#0F3866]"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-cyan-300 to-sky-400 px-1.5 text-[11px] font-extrabold text-slate-950">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-sky-400/20 pl-3">
              <Link
                href="/pesanan"
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-xs font-semibold text-sky-100 hover:bg-[#0F3866]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-sky-600 text-[11px] font-extrabold text-slate-950">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.name}
                </span>
              </Link>
              <form action={logoutStudent}>
                <button
                  type="submit"
                  className="rounded-lg bg-[#092444] px-2.5 py-1.5 text-[11px] font-medium text-sky-200 transition hover:bg-red-600 hover:text-white"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-linear-to-r from-cyan-300 to-sky-400 px-3.5 py-2 text-xs font-extrabold text-slate-950 shadow-sm shadow-cyan-400/20 transition hover:from-cyan-200 hover:to-sky-300"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}