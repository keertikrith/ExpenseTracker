import fs from "fs";
import path from "path";

// Simple in-memory cache of generated messages for each locale
const generatedCache: Record<string, Record<string, any>> = {};

const GENERATED_DIR = path.join(
  process.cwd(),
  "public",
  "messages",
  "generated"
);

// Ensure generated directory exists
try {
  if (!fs.existsSync(GENERATED_DIR)) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
  }
} catch (e) {
  // ignore
}

export function getGeneratedMessages(locale: string) {
  if (generatedCache[locale]) return generatedCache[locale];

  const filePath = path.join(GENERATED_DIR, `${locale}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      generatedCache[locale] = parsed;
      return parsed;
    } catch (e) {
      console.error("Failed to read generated messages:", e);
    }
  }
  generatedCache[locale] = {};
  return generatedCache[locale];
}

function setNested(obj: Record<string, any>, keyPath: string, value: any) {
  const parts = keyPath.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (i === parts.length - 1) {
      cur[p] = value;
    } else {
      if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
      cur = cur[p];
    }
  }
}

export function setGeneratedMessage(
  locale: string,
  key: string,
  value: string
) {
  const messages = getGeneratedMessages(locale);
  setNested(messages, key, value);
  generatedCache[locale] = messages;
  const filePath = path.join(GENERATED_DIR, `${locale}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write generated messages file:", e);
  }
}

export function mergeGeneratedMessages(
  locale: string,
  newMessages: Record<string, any>
) {
  const messages = getGeneratedMessages(locale);
  const merged = { ...messages, ...newMessages };
  generatedCache[locale] = merged;
  const filePath = path.join(GENERATED_DIR, `${locale}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to write generated messages file:", e);
  }
}
