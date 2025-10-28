"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getFinancialNews } from "@/app/actions/getFinancialNews";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

const FinancialNews = () => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("general");
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const categories = [
    { id: "general", name: t("general"), icon: "📰" },
    { id: "stocks", name: t("stocks"), icon: "📈" },
    { id: "crypto", name: t("crypto"), icon: "₿" },
    { id: "economy", name: t("economy"), icon: "🏛️" },
    { id: "technology", name: t("tech"), icon: "💻" },
  ];

  useEffect(() => {
    loadNews();
  }, [selectedCategory]);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const newsData = await getFinancialNews(selectedCategory);
      setNews(newsData);
    } catch (error) {
      console.error("Error loading news:", error);
      // Fallback to mock data
      setNews([
        {
          id: "1",
          title: t("placeholderTitle1"),
          description: t("placeholderDesc1"),
          url: "#",
          publishedAt: new Date().toISOString(),
          source: t("placeholderSource1"),
          imageUrl: "https://via.placeholder.com/300x200?text=Stock+Market",
        },
        {
          id: "2",
          title: t("placeholderTitle2"),
          description: t("placeholderDesc2"),
          url: "#",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: t("placeholderSource2"),
          imageUrl: "https://via.placeholder.com/300x200?text=Crypto+Market",
        },
        {
          id: "3",
          title: t("placeholderTitle3"),
          description: t("placeholderDesc3"),
          url: "#",
          publishedAt: new Date(Date.now() - 7200000).toISOString(),
          source: t("placeholderSource3"),
          imageUrl: "https://via.placeholder.com/300x200?text=Economy",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm sm:text-lg">📰</span>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                {t("title")}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {t("latestUpdates")}
              </p>
            </div>
          </div>
          <button
            onClick={loadNews}
            disabled={isLoading}
            className="px-3 py-1.5 bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 hover:from-orange-700 hover:via-red-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed"
          >
            {isLoading ? tCommon("loading") : tCommon("refresh")}
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* News Content */}
      <div className="p-4 sm:p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-100 dark:bg-gray-700 p-4 rounded-xl"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex gap-4">
                  <div className="w-20 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    {article.imageUrl ? (
                      <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">📰</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {article.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {article.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(article.publishedAt)}
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                        >
                          {t("readMore")}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialNews;
