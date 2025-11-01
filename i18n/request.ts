import { getRequestConfig } from "next-intl/server";
import fs from "fs";
import path from "path";
import { getGeneratedMessages, setGeneratedMessage } from "./fallbackMessages";

const locales = ["en", "hi", "kn"];

async function loadMessages(locale: string) {
  const messagesPath = path.join(
    process.cwd(),
    "public",
    "messages",
    `${locale}.json`
  );
  try {
    const raw = await fs.promises.readFile(messagesPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading messages file at ${messagesPath}:`, err);
    throw err;
  }
}

export default getRequestConfig(async ({ locale }) => {
  // Always default to 'en' if locale is undefined or not supported
  const validLocale = locale && locales.includes(locale) ? locale : "en";

  // Load base messages (from files)
  let baseMessages: Record<string, string> = {};
  try {
    baseMessages = await loadMessages(validLocale);
  } catch (error) {
    baseMessages = await loadMessages("en");
  }

  // Overlay any generated translations we've already produced
  const generated: Record<string, string> =
    getGeneratedMessages(validLocale) || {};
  const mergedMessages: Record<string, string> = {
    ...baseMessages,
    ...generated,
  };
  
  // Force cache refresh - updated 2025-10-29
  console.log(`Loading translations for locale: ${validLocale}`);

  // Provide a getMessageFallback for next-intl that returns English fallback
  // immediately and triggers a background translation job to persist the
  // translated text using the server API.
  function getMessageFallback({
    namespace,
    key,
    error,
  }: {
    namespace?: string;
    key: string;
    error?: any;
  }) {
    const ns = namespace ? `${namespace}.` : "";
    const fullKey = `${ns}${key}`;

    // If we already have a generated message, return it
    if (generated && generated[fullKey]) return generated[fullKey];

    // Immediate fallback: return English concatenation or the key
    const englishValue =
      (baseMessages as Record<string, string>)[fullKey] ?? fullKey;

    // Only trigger background translation if the target locale is not English
    // and we have a real English source text (not just the key itself).
    // Don't block; fire-and-forget
    if (validLocale !== "en" && englishValue !== fullKey) {
      (async () => {
        try {
          // POST to our API to request translation + persistence
          await fetch("/api/translate-fallback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: fullKey,
              text: englishValue,
              targetLocale: validLocale,
            }),
          });
        } catch (e) {
          // ignore
        }
      })();
    }

    return englishValue;
  }

  return {
    messages: mergedMessages,
    locale: validLocale,
    timeZone: "Asia/Kolkata",
    getMessageFallback,
  };
});
