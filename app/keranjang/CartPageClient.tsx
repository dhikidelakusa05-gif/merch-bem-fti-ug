'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { SessionUser } from '../components/NavbarClient';
import MidtransPaymentModal from '../components/MidtransPaymentModal';

const REGIONS = ['Depok', 'Karawaci', 'Kalimalang', 'Cengkareng'] as const;
type Region = (typeof REGIONS)[number];

function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

export default function CartPageClient({ user }: { user: SessionUser }) {
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [region, setRegion] = useState<Region>('Depok');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [npm, setNpm] = useState(user?.npm || '');
  const [kelas, setKelas] = useState(user?.kelas || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [activeOrder, setActiveOrder] = useState<{
    orderCode: string;
    totalAmount: number;
  } | null>(null);

  const handleCheckout = async () => {
    setErrorMsg('');

    if (!customerName.trim() || !npm.trim() || !kelas.trim() || !whatsapp.trim()) {
      setErrorMsg('Lengkapi Nama, NPM, Kelas, dan No. WhatsApp terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          region,
          customerName: customerName.trim(),
          npm: npm.trim(),
          kelas: kelas.trim(),
          whatsapp: whatsapp.trim(),
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Gagal memproses transaksi.');
        return;
      }

      clearCart();
      setActiveOrder({
        orderCode: data.orderCode,
        totalAmount: data.totalAmount,
      });
    } catch {
      setErrorMsg('Terjadi gangguan jaringan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Header Atas */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <Link
            href="/#katalog"
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            ← Lanjut Belanja
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Keranjang Belanja
          </h1>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-medium text-slate-400 hover:text-red-600"
          >
            🗑 Kosongkan Keranjang
          </button>
        )}
      </div>

      {items.length === 0 && !activeOrder ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center">
          <p className="text-base font-bold text-slate-700">
            Keranjang belanja Anda masih kosong
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Pilih merchandise resmi BEM FTI UG di katalog untuk mulai memesan.
          </p>
          <Link
            href="/#katalog"
            className="mt-5 inline-block rounded-xl bg-orange-500 px-6 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
          >
            Lihat Katalog Produk
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Kolom Kiri (7 kolom): Daftar Produk + Identitas Mahasiswa */}
          <div className="space-y-6 lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <p className="text-sm font-bold text-slate-900">
                  🛍 Daftar Produk
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {totalItems} item
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item) => {
                  const maxAllowed = item.isPreOrder ? 50 : item.stock;
                  return (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex gap-4 p-6"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-linear-to-tr from-slate-100 to-blue-50 p-2 text-center text-[10px] font-extrabold text-blue-800 uppercase">
                        {item.category}
                      </div>

                      <div className="flex flex-1 flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900">
                              {item.name}
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-500">
                              Ukuran / Varian:{' '}
                              <span className="font-semibold text-slate-700">
                                {item.size}
                              </span>{' '}
                              • {formatRupiah(item.price)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.productId, item.size)
                            }
                            className="text-slate-400 hover:text-red-600"
                            title="Hapus item"
                          >
                            🗑
                          </button>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  item.quantity - 1
                                )
                              }
                              className="h-8 w-8 rounded-lg border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.size,
                                  Math.min(maxAllowed, item.quantity + 1)
                                )
                              }
                              className="h-8 w-8 rounded-lg border border-slate-200 font-bold text-slate-700 hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>

                          <p className="text-sm font-extrabold text-slate-900">
                            {formatRupiah(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Identitas Mahasiswa & Region */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">
                  Data Pemesan &amp; Region Kampus
                </h2>
                {!user && (
                  <Link
                    href="/login"
                    className="text-xs font-semibold text-orange-600 hover:underline"
                  >
                    Masuk untuk isi otomatis →
                  </Link>
                )}
              </div>

              <div className="mt-4 space-y-3.5">
                {/* Tab 4 Region */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Pilih Region *
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1 sm:grid-cols-4">
                    {REGIONS.map((reg) => (
                      <button
                        key={reg}
                        type="button"
                        onClick={() => setRegion(reg)}
                        className={`rounded-lg py-2 text-xs font-bold transition ${
                          region === reg
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                        }`}
                      >
                        {reg}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Dhiki Delakusa"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      NPM *
                    </label>
                    <input
                      type="text"
                      value={npm}
                      onChange={(e) => setNpm(e.target.value)}
                      placeholder="50424xxx"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Kelas *
                    </label>
                    <input
                      type="text"
                      value={kelas}
                      onChange={(e) => setKelas(e.target.value)}
                      placeholder="2IA01"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      No. WhatsApp *
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="0812xxxxxxxx"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Nama bordir PDH / request khusus"
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan (5 kolom): Ringkasan Belanja */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="text-base font-extrabold text-slate-900">
                Ringkasan Belanja
              </h2>

              <div className="mt-4 space-y-2.5 border-b border-slate-100 pb-4 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({totalItems} item)</span>
                  <span className="font-semibold text-slate-900">
                    {formatRupiah(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Region Pengambilan</span>
                  <span className="font-bold text-emerald-600">{region}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900">
                  Total
                </span>
                <span className="text-xl font-extrabold text-slate-900">
                  {formatRupiah(subtotal)}
                </span>
              </div>

              {errorMsg && (
                <div className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCheckout}
                className="mt-5 w-full rounded-xl bg-orange-500 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Menyiapkan Pembayaran...'
                  : 'Lanjut ke Pembayaran →'}
              </button>

              <p className="mt-3 text-center text-[11px] text-slate-400">
                Transaksi aman dengan Midtrans Payment Gateway
              </p>
            </div>
          </div>
        </div>
      )}

      {activeOrder && (
        <MidtransPaymentModal
          orderCode={activeOrder.orderCode}
          totalAmount={activeOrder.totalAmount}
          onSuccess={() => {
            setActiveOrder(null);
            router.push('/pesanan');
            router.refresh();
          }}
          onClose={() => {
            setActiveOrder(null);
            router.push('/pesanan');
          }}
        />
      )}
    </main>
  );
}