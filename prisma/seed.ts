import bcrypt from 'bcryptjs';
import { db } from './db';

async function main() {
  console.log('🌱 Memulai proses seeding database BEM FTI UG...');

  // 1. Buat akun Admin pertama (password di-hash dengan bcrypt)
  const hashedPassword = await bcrypt.hash('adminbemfti123', 10);

  const admin = await db.orm.public.Admin.upsert({
    create: {
      username: 'admin',
      password: hashedPassword,
      name: 'Admin BEM FTI UG',
    },
    update: {},
    conflictOn: {
      username: 'admin',
    },
  });

  console.log(`✅ Akun Admin siap: ${admin.username} (${admin.name})`);

  // 2. Buat katalog produk merchandise awal BEM FTI UG
  const products = [
    {
      name: 'Kemeja PDH / Korsa Official FTI UG',
      slug: 'pdh-korsa-official-fti-ug',
      description:
        'Kemeja PDL/PDH resmi Fakultas Teknologi Industri Universitas Gunadarma. Bahan American Drill premium, lengkap dengan bordir logo UG dan FTI.',
      price: 165000,
      stock: 50,
      category: 'Apparel',
      imageUrl: '/images/pdh-fti.jpg',
      isPreOrder: true,
      isActive: true,
    },
    {
      name: 'Kaos Event FTI TechFest 2026',
      slug: 'kaos-fti-techfest-2026',
      description:
        'T-Shirt Cotton Combed 24s sablon plastisol high-density edisi khusus mahasiswa FTI Gunadarma.',
      price: 85000,
      stock: 40,
      category: 'Apparel',
      imageUrl: '/images/kaos-fti.jpg',
      isPreOrder: false,
      isActive: true,
    },
    {
      name: 'Lanyard & ID Card Holder FTI UG',
      slug: 'lanyard-id-card-fti-ug',
      description:
        'Tali lanyard printing 2 sisi bahan tisu lembut lebar 2cm lengkap dengan kait besi dan holder kartu mahasiswa.',
      price: 25000,
      stock: 100,
      category: 'Aksesoris',
      imageUrl: '/images/lanyard-fti.jpg',
      isPreOrder: false,
      isActive: true,
    },
    {
      name: 'Tote Bag Kanvas & Sticker Pack FTI',
      slug: 'totebag-sticker-pack-fti',
      description:
        'Tote bag kanvas tebal muat laptop 15 inci dengan resleting, bonus 5 stiker vinyl waterproof bertema FTI UG.',
      price: 45000,
      stock: 35,
      category: 'Aksesoris',
      imageUrl: '/images/totebag-fti.jpg',
      isPreOrder: false,
      isActive: true,
    },
  ];

  for (const item of products) {
    await db.orm.public.Product.upsert({
      create: item,
      update: {},
      conflictOn: {
        slug: item.slug,
      },
    });
  }

  console.log(`✅ ${products.length} produk merchandise berhasil dimasukkan ke Neon!`);
}

main()
  .catch((err) => {
    console.error('❌ Gagal menjalankan seed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await db.close?.();
    process.exit(0);
  });