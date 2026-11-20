import { NextResponse } from 'next/server';
import { db } from '../../../../prisma/db';

type CheckoutItemInput = {
  productId: number;
  name: string;
  price: number;
  size: string;
  quantity: number;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      items,
      region,
      customerName,
      npm,
      kelas,
      whatsapp,
      notes,
    }: {
      items: CheckoutItemInput[];
      region: string;
      customerName: string;
      npm: string;
      kelas: string;
      whatsapp: string;
      notes?: string;
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang belanja masih kosong.' },
        { status: 400 }
      );
    }

    if (!customerName || !npm || !kelas || !whatsapp) {
      return NextResponse.json(
        { error: 'Nama, NPM, Kelas, dan WhatsApp wajib diisi.' },
        { status: 400 }
      );
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}${String(now.getDate()).padStart(2, '0')}`;
    const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderCode = `ORD-${ymd}-${rand}`;

    const createdOrder = await db.orm.public.Order.create({
      orderCode,
      customerName,
      npm,
      kelas,
      whatsapp,
      deliveryMethod: region || 'Depok',
      notes: notes || null,
      totalAmount,
      status: 'PENDING',
    });

    const orderId =
      createdOrder?.id ??
      (await db.orm.public.Order.where({ orderCode }).first())?.id;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Gagal menyimpan pesanan ke database.' },
        { status: 500 }
      );
    }

    for (const item of items) {
      await db.orm.public.OrderItem.create({
        orderId,
        productId: item.productId,
        size: item.size || 'Standar',
        quantity: item.quantity,
        price: item.price,
      });

      const product = await db.orm.public.Product.where({
        id: item.productId,
      }).first();

      if (product && (!product.isPreOrder || product.stock >= item.quantity)) {
        await db.orm.public.Product.where({ id: product.id }).update({
          stock: Math.max(0, product.stock - item.quantity),
        });
      }
    }

    // Jika MIDTRANS_SERVER_KEY tersedia di .env, minta Snap Token asli ke Midtrans Sandbox
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    let snapToken: string | null = null;

    if (serverKey && !serverKey.includes('ISI_KEY')) {
      const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
      const midtransRes = await fetch(
        'https://app.sandbox.midtrans.com/snap/v1/transactions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify({
            transaction_details: {
              order_id: orderCode,
              gross_amount: totalAmount,
            },
            customer_details: {
              first_name: customerName,
              phone: whatsapp,
            },
            item_details: items.map((i) => ({
              id: String(i.productId),
              price: i.price,
              quantity: i.quantity,
              name: `${i.name} (${i.size})`.slice(0, 50),
            })),
          }),
        }
      );

      if (midtransRes.ok) {
        const snapData = await midtransRes.json();
        snapToken = snapData.token || null;
        if (snapToken) {
          await db.orm.public.Order.where({ id: orderId }).update({ snapToken });
        }
      }
    }

    return NextResponse.json({
      orderId,
      orderCode,
      totalAmount,
      snapToken,
    });
  } catch (err) {
    console.error('Create payment error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memproses transaksi.' },
      { status: 500 }
    );
  }
}