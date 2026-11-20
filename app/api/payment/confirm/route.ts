import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '../../../../prisma/db';

export async function POST(req: Request) {
  try {
    const { orderCode, paymentMethod } = await req.json();

    if (!orderCode) {
      return NextResponse.json(
        { error: 'Order code tidak valid.' },
        { status: 400 }
      );
    }

    await db.orm.public.Order.where({ orderCode }).update({
      status: 'LUNAS',
      paymentProof: paymentMethod || 'Midtrans Snap',
    });

    revalidatePath('/admin');
    revalidatePath('/pesanan');

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Confirm payment error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui status pembayaran.' },
      { status: 500 }
    );
  }
}