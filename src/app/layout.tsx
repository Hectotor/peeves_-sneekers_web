import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Peeves Sneakers — Sneakers pour grands pieds (pointures larges et grandes tailles)',
  description:
    "Boutique spécialisée en grandes pointures et pieds larges. Découvrez des sneakers confortables et stylées, du quotidien à la performance, avec des tailles étendues.",
  icons: {
    icon: '/logo_peeves.png',
    shortcut: '/logo_peeves.png',
    apple: '/logo_peeves.png',
  },
  openGraph: {
    title: 'Peeves Sneakers — Grandes pointures & pieds larges',
    description:
      "Sneakers pour grands pieds et pieds larges. Confort, style et pointures étendues.",
    images: ['/logo_peeves.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-gray-50 text-gray-900`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
