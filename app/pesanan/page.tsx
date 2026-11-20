import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { db } from '../../prisma/db';
import Navbar from '../components/Navbar';
import { SessionUser } from '../components/NavbarClient';

function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'LUNAS':
      return 'bg-emerald-100 text-emerald-800';
    case 'SELESAI':
      return 'bg-blue-100 text-blue-800';
    case 'BATAL':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-amber-100 text-amber-800';
  }
}

async function OrderHistoryContent() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('user_session')?.value;
  let user: SessionUser = null;

  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }

  const [allOrders, allItems, allProducts] = await Promise.all([
    db.orm.public.Order.all(),
    db.orm.public.OrderItem.all(),
    db.orm.public.Product.all(),
  ]);

  const productMap = new Map(allProducts.map((p) => [p.id, p.name]));

  // Jika login, filter berdasarkan NPM mahasiswa; jika belum login, tampilkan 5 transaksi terbaru
  const filteredOrders = [...allOrders]
    .filter((o) => (user ? o.npm === user.npm : true))
    .sort((a, b) => b.id - a.id)
    .slice(0, user ? 50 : 5)
    .map((order) => ({
      ...order,
      items: allItems
        .filter((i) => i.orderId === order.id)
        .map((i) => ({
          ...i,
          productName: productMap.get(i.productId) ?? 'Produk Merchandise',
        })),
    }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Pesanan Saya
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {user
              ? `Menampilkan riwayat pesanan untuk ${user.name} (${user.npm})`
              : 'Masuk dengan akun mahasiswa untuk melihat seluruh riwayat pesanan pribadi Anda.'}
          </p>
        </div>
        {!user && (
          <Link
            href="/login"
            className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600"
          >
            Masuk Akun
          </Link>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-bold text-slate-700">
            Belum ada riwayat pesanan.
          </p>
          <Link
            href="/#katalog"
            className="mt-4 inline-block rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-orange-500"
          >
            Mulai Belanja Merchandise
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    #{order.orderCode}
                  </span>
                  <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                    Region {order.deliveryMethod}
                  </span>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} ({item.size}) × {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs text-slate-500">
                  Pemesan: {order.customerName} ({order.npm})
                </span>
                <span className="text-sm font-extrabold text-orange-600">
                  Total: {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default function PesananPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="h-16 bg-slate-900" />}>
        <Navbar />
      </Suspense>
      <Suspense
        fallback={
          <div className="p-12 text-center text-sm text-slate-500">
            Memuat riwayat pesanan...
          </div>
        }
      >
        <OrderHistoryContent />
      </Suspense>
    </div>
  );
}