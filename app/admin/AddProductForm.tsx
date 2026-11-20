'use client';

import { useActionState } from 'react';
import { createProduct } from './actions';

export default function AddProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, null);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">
        + Tambah Produk Merchandise Baru
      </h2>
      <p className="mt-1 text-xs text-slate-500">
        Produk yang ditambahkan akan langsung tersimpan ke database Neon.
      </p>

      {state?.error && (
        <div className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-700">
          {state.success}
        </div>
      )}

      <form action={formAction} className="mt-4 space-y-3.5">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Nama Produk *
          </label>
          <input
            type="text"
            name="name"
            required
            placeholder="Contoh: Kemeja PDH FTI UG 2026"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Harga (Rp) *
            </label>
            <input
              type="number"
              name="price"
              required
              min={1000}
              placeholder="150000"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Stok Awal *
            </label>
            <input
              type="number"
              name="stock"
              required
              min={0}
              defaultValue={0}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Kategori
            </label>
            <select
              name="category"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Apparel">Apparel (PDH / Kaos / Hoodie)</option>
              <option value="Lanyard & ID Card">Lanyard &amp; ID Card</option>
              <option value="Aksesoris">Aksesoris (Ganci / Pin / Sticker)</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              URL Gambar (Opsional)
            </label>
            <input
              type="text"
              name="imageUrl"
              placeholder="/images/produk.jpg"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Deskripsi Produk
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="Bahan, ukuran yang tersedia, estimasi PO, dll."
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <label className="flex items-center gap-2 pt-1 text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            name="isPreOrder"
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Sistem Pre-Order (PO)
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Simpan Produk ke Katalog'}
        </button>
      </form>
    </div>
  );
}