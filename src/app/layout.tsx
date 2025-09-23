import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const poppins = Poppins({ subsets: ['latin'], weight: ['400','500','600','700','800'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
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
      <body className={`${poppins.className} bg-gray-50 text-gray-900`}>
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
