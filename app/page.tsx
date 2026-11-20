import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { db } from '../prisma/db';
import Navbar from './components/Navbar';
import ProductGridWithCheckout from './ProductGridWithCheckout';

async function ProductCatalog() {
  const cookieStore = await cookies();
  const isLoggedIn = Boolean(cookieStore.get('user_session')?.value);

  const rawProducts = await db.orm.public.Product.where({ isActive: true }).all();

  const products = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    stock: p.stock,
    category: p.category,
    imageUrl: p.imageUrl,
    isPreOrder: p.isPreOrder,
  }));

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Katalog Merchandise
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Menampilkan {products.length} produk aktif langsung dari database
          </p>
        </div>
      </div>

      <ProductGridWithCheckout products={products} isLoggedIn={isLoggedIn} />
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="h-16 bg-slate-900" />}>
        <Navbar />
      </Suspense>

      <section className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <span className="inline-block rounded-full bg-orange-500/20 px-3.5 py-1 text-xs font-semibold tracking-wide text-orange-300 ring-1 ring-inset ring-orange-400/30">
            OFFICIAL MERCHANDISE • UNIVERSITAS GUNADARMA
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Atribut &amp; Merchandise Resmi Mahasiswa FTI UG
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300">
            Pesan kemeja PDH/Korsa, kaos event, lanyard, hingga aksesori resmi
            BEM FTI Universitas Gunadarma. Tersedia untuk region Depok, Karawaci,
            Kalimalang, dan Cengkareng.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-600"
            >
              Lihat Katalog Produk
            </a>
          </div>
        </div>
      </section>

      <main id="katalog" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
              Memuat katalog merchandise...
            </div>
          }
        >
          <ProductCatalog />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        © 2026 BEM Fakultas Teknologi Industri — Universitas Gunadarma
      </footer>
    </div>
  );
}