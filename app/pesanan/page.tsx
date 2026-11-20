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
      return 'bg-sky-100 text-[#0B2D52]';
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
          <h1 className="text-2xl font-extrabold tracking-tight text-[#071E3D]">
            Pesanan Saya
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {user
              ? `Menampilkan riwayat pesanan untuk ${user.name} (${user.npm})`
              : 'Masuk dengan NPM untuk melihat seluruh riwayat pesanan pribadi Anda.'}
          </p>
        </div>
        {!user && (
          <Link
            href="/login"
            className="rounded-xl bg-linear-to-r from-[#0B2D52] to-sky-600 px-4 py-2 text-xs font-bold text-white hover:from-[#071E3D] hover:to-sky-500"
          >
            Masuk Akun
          </Link>
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-sky-200 bg-white p-12 text-center">
          <p className="text-sm font-bold text-[#071E3D]">
            Belum ada riwayat pesanan.
          </p>
          <Link
            href="/#katalog"
            className="mt-4 inline-block rounded-xl bg-linear-to-r from-[#0B2D52] to-sky-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-[#071E3D] hover:to-sky-500"
          >
            Mulai Belanja Merchandise
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-sky-100 bg-white p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#071E3D]">
                    #{order.orderCode}
                  </span>
                  <span className="rounded-md bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0F4C81]">
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
                    <span className="font-semibold text-[#071E3D]">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-sky-50 pt-3">
                <span className="text-xs text-slate-500">
                  Pemesan: {order.customerName} ({order.npm})
                </span>
                <span className="text-sm font-extrabold text-[#0F4C81]">
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
    <div className="min-h-screen bg-[#F3F9FD] text-slate-900">
      <Suspense fallback={<div className="h-16 bg-[#061A35]" />}>
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