'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function LocaleDebug() {
  const t = useTranslations('common');
  const tNavbar = useTranslations('navbar');
  const locale = useLocale();

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
      <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
        🔍 Locale Debug (Current: {locale})
      </h3>
      <div className="space-y-1 text-sm">
        <p><strong>Home:</strong> "{t('home')}"</p>
        <p><strong>AI Chat:</strong> "{t('aiChat')}"</p>
        <p><strong>Markets:</strong> "{t('markets')}"</p>
        <p><strong>Navbar Title:</strong> "{tNavbar('title')}"</p>
        <p><strong>Sign In:</strong> "{t('signIn')}"</p>
      </div>
      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
        If you see keys like "common.home" instead of translated text, translations are broken.
      </p>
    </div>
  );
}
