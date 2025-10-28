import { NextResponse } from "next/server";
import { translateText } from "@/lib/ai";
import { setGeneratedMessage } from "@/i18n/fallbackMessages";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { key, text, targetLocale } = body as {
      key: string;
      text: string;
      targetLocale: string;
    };

    if (!key || !text || !targetLocale) {
      return NextResponse.json(
        { ok: false, error: "missing parameters" },
        { status: 400 }
      );
    }

    // Use AI to translate
    const translated = await translateText(text, targetLocale);

    // Persist the generated translation
    setGeneratedMessage(targetLocale, key, translated);

    return NextResponse.json({ ok: true, key, translated });
  } catch (error) {
    console.error("translate-fallback error", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 }
    );
  }
}
