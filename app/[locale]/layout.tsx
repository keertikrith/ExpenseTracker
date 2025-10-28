import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ClerkThemeProvider from "@/components/ClerkThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ClientIntlProvider from "@/components/ClientIntlProvider";
import { getMessages } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FinvestorAI - Smart Financial Management",
  description:
    "AI-powered expense tracking app with intelligent insights, smart categorization, and personalized financial recommendations",
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}>) {
  // Await params to comply with Next.js async dynamic params
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? "en";
  const messages = await getMessages({ locale });

  return (
    <ClientIntlProvider locale={locale} messages={messages}>
      <div
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 transition-colors duration-300`}
      >
        <ThemeProvider>
          <ClerkThemeProvider>
            <Navbar />
            {children}
            <Footer />
          </ClerkThemeProvider>
        </ThemeProvider>
      </div>
    </ClientIntlProvider>
  );
}
