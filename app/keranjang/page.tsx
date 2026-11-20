import { Suspense } from 'react';
import { cookies } from 'next/headers';
import Navbar from '../components/Navbar';
import { SessionUser } from '../components/NavbarClient';
import CartPageClient from './CartPageClient';

async function CartContent() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('user_session')?.value;
  let user: SessionUser = null;

  if (raw) {
    try {
      user = JSON.parse(raw);
    } catch {
      user = null;
    }
  }

  return <CartPageClient user={user} />;
}

export default function KeranjangPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Suspense fallback={<div className="h-16 bg-slate-900" />}>
        <Navbar />
      </Suspense>
      <Suspense
        fallback={
          <div className="p-12 text-center text-sm text-slate-500">
            Memuat keranjang belanja...
          </div>
        }
      >
        <CartContent />
      </Suspense>
    </div>
  );
}