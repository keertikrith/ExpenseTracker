import StockMarket from "@/components/StockMarket";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import Guest from "@/components/Guest";
import { getTranslations } from "next-intl/server";

export default async function StockMarketPage() {
  const user = await currentUser();
  const t = await getTranslations("markets");
  if (!user) {
    return <Guest />;
  }

  return (
    <main className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
              {t("title")}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <StockMarket mode="stocks" />
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/crypto"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>₿</span>
                  <span className="font-medium">{t("viewCrypto")}</span>
                </div>
                <span>→</span>
              </div>
            </Link>
            <Link
              href="/news"
              className="block p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span>📰</span>
                  <span className="font-medium">{t("readNews")}</span>
                </div>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
