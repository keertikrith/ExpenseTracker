"use client";

import React from "react";
import { NextIntlClientProvider } from "next-intl";
import DomTranslator from "./DomTranslator";

type Props = {
  locale: string;
  messages: Record<string, any>;
  children: React.ReactNode;
};

export default function ClientIntlProvider({
  locale,
  messages,
  children,
}: Props) {
  const clientGetMessageFallback = ({
    namespace,
    key,
  }: {
    namespace?: string;
    key: string;
  }) => {
    const ns = namespace ? `${namespace}.` : "";
    const fullKey = `${ns}${key}`;
    const englishValue = (messages as any)[fullKey] ?? fullKey;

    // Fire-and-forget to request server translation
    (async () => {
      try {
        const apiUrl = `${window.location.origin}/api/translate-fallback`;
        await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: fullKey,
            text: englishValue,
            targetLocale: locale,
          }),
        });
      } catch (e) {
        // ignore
      }
    })();

    return englishValue;
  };

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={clientGetMessageFallback}
      timeZone="Asia/Kolkata"
    >
      {children}
      <DomTranslator locale={locale} />
    </NextIntlClientProvider>
  );
}
