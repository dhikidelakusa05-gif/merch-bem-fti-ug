'use client';

import { useState, useActionState, ChangeEvent } from 'react';
import { createProduct } from './actions';

function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDimension = 640;
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas tidak didukung browser.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => reject(new Error('File gambar tidak valid.'));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

export default function AddProductForm() {
  const [state, formAction, isPending] = useActionState(createProduct, null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError('');
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa gambar (JPG, PNG, atau WebP).');
      return;
    }

    setIsProcessingImg(true);
    try {
      const compressed = await compressImageToDataUrl(file);
      setImageUrl(compressed);
    } catch {
      setUploadError('Gagal memproses gambar. Coba pilih file lain.');
    } finally {
      setIsProcessingImg(false);
    }
  };

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

      <form
        action={async (fd) => {
          await formAction(fd);
          setImageUrl('');
        }}
        className="mt-4 space-y-3.5"
      >
        <input type="hidden" name="imageUrl" value={imageUrl} />

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

        {/* Upload Foto Produk */}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">
            Foto Produk (Dari Perangkat / URL)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-blue-700"
          />

          {uploadError && (
            <p className="mt-1 text-[11px] font-medium text-red-600">
              {uploadError}
            </p>
          )}

          {imageUrl && (
            <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <img
                src={imageUrl}
                alt="Preview produk"
                className="h-14 w-14 rounded-lg object-cover"
              />
              <div className="flex-1 text-[11px] text-slate-600">
                <p className="font-semibold text-emerald-700">
                  Foto siap diunggah
                </p>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="mt-0.5 text-red-600 hover:underline"
                >
                  Hapus foto
                </button>
              </div>
            </div>
          )}
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
          disabled={isPending || isProcessingImg}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {isProcessingImg
            ? 'Memproses Foto...'
            : isPending
            ? 'Menyimpan...'
            : 'Simpan Produk ke Katalog'}
        </button>
      </form>
    </div>
  );
}