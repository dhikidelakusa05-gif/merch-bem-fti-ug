'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './context/CartContext';

export type CatalogProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  isPreOrder: boolean;
};

function formatRupiah(angka: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(angka);
}

export default function ProductGridWithCheckout({
  products,
  isLoggedIn,
}: {
  products: CatalogProduct[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [selectedSizes, setSelectedSizes] = useState<Record<number, string>>({});
  const [toastProduct, setToastProduct] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-sm font-medium text-slate-600">
          Belum ada produk merchandise yang ditampilkan.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Admin BEM FTI UG dapat menambahkan produk melalui Portal Admin.
        </p>
      </div>
    );
  }

  const handleAdd = (product: CatalogProduct) => {
    if (!isLoggedIn) {
      router.push('/login?reason=cart');
      return;
    }

    const isApparel = product.category.toLowerCase().includes('apparel');
    const size = selectedSizes[product.id] || (isApparel ? 'L' : 'Standar');

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      size,
      quantity: 1,
      stock: product.stock,
      isPreOrder: product.isPreOrder,
      category: product.category,
      imageUrl: product.imageUrl,
    });

    setToastProduct(`${product.name} (${size})`);
    setTimeout(() => setToastProduct(null), 3500);
  };

  return (
    <>
      {toastProduct && (
        <div className="fixed right-5 bottom-5 z-50 flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs text-white shadow-xl">
          <span>
            ✓ <strong>{toastProduct}</strong> masuk keranjang
          </span>
          <Link
            href="/keranjang"
            className="rounded-lg bg-orange-500 px-3 py-1.5 font-bold text-white hover:bg-orange-600"
          >
            Lihat Keranjang →
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const isOutOfStock = !product.isPreOrder && product.stock <= 0;
          const isApparel = product.category.toLowerCase().includes('apparel');
          const activeSize = selectedSizes[product.id] || 'L';

          return (
            <div
              key={product.id}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div>
                <div className="relative flex h-48 items-center justify-center bg-linear-to-tr from-slate-100 to-blue-50 p-6">
                  <span className="rounded-2xl bg-white/90 px-4 py-2 text-xs font-bold tracking-wider text-blue-800 uppercase shadow-sm">
                    {product.category}
                  </span>

                  <span
                    className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      product.isPreOrder
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {product.isPreOrder ? 'Pre-Order' : 'Ready Stock'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-base font-bold text-slate-900 group-hover:text-orange-600">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {product.description}
                  </p>

                  {isApparel && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {['S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() =>
                            setSelectedSizes((prev) => ({
                              ...prev,
                              [product.id]: sz,
                            }))
                          }
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold transition ${
                            activeSize === sz
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Harga</p>
                    <p className="text-base font-extrabold text-slate-900">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {product.isPreOrder ? 'PO Dibuka' : `Stok: ${product.stock}`}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => handleAdd(product)}
                  className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isOutOfStock ? 'Stok Habis' : '+ Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}