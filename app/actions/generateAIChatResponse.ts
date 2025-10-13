'use server';

import { generateAIChatResponse } from '@/lib/ai';
import { UserProfile } from '@/lib/userProfile';

export async function generateAIChatResponseAction(
  message: string, 
  userProfile?: UserProfile | null,
  conversationHistory?: Array<{role: string, content: string}>
): Promise<string> {
  try {
    const response = await generateAIChatResponse(message, userProfile || undefined, conversationHistory);
    return response;
  } catch (error) {
    console.error('❌ Error in generateAIChatResponseAction:', error);
    throw new Error('Failed to generate AI response');
  }
}
