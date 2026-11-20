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
    const existingNpm = await db.orm.public.User.where({ npm }).first();
    if (existingNpm) {
      return { error: 'NPM sudah terdaftar. Silakan langsung masuk menggunakan NPM.' };
    }

    const existingEmail = await db.orm.public.User.where({ email }).first();
    if (existingEmail) {
      return { error: 'Email sudah digunakan oleh akun lain.' };
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
      user ?? (await db.orm.public.User.where({ npm }).first());

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
  const npm = String(formData.get('npm') || '').trim();
  const password = String(formData.get('password') || '');

  if (!npm || !password) {
    return { error: 'NPM dan password wajib diisi.' };
  }

  let isAuthenticated = false;

  try {
    const user = await db.orm.public.User.where({ npm }).first();

    if (!user) {
      return {
        error: 'NPM tidak ditemukan. Pastikan NPM benar atau daftar akun terlebih dahulu.',
      };
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

    isAuthenticated = true;
  } catch (err) {
    console.error('Login student error:', err);
    return { error: 'Gagal terhubung ke database.' };
  }

  if (isAuthenticated) {
    redirect('/');
  }

  return null;
}

export async function logoutStudent() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
  redirect('/');
}