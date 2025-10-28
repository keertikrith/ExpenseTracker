"use client";

import { useEffect } from "react";

type Props = { locale: string };

function shortHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export default function DomTranslator({ locale }: Props) {
  useEffect(() => {
    if (!locale || locale === "en") return; // nothing to do for English

    const STORAGE_KEY = `dom-trans-${locale}`;
    const cacheRaw = localStorage.getItem(STORAGE_KEY);
    const cache: Record<string, string> = cacheRaw ? JSON.parse(cacheRaw) : {};

    // find visible text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node: Node) {
          const text = node.textContent?.trim();
          if (!text) return NodeFilter.FILTER_REJECT;
          if (text.length > 300) return NodeFilter.FILTER_REJECT;
          // ignore scripts, styles, and some symbols
          if (/^[-–—\d\s:,.%₹$()]+$/.test(text))
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      } as any
    );

    const toTranslate: Set<string> = new Set();
    const nodesByText: Record<string, Text[]> = {};

    while (walker.nextNode()) {
      const n = walker.currentNode as Text;
      const text = n.textContent!.trim();
      toTranslate.add(text);
      nodesByText[text] = nodesByText[text] || [];
      nodesByText[text].push(n);
    }

    // Also translate placeholders
    const inputs = Array.from(
      document.querySelectorAll("input[placeholder], textarea[placeholder]")
    ) as (HTMLInputElement | HTMLTextAreaElement)[];
    for (const el of inputs) {
      const p = (el.placeholder || "").trim();
      if (p && p.length < 300 && !/^[-–—\d\s:,.%₹$()]+$/.test(p)) {
        toTranslate.add(p);
      }
    }

    const items = Array.from(toTranslate).filter((t) => !cache[t]);
    const limit = 60; // avoid too many
    const batch = items.slice(0, limit);

    // Apply cached translations
    for (const [text, translated] of Object.entries(cache)) {
      if (nodesByText[text]) {
        nodesByText[text].forEach((n) => (n.textContent = translated));
      }
      inputs.forEach((inp) => {
        if (inp.placeholder === text) inp.placeholder = translated;
      });
    }

    if (batch.length === 0) return;

    // Translate each text individually; small rate-limited calls
    (async () => {
      for (const text of batch) {
        try {
          const key = `dom.${shortHash(text)}`;
          const apiUrl = `${location.origin}/api/translate-fallback`;
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, text, targetLocale: locale }),
          });
          const body = await res.json();
          const translated = body.translated || (await res.text()) || text;
          cache[text] = translated;
          // apply to DOM
          if (nodesByText[text])
            nodesByText[text].forEach((n) => (n.textContent = translated));
          inputs.forEach((inp) => {
            if (inp.placeholder === text) inp.placeholder = translated;
          });
        } catch (e) {
          console.error("Dom translate error for", text, e);
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    })();

    // cleanup walker
    return () => {
      /* nothing */
    };
  }, [locale]);

  return null;
}
