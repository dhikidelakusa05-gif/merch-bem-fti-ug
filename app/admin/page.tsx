import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { db } from '../../prisma/db';
import {
  logoutAdmin,
  toggleProductStatus,
  deleteProduct,
  updateOrderStatus,
} from './actions';
import AddProductForm from './AddProductForm';

function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

function formatWaLink(phone: string) {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    return `https://wa.me/62${cleaned.slice(1)}`;
  }
  return `https://wa.me/${cleaned}`;
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

async function AdminDashboardContent() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin_session');

  if (!sessionCookie) {
    redirect('/admin/login');
  }

  let adminName = 'Admin BEM FTI UG';
  try {
    const parsed = JSON.parse(sessionCookie.value);
    if (parsed?.name) adminName = parsed.name;
  } catch {
    redirect('/admin/login');
  }

  const [products, rawOrders, orderItems] = await Promise.all([
    db.orm.public.Product.all(),
    db.orm.public.Order.all(),
    db.orm.public.OrderItem.all(),
  ]);

  const productNameMap = new Map(products.map((p) => [p.id, p.name]));

  const orders = [...rawOrders]
    .sort((a, b) => b.id - a.id)
    .map((order) => ({
      ...order,
      items: orderItems
        .filter((item) => item.orderId === order.id)
        .map((item) => ({
          ...item,
          productName: productNameMap.get(item.productId) ?? 'Produk Terhapus',
        })),
    }));

  const activeCount = products.filter((p) => p.isActive).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Topbar */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Dashboard Admin — Merch BEM FTI UG
            </p>
            <p className="text-xs text-slate-500">Login sebagai: {adminName}</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Lihat Web Publik ↗
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        {/* Statistik Ringkas */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Total Produk</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {products.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Produk Tayang</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-600">
              {activeCount}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Total Stok</p>
            <p className="mt-1 text-2xl font-extrabold text-blue-600">
              {totalStock}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-500">Pesanan Masuk</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {orders.length}
            </p>
          </div>
        </div>

        {/* Bagian 1: Manajemen Produk */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <AddProductForm />
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-900">
                Daftar Produk di Database ({products.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Kelola status tayang atau hapus produk dari katalog.
              </p>

              {products.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
                  <p className="text-sm font-medium text-slate-600">
                    Wadah katalog masih kosong.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Gunakan formulir di samping untuk menambahkan produk
                    merchandise pertama BEM FTI UG.
                  </p>
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">
                            {product.name}
                          </p>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {product.category}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              product.isPreOrder
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {product.isPreOrder ? 'Pre-Order' : 'Ready'}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                              product.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {product.isActive ? 'Aktif' : 'Disembunyikan'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatRupiah(product.price)} • Stok: {product.stock}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <form action={toggleProductStatus}>
                          <input type="hidden" name="id" value={product.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(product.isActive)}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            {product.isActive ? 'Sembunyikan' : 'Tampilkan'}
                          </button>
                        </form>

                        <form action={deleteProduct}>
                          <input type="hidden" name="id" value={product.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bagian 2: Daftar Pesanan Masuk */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Daftar Pesanan Masuk ({orders.length})
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pantau pesanan mahasiswa per region dan perbarui status pembayaran.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-10 text-center">
              <p className="text-sm font-medium text-slate-600">
                Belum ada pesanan masuk.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Pesanan yang dibuat mahasiswa melalui katalog akan langsung muncul di sini.
              </p>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-slate-100">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col justify-between gap-4 py-5 lg:flex-row lg:items-center"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        {order.orderCode}
                      </span>
                      <span className="rounded-md bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700">
                        Region {order.deliveryMethod}
                      </span>
                      <span
                        className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800">
                      {order.customerName}{' '}
                      <span className="font-normal text-slate-500">
                        ({order.npm} • {order.kelas})
                      </span>
                    </p>

                    <div className="text-xs text-slate-600">
                      {order.items.map((item) => (
                        <p key={item.id}>
                          • <span className="font-medium">{item.productName}</span>{' '}
                          ({item.size || 'Standar'}) × {item.quantity} —{' '}
                          <span className="font-bold text-blue-700">
                            {formatRupiah(order.totalAmount)}
                          </span>
                        </p>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-slate-500">
                        Catatan: <span className="italic">{order.notes}</span>
                      </p>
                    )}

                    <div className="pt-1">
                      <a
                        href={formatWaLink(order.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Chat WA Pembeli ({order.whatsapp}) ↗
                      </a>
                    </div>
                  </div>

                  {/* Tombol Ubah Status */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['PENDING', 'LUNAS', 'SELESAI', 'BATAL'] as const).map(
                      (st) => (
                        <form key={st} action={updateOrderStatus}>
                          <input type="hidden" name="id" value={order.id} />
                          <input type="hidden" name="status" value={st} />
                          <button
                            type="submit"
                            disabled={order.status === st}
                            className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                              order.status === st
                                ? 'cursor-default bg-slate-900 text-white'
                                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {st}
                          </button>
                        </form>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
          Memuat Dashboard Admin...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}