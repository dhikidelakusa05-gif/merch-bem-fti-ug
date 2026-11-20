import { cookies } from 'next/headers';
import NavbarClient, { SessionUser } from './NavbarClient';

export default async function Navbar() {
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

  return <NavbarClient user={user} />;
}