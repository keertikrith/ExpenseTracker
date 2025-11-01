"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import DomTranslator from "./DomTranslator";
import LocalePersistence from "./LocalePersistence";

type Props = {
  locale: string;
  messages: Record<string, unknown>;
  children: React.ReactNode;
};

export default function ClientIntlProvider({
  locale,
  messages,
  children,
}: Props) {
  const clientGetMessageFallback = ({
    key,
    namespace,
  }: {
    key: string;
    namespace?: string;
  }): string => {
    const ns = namespace ? `${namespace}.` : "";
    const fullKey = `${ns}${key}`;
    const englishValue = (messages as Record<string, unknown>)[fullKey];
    
    // Ensure we return a string
    const fallbackValue = typeof englishValue === 'string' ? englishValue : fullKey;

    // Fire-and-forget to request server translation
    (async () => {
      try {
        const apiUrl = `${window.location.origin}/api/translate-fallback`;
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: fullKey,
            text: fallbackValue,
            targetLocale: locale,
          }),
        });
      } catch {
        // ignore
      }
    })();

    return fallbackValue;
  };

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={clientGetMessageFallback}
      timeZone="Asia/Kolkata"
    >
      {children}
      <LocalePersistence />
      <DomTranslator locale={locale} />
    </NextIntlClientProvider>
  );
}
