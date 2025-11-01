'use server';

import { checkUser } from '@/lib/checkUser';
import { db } from '@/lib/db';
import { generateExpenseInsights, AIInsight, ExpenseRecord } from '@/lib/ai';
import { getUserProfile } from '@/lib/userProfile';

export async function getAIInsights(locale?: string): Promise<AIInsight[]> {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user profile for personalized insights
    const userProfile = await getUserProfile();

    // Get user's recent expenses (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const expenses = await db.record.findMany({
      where: {
        userId: user.clerkUserId,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50 expenses for analysis
    });

    if (expenses.length === 0) {
      // Return localized default insights for new users
      const welcomeInsights = locale === 'hi' ? [
        {
          id: 'welcome-1',
          type: 'info' as const,
          title: 'ExpenseTracker AI में आपका स्वागत है!',
          message: 'अपने खर्च पैटर्न के बारे में व्यक्तिगत AI अंतर्दृष्टि प्राप्त करने के लिए अपने खर्च जोड़ना शुरू करें।',
          action: 'अपना पहला खर्च जोड़ें',
          confidence: 1.0,
        },
        {
          id: 'welcome-2',
          type: 'tip' as const,
          title: 'नियमित रूप से ट्रैक करें',
          message: 'सर्वोत्तम परिणामों के लिए, रोज़ाना खर्च लॉग करने का प्रयास करें। इससे हमारे AI को अधिक सटीक अंतर्दृष्टि प्रदान करने में मदद मिलती है।',
          action: 'दैनिक रिमाइंडर सेट करें',
          confidence: 1.0,
        },
      ] : locale === 'kn' ? [
        {
          id: 'welcome-1',
          type: 'info' as const,
          title: 'ExpenseTracker AI ಗೆ ಸ್ವಾಗತ!',
          message: 'ನಿಮ್ಮ ಖರ್ಚು ಮಾದರಿಗಳ ಬಗ್ಗೆ ವೈಯಕ್ತಿಕ AI ಒಳನೋಟಗಳನ್ನು ಪಡೆಯಲು ನಿಮ್ಮ ಖರ್ಚುಗಳನ್ನು ಸೇರಿಸಲು ಪ್ರಾರಂಭಿಸಿ.',
          action: 'ನಿಮ್ಮ ಮೊದಲ ಖರ್ಚು ಸೇರಿಸಿ',
          confidence: 1.0,
        },
        {
          id: 'welcome-2',
          type: 'tip' as const,
          title: 'ನಿಯಮಿತವಾಗಿ ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
          message: 'ಉತ್ತಮ ಫಲಿತಾಂಶಗಳಿಗಾಗಿ, ದೈನಂದಿನ ಖರ್ಚುಗಳನ್ನು ಲಾಗ್ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ. ಇದು ನಮ್ಮ AI ಗೆ ಹೆಚ್ಚು ನಿಖರವಾದ ಒಳನೋಟಗಳನ್ನು ಒದಗಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.',
          action: 'ದೈನಂದಿನ ನೆನಪುಗಳನ್ನು ಹೊಂದಿಸಿ',
          confidence: 1.0,
        },
      ] : [
        {
          id: 'welcome-1',
          type: 'info' as const,
          title: 'Welcome to ExpenseTracker AI!',
          message: 'Start adding your expenses to get personalized AI insights about your spending patterns.',
          action: 'Add your first expense',
          confidence: 1.0,
        },
        {
          id: 'welcome-2',
          type: 'tip' as const,
          title: 'Track Regularly',
          message: 'For best results, try to log expenses daily. This helps our AI provide more accurate insights.',
          action: 'Set daily reminders',
          confidence: 1.0,
        },
      ];
      return welcomeInsights;
    }

    // Convert to format expected by AI
    const expenseData: ExpenseRecord[] = expenses.map((expense) => ({
      id: expense.id,
      amount: expense.amount,
      category: expense.category || 'Other',
      description: expense.text,
      date: expense.createdAt.toISOString(),
    }));

    // Generate AI insights with user profile context and locale
    const insights = await generateExpenseInsights(expenseData, userProfile || undefined, locale);
    return insights;
  } catch (error) {
    console.error('Error getting AI insights:', error);

    // Return localized fallback insights
    const errorInsight = locale === 'hi' ? {
      id: 'error-1',
      type: 'warning' as const,
      title: 'अंतर्दृष्टि अस्थायी रूप से उपलब्ध नहीं है',
      message: 'हम अभी आपके खर्चों का विश्लेषण नहीं कर पा रहे हैं। कृपया कुछ मिनट बाद पुनः प्रयास करें।',
      action: 'विश्लेषण पुन: प्रयास करें',
      confidence: 0.5,
    } : locale === 'kn' ? {
      id: 'error-1',
      type: 'warning' as const,
      title: 'ಒಳನೋಟಗಳು ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ',
      message: 'ನಿಮ್ಮ ಖರ್ಚುಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲು ನಮಗೆ ಇದೀಗ ತೊಂದರೆಯಾಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ಕೆಲವು ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      action: 'ವಿಶ್ಲೇಷಣೆಯನ್ನು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
      confidence: 0.5,
    } : {
      id: 'error-1',
      type: 'warning' as const,
      title: 'Insights Temporarily Unavailable',
      message: "We're having trouble analyzing your expenses right now. Please try again in a few minutes.",
      action: 'Retry analysis',
      confidence: 0.5,
    };
    
    return [errorInsight];
  }
}
