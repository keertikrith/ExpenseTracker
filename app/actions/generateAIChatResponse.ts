'use server';

import { generateAIChatResponse, ExpenseRecord } from '@/lib/ai';
import { UserProfile } from '@/lib/userProfile';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function generateAIChatResponseAction(
  message: string, 
  userProfile?: UserProfile | null,
  conversationHistory?: Array<{role: string, content: string}>,
  locale: string = 'en'
): Promise<string> {
  try {
    // Get user's recent expense data
    const user = await currentUser();
    let expenseData: ExpenseRecord[] = [];
    
    if (user?.id) {
      try {
        const records = await db.record.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: 'desc' },
          take: 20, // Get last 20 expenses
          select: {
            id: true,
            amount: true,
            category: true,
            text: true,
            createdAt: true,
          }
        });
        
        expenseData = records.map(record => ({
          id: record.id,
          amount: record.amount,
          category: record.category,
          description: record.text,
          date: record.createdAt.toISOString(),
        }));
      } catch (dbError) {
        console.error('Error fetching expense data:', dbError);
        // Continue without expense data
      }
    }
    
    const response = await generateAIChatResponse(
      message, 
      userProfile || undefined, 
      conversationHistory,
      locale,
      expenseData
    );
    return response;
  } catch (error) {
    console.error('❌ Error in generateAIChatResponseAction:', error);
    throw new Error('Failed to generate AI response');
  }
}
