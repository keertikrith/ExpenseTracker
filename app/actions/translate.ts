'use server'

import { translateText } from '@/lib/ai';

export async function translate(text: string, locale: string) {
  return translateText(text, locale);
}



