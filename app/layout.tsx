import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from './context/CartContext';

export const metadata: Metadata = {
  title: 'MERCH BEM FTI UG — Official Store',
  description:
    'Official Merchandise Store BEM Fakultas Teknologi Industri Universitas Gunadarma',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}