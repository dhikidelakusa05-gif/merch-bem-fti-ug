'use server';

import { revalidatePath } from 'next/cache';
import { db } from '../prisma/db';

const VALID_REGIONS = ['Depok', 'Karawaci', 'Kalimalang', 'Cengkareng'] as const;

export type OrderActionState = {
  error?: string;
  success?: boolean;
  orderSummary?: {
    orderCode: string;
    customerName: string;
    npm: string;
    kelas: string;
    whatsapp: string;
    productName: string;
    size: string;
    quantity: number;
    totalAmount: number;
    region: string;
  };
} | null;

export async function submitOrder(
  _prevState: OrderActionState,
  formData: FormData
): Promise<OrderActionState> {
  const productId = Number(formData.get('productId'));
  const size = String(formData.get('size') || 'Standar').trim();
  const quantity = Number(formData.get('quantity') || 1);
  const customerName = String(formData.get('customerName') || '').trim();
  const npm = String(formData.get('npm') || '').trim();
  const kelas = String(formData.get('kelas') || '').trim();
  const whatsapp = String(formData.get('whatsapp') || '').trim();
  const rawRegion = String(formData.get('region') || 'Depok').trim();
  const notes = String(formData.get('notes') || '').trim();

  const region = VALID_REGIONS.includes(rawRegion as (typeof VALID_REGIONS)[number])
    ? rawRegion
    : 'Depok';

  if (!productId || quantity < 1) {
    return { error: 'Jumlah pesanan minimal 1 item.' };
  }

  if (!customerName || !npm || !kelas || !whatsapp) {
    return { error: 'Nama lengkap, NPM, Kelas, dan Nomor WhatsApp wajib diisi.' };
  }

  try {
    const product = await db.orm.public.Product.where({ id: productId }).first();

    if (!product || !product.isActive) {
      return { error: 'Produk tidak ditemukan atau sudah tidak tersedia.' };
    }

    if (!product.isPreOrder && product.stock < quantity) {
      return {
        error:
          product.stock === 0
            ? 'Maaf, stok produk ini baru saja habis.'
            : `Stok tersisa hanya ${product.stock} pcs.`,
      };
    }

    const totalAmount = product.price * quantity;
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `FTI-${randomDigits}`;

    const createdOrder = await db.orm.public.Order.create({
      orderCode,
      customerName,
      npm,
      kelas,
      whatsapp,
      deliveryMethod: region,
      notes: notes || null,
      totalAmount,
      status: 'PENDING',
    });

    const orderId =
      createdOrder?.id ??
      (await db.orm.public.Order.where({ orderCode }).first())?.id;

    if (!orderId) {
      return { error: 'Gagal membuat kode pesanan. Silakan coba lagi.' };
    }

    await db.orm.public.OrderItem.create({
      orderId,
      productId: product.id,
      size: size || null,
      quantity,
      price: product.price,
    });

    if (!product.isPreOrder || product.stock >= quantity) {
      await db.orm.public.Product.where({ id: product.id }).update({
        stock: Math.max(0, product.stock - quantity),
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');

    return {
      success: true,
      orderSummary: {
        orderCode,
        customerName,
        npm,
        kelas,
        whatsapp,
        productName: product.name,
        size,
        quantity,
        totalAmount,
        region,
      },
    };
  } catch (err) {
    console.error('Submit order error:', err);
    return { error: 'Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.' };
  }
}