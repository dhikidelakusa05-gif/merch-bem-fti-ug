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
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 text-white shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-xs font-extrabold text-white shadow-sm">
            FTI
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight text-white">
              MERCH BEM FTI UG
            </p>
            <p className="hidden text-[11px] text-slate-400 sm:block">
              Official Store Fakultas Teknologi Industri
            </p>
          </div>
        </Link>

        {/* Menu Tengah */}
        <nav className="hidden items-center gap-6 text-xs font-medium text-slate-300 md:flex">
          <Link href="/" className="transition hover:text-white">
            Beranda
          </Link>
          <Link href="/#katalog" className="transition hover:text-white">
            Katalog
          </Link>
          <Link href="/pesanan" className="transition hover:text-white">
            Pesanan Saya
          </Link>
        </nav>

        {/* Kanan: Keranjang + Profil / Masuk */}
        <div className="flex items-center gap-3">
          <Link
            href="/keranjang"
            className="relative flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-white transition hover:border-orange-500/50 hover:bg-slate-800"
          >
            <span>🛒</span>
            <span className="hidden sm:inline">Keranjang</span>
            {totalItems > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-[11px] font-extrabold text-white">
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
              <Link
                href="/pesanan"
                className="flex items-center gap-2 rounded-xl px-2 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-800"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">
                  {user.name}
                </span>
              </Link>
              <form action={logoutStudent}>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:bg-red-600 hover:text-white"
                >
                  Keluar
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-orange-500 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-orange-600"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}