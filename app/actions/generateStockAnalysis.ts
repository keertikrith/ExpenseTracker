'use server';

import { generateStockAnalysis as generateStockAnalysisLib } from '@/lib/ai';
import { UserProfile } from '@/lib/userProfile';

export async function generateStockAnalysis(
  symbol: string,
  stockData: any,
  userProfile?: UserProfile | null
): Promise<{
  analysis: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string[];
}> {
  try {
    const analysis = await generateStockAnalysisLib(symbol, stockData, userProfile || undefined);
    return analysis;
  } catch (error) {
    console.error('❌ Error in generateStockAnalysis action:', error);
    return {
      analysis: "Unable to generate analysis at this time.",
      recommendation: 'HOLD',
      confidence: 0.5,
      reasoning: ['Analysis temporarily unavailable']
    };
  }
}

