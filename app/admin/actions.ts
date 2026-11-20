'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '../../prisma/db';

export type ActionState = {
  error?: string;
  success?: string;
} | null;

// 1. Proses Login Admin
export async function loginAdmin(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const username = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  let isAuthenticated = false;

  try {
    const admin = await db.orm.public.Admin.where({ username }).first();

    if (!admin) {
      return { error: 'Username tidak ditemukan.' };
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return { error: 'Password salah.' };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      'admin_session',
      JSON.stringify({ id: admin.id, username: admin.username, name: admin.name }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      }
    );

    isAuthenticated = true;
  } catch (err) {
    console.error('Login error:', err);
    return { error: 'Terjadi kesalahan koneksi ke database.' };
  }

  if (isAuthenticated) {
    redirect('/admin');
  }

  return null;
}

// 2. Proses Logout Admin
export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  redirect('/admin/login');
}

// 3. Tambah Produk Baru ke Database Neon
export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const category = String(formData.get('category') || 'Apparel').trim();
  const price = Number(formData.get('price') || 0);
  const stock = Number(formData.get('stock') || 0);
  const imageUrl = String(formData.get('imageUrl') || '').trim() || '/images/placeholder.jpg';
  const isPreOrder = formData.get('isPreOrder') === 'on';

  if (!name || price <= 0) {
    return { error: 'Nama produk dan harga (lebih dari 0) wajib diisi.' };
  }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

  try {
    await db.orm.public.Product.create({
      name,
      slug,
      description,
      price,
      stock,
      category,
      imageUrl,
      isPreOrder,
      isActive: true,
    });

    revalidatePath('/admin');
    revalidatePath('/');
    return { success: `Produk "${name}" berhasil ditambahkan!` };
  } catch (err) {
    console.error('Create product error:', err);
    return { error: 'Gagal menyimpan produk ke database.' };
  }
}

// 4. Ubah Status Aktif / Sembunyikan Produk di Katalog
export async function toggleProductStatus(formData: FormData) {
  const id = Number(formData.get('id'));
  const currentActive = formData.get('isActive') === 'true';

  await db.orm.public.Product.where({ id }).update({
    isActive: !currentActive,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

// 5. Hapus Produk
export async function deleteProduct(formData: FormData) {
  const id = Number(formData.get('id'));

  await db.orm.public.Product.where({ id }).delete();

  revalidatePath('/admin');
  revalidatePath('/');
}

// 6. Ubah Status Pesanan Mahasiswa (PENDING / LUNAS / SELESAI / BATAL)
export async function updateOrderStatus(formData: FormData) {
  const id = Number(formData.get('id'));
  const status = String(formData.get('status') || 'PENDING');

  if (!id) return;

  await db.orm.public.Order.where({ id }).update({
    status,
  });

  revalidatePath('/admin');
}