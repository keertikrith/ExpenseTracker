"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useCallback } from "react";
import { translate } from "@/app/actions/translate";

export function useTranslationWithFallback(namespace?: string) {
  const t = useTranslations(namespace);
  const [translating, setTranslating] = useState(false);

  const locale = useLocale();

  const translateWithFallback = useCallback(
    async (key: string, fallbackText?: string) => {
      try {
        // First try to get the translation from i18n
        const translation = t(key);

        // If we get the key back (meaning translation not found), use Gemini fallback
        if (translation === key && fallbackText) {
          setTranslating(true);
          const geminiTranslation = await translate(
            fallbackText,
            locale || "en"
          );
          setTranslating(false);
          return geminiTranslation;
        }

        return translation;
      } catch (error) {
        console.error("Translation error:", error);
        return fallbackText || key;
      }
    },
    [t, locale]
  );

  return { t, translateWithFallback, translating };
}
