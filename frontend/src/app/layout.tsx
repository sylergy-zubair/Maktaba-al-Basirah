import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic'
});

export const metadata: Metadata = {
  title: 'Maktabah Al-Basīrah - Accessible Book Reading',
  description: 'Accessible book reading platform for blind users with TTS support',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} ${notoSansArabic.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

