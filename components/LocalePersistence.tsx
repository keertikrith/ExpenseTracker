'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

export default function LocalePersistence() {
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set cookie for server-side access
      document.cookie = `preferred-locale=${locale}; path=/; max-age=31536000; SameSite=Lax`;
      
      // Also store in localStorage for client-side access
      localStorage.setItem('preferred-locale', locale);
    }
  }, [locale]);

  return null;
}