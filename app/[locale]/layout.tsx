import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '../globals.css';
import ClerkThemeProvider from '@/components/ClerkThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/contexts/ThemeContext';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FinvestorAI - Smart Financial Management',
  description:
    'AI-powered expense tracking app with intelligent insights, smart categorization, and personalized financial recommendations',
};

export default async function LocaleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300`}>
        <ThemeProvider>
          <ClerkThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ClerkThemeProvider>
        </ThemeProvider>
      </div>
    </NextIntlClientProvider>
  );
}
