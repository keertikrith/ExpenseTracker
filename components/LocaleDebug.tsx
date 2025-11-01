'use client';

import { useTranslations, useLocale } from 'next-intl';

export default function LocaleDebug() {
  const t = useTranslations('common');
  const tNavbar = useTranslations('navbar');
  const tHome = useTranslations('home');
  const locale = useLocale();

  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
      <h3 className="font-bold text-red-800 dark:text-red-200 mb-2">
        🔍 Locale Debug (Current: {locale})
      </h3>
      <div className="space-y-1 text-sm">
        <p><strong>Home:</strong> &quot;{t('home')}&quot;</p>
        <p><strong>AI Chat:</strong> &quot;{t('aiChat')}&quot;</p>
        <p><strong>Markets:</strong> &quot;{t('markets')}&quot;</p>
        <p><strong>Navbar Title:</strong> &quot;{tNavbar('title')}&quot;</p>
        <p><strong>Sign In:</strong> &quot;{t('signIn')}&quot;</p>
        <p><strong>Welcome Back:</strong> &quot;{tHome('welcomeBack', { name: 'Test' })}&quot;</p>
        <p><strong>Joined:</strong> &quot;{tHome('joined')}&quot;</p>
      </div>
      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
        If you see keys like &quot;common.home&quot; instead of translated text, translations are broken.
      </p>
    </div>
  );
}
