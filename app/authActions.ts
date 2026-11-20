'use server';

import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '../prisma/db';

export type AuthActionState = {
  error?: string;
} | null;

export async function registerStudent(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const npm = String(formData.get('npm') || '').trim();
  const kelas = String(formData.get('kelas') || '').trim().toUpperCase();
  const whatsapp = String(formData.get('whatsapp') || '').trim();
  const password = String(formData.get('password') || '');

  if (!name || !email || !npm || !kelas || !whatsapp || !password) {
    return { error: 'Semua kolom wajib diisi.' };
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' };
  }

  let isSuccess = false;

  try {
    const existingEmail = await db.orm.public.User.where({ email }).first();
    if (existingEmail) {
      return { error: 'Email sudah terdaftar. Silakan langsung masuk.' };
    }

    const existingNpm = await db.orm.public.User.where({ npm }).first();
    if (existingNpm) {
      return { error: 'NPM sudah terdaftar pada akun lain.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.orm.public.User.create({
      name,
      email,
      npm,
      kelas,
      whatsapp,
      password: hashedPassword,
    });

    const created =
      user ?? (await db.orm.public.User.where({ email }).first());

    if (!created) {
      return { error: 'Gagal membuat akun. Silakan coba lagi.' };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      'user_session',
      JSON.stringify({
        id: created.id,
        name: created.name,
        email: created.email,
        npm: created.npm,
        kelas: created.kelas,
        whatsapp: created.whatsapp,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    isSuccess = true;
  } catch (err) {
    console.error('Register error:', err);
    return { error: 'Terjadi kesalahan pada server saat mendaftar.' };
  }

  if (isSuccess) {
    redirect('/');
  }

  return null;
}

export async function loginStudent(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const identifier = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!identifier || !password) {
    return { error: 'Email/NPM dan password wajib diisi.' };
  }

  let targetRedirect: '/' | '/admin' | null = null;

  try {
    // 1. Cek apakah akun Admin yang login
    const admin = await db.orm.public.Admin.where({
      username: identifier,
    }).first();

    if (admin) {
      const validAdmin = await bcrypt.compare(password, admin.password);
      if (validAdmin) {
        const cookieStore = await cookies();
        cookieStore.set(
          'admin_session',
          JSON.stringify({
            id: admin.id,
            username: admin.username,
            name: admin.name,
          }),
          {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
          }
        );
        targetRedirect = '/admin';
      }
    }

    // 2. Cek akun Mahasiswa (Email atau NPM)
    if (!targetRedirect) {
      const normalizedEmail = identifier.toLowerCase();
      const userByEmail = await db.orm.public.User.where({
        email: normalizedEmail,
      }).first();
      const user =
        userByEmail ??
        (await db.orm.public.User.where({ npm: identifier }).first());

      if (!user) {
        return { error: 'Akun tidak ditemukan. Silakan daftar terlebih dahulu.' };
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return { error: 'Password salah.' };
      }

      const cookieStore = await cookies();
      cookieStore.set(
        'user_session',
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          npm: user.npm,
          kelas: user.kelas,
          whatsapp: user.whatsapp,
        }),
        {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7,
        }
      );

      targetRedirect = '/';
    }
  } catch (err) {
    console.error('Login student error:', err);
    return { error: 'Gagal terhubung ke database.' };
  }

  if (targetRedirect) {
    redirect(targetRedirect);
  }

  return null;
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
  redirect('/');
}