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
          <h2 className="text-2xl font-bold tracking-tight text-[#071E3D]">
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
    <div className="min-h-screen bg-[#F3F9FD] text-slate-900">
      <Suspense fallback={<div className="h-16 bg-[#061A35]" />}>
        <Navbar />
      </Suspense>

      <section className="relative overflow-hidden bg-linear-to-br from-[#061A35] via-[#0F4C81] to-[#1C79AC] py-16 text-white">
        {/* Efek Kilau Cahaya Air */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-72 w-72 rounded-full bg-sky-950/50 blur-2xl"
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <span className="inline-block rounded-full bg-cyan-300/15 px-3.5 py-1 text-xs font-semibold tracking-wide text-cyan-200 ring-1 ring-inset ring-cyan-300/35">
            KABINET NALASAKTI ABADI • BEM FTI UG 2026/2027
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">
            Atribut &amp; Merchandise Resmi Mahasiswa FTI UG
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-sky-100/90">
            Pesan kemeja PDH/Korsa, kaos event, lanyard, hingga aksesori resmi
            BEM FTI Universitas Gunadarma. Tersedia untuk region Depok, Karawaci,
            Kalimalang, dan Cengkareng.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#katalog"
              className="rounded-xl bg-linear-to-r from-cyan-300 to-sky-400 px-6 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-cyan-400/25 transition hover:from-cyan-200 hover:to-sky-300"
            >
              Lihat Katalog Produk
            </a>
          </div>
        </div>
      </section>

      <main id="katalog" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Suspense
          fallback={
            <div className="rounded-2xl border border-sky-100 bg-white p-12 text-center text-sm text-slate-500">
              Memuat katalog merchandise...
            </div>
          }
        >
          <ProductCatalog />
        </Suspense>
      </main>

      <footer className="border-t border-sky-100 bg-white py-8 text-center text-xs text-slate-500">
        © 2026 Kabinet Nalasakti Abadi — BEM Fakultas Teknologi Industri
        Universitas Gunadarma
      </footer>
    </div>
  );
}