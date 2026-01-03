
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RawInsight {
  type?: string;
  title?: string;
  message?: string;
  action?: string;
  confidence?: number;
}

interface UserProfile {
  id: string;
  financialGoals: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  investmentExperience: 'beginner' | 'intermediate' | 'advanced';
  monthlyIncome?: number;
  monthlyExpenses?: number;
  age?: number;
  occupation?: string;
}

// Initialize Gemini AI with multiple API keys for fallback
const API_KEYS = [
  process.env.GEMINI_API_KEY || '',
  process.env.GEMINI_API_KEY_2 || '',
  process.env.GEMINI_API_KEY_3 || ''
].filter(key => key.length > 0);

console.log('🔑 Available API keys:', API_KEYS.length);

let currentKeyIndex = 0;

function getNextApiKey(): string {
  const key = API_KEYS[currentKeyIndex];
  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return key;
}

function createGenAI(apiKey?: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey || getNextApiKey());
}

export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  confidence: number;
}

export async function generateExpenseInsights(
  expenses: ExpenseRecord[],
  userProfile?: UserProfile,
  locale?: string
): Promise<AIInsight[]> {
  try {
    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Prepare expense data for AI analysis
    const expensesSummary = expenses.map((expense) => ({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    }));

    const userContext = userProfile ? `
    User Profile:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ${userProfile.monthlyIncome || 'Not specified'}
    - Monthly Expenses: ${userProfile.monthlyExpenses || 'Not specified'}
    - Age: ${userProfile.age || 'Not specified'}
    - Occupation: ${userProfile.occupation || 'Not specified'}
    ` : '';

    // Determine language instruction based on locale
    const languageInstruction = locale === 'hi'
      ? 'Respond in Hindi language.'
      : locale === 'kn'
        ? 'Respond in Kannada language.'
        : 'Respond in English language.';

    const prompt = `${languageInstruction} Analyze the following expense data and provide 3-4 actionable financial insights tailored to the user's profile.
    ${userContext}
    
    Expense Data:
    ${JSON.stringify(expensesSummary, null, 2)}

    Return a JSON array of insights with this structure:
    {
      "type": "warning|info|success|tip",
      "title": "Brief title",
      "message": "Detailed insight message with specific numbers when possible",
      "action": "Actionable suggestion",
      "confidence": 0.8
    }

    Focus on:
    1. Spending patterns (day of week, categories)
    2. Budget alerts (high spending areas)
    3. Money-saving opportunities
    4. Positive reinforcement for good habits
    5. Alignment with user's financial goals and risk tolerance

    Return only valid JSON array, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    // Clean the response by removing markdown code blocks if present
    let cleanedResponse = text.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
    }

    // Parse AI response
    const insights = JSON.parse(cleanedResponse);

    // Add IDs and ensure proper format
    const formattedInsights = insights.map(
      (insight: RawInsight, index: number) => ({
        id: `ai-${Date.now()}-${index}`,
        type: insight.type || 'info',
        title: insight.title || 'AI Insight',
        message: insight.message || 'Analysis complete',
        action: insight.action,
        confidence: insight.confidence || 0.8,
      })
    );

    return formattedInsights;
  } catch (error) {
    console.error('❌ Error generating AI insights:', error);

    // Fallback to mock insights if AI fails
    return [
      {
        id: 'fallback-1',
        type: 'info',
        title: 'AI Analysis Unavailable',
        message:
          'Unable to generate personalized insights at this time. Please try again later.',
        action: 'Refresh insights',
        confidence: 0.5,
      },
    ];
  }
}

export async function categorizeExpense(description: string): Promise<string> {
  try {
    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Categorize this expense description into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. 

    Expense description: "${description}"
    
    Respond with only the category name.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const category = (await response.text()).trim();

    const validCategories = [
      'Food',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Bills',
      'Healthcare',
      'Other',
    ];

    const finalCategory = validCategories.includes(category || '')
      ? category!
      : 'Other';
    return finalCategory;
  } catch (error) {
    console.error('❌ Error categorizing expense:', error);
    return 'Other';
  }
}

export async function generateAIAnswer(
  question: string,
  context: ExpenseRecord[],
  userProfile?: UserProfile
): Promise<string> {
  try {
    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const expensesSummary = context.map((expense) => ({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
    }));

    const userContext = userProfile ? `
    User Profile:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ${userProfile.monthlyIncome || 'Not specified'}
    - Monthly Expenses: ${userProfile.monthlyExpenses || 'Not specified'}
    ` : '';

    const prompt = `Based on the following expense data and user profile, provide a detailed and actionable answer to this question: "${question}"

    ${userContext}
    
    Expense Data:
    ${JSON.stringify(expensesSummary, null, 2)}

    Provide a comprehensive answer that:
    1. Addresses the specific question directly
    2. Uses concrete data from the expenses when possible
    3. Offers actionable advice tailored to the user's profile
    4. Keeps the response concise but informative (2-3 sentences)
    
    Return only the answer text, no additional formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    return text.trim();
  } catch (error) {
    console.error('❌ Error generating AI answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}

export async function generateAIChatResponse(
  message: string,
  userProfile?: UserProfile,
  conversationHistory?: Array<{ role: string; content: string }>,
  locale: string = 'en',
  expenseData?: ExpenseRecord[]
): Promise<string> {
  try {
    console.log('🤖 generateAIChatResponse called with:', { 
      messageLength: message.length, 
      locale, 
      hasProfile: !!userProfile,
      expenseCount: expenseData?.length || 0,
      apiKeysAvailable: API_KEYS.length 
    });

    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userContext = userProfile ? `
    User Profile Context:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ₹${userProfile.monthlyIncome || 'Not specified'}
    - Monthly Expenses: ₹${userProfile.monthlyExpenses || 'Not specified'}
    - Age: ${userProfile.age || 'Not specified'}
    - Occupation: ${userProfile.occupation || 'Not specified'}
    ` : '';

    const expenseContext = expenseData && expenseData.length > 0 ? `
    Recent Expense Data:
    ${expenseData.slice(-10).map(expense =>
        `- ₹${expense.amount} on ${expense.category} (${expense.description}) - ${new Date(expense.date).toLocaleDateString()}`
      ).join('\n')}
    
    Total Recent Expenses: ₹${expenseData.slice(-10).reduce((sum, exp) => sum + exp.amount, 0)}
    ` : '';

    const conversationContext = conversationHistory ? `
    Recent conversation:
    ${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    ` : '';

    const localeInstructions = {
      'hi': 'आपको हिंदी में जवाब देना है। देवनागरी लिपि का उपयोग करें। भारतीय रुपये (₹) का उपयोग करें।',
      'kn': 'ನೀವು ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಬೇಕು। ಕನ್ನಡ ಲಿಪಿಯನ್ನು ಬಳಸಿ। ಭಾರತೀಯ ರೂಪಾಯಿ (₹) ಬಳಸಿ।',
      'en': 'Respond in English. Use Indian Rupees (₹) for all currency references.'
    };

    const prompt = `You are a professional financial advisor AI assistant with deep knowledge of Indian financial markets and regulations. 

    IMPORTANT: ${localeInstructions[locale as keyof typeof localeInstructions] || localeInstructions.en}

    ${userContext}
    ${expenseContext}
    ${conversationContext}

    The user is asking: "${message}"

    ${expenseData && expenseData.length > 0 ? 'Use the expense data provided to give personalized advice based on their actual spending patterns.' : ''}

    Provide a comprehensive, helpful response that:
    1. Directly addresses their question or concern
    2. References their actual expense data when relevant and available
    3. Offers practical, actionable advice tailored to their profile and spending
    4. Uses clear, easy-to-understand language in the specified locale
    5. Includes specific steps or recommendations when appropriate
    6. Maintains a professional yet friendly tone
    7. Keeps responses concise but informative (2-4 sentences)
    8. Uses Indian Rupees (₹) for all currency references
    9. Considers Indian financial context (tax benefits, investment options, etc.)

    Focus on:
    - Budget planning and expense management based on their actual spending
    - Debt reduction strategies
    - Investment guidance and portfolio building (including Indian mutual funds, stocks, PPF, etc.)
    - Savings optimization based on their expense patterns
    - Financial goal setting
    - Risk management
    - Tax optimization strategies (Indian tax laws)
    - Retirement planning
    - Insurance planning

    Return only the response text, no additional formatting or disclaimers.`;

    console.log('📝 Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    console.log('✅ Gemini response received:', text.substring(0, 100));
    return text.trim();
  } catch (error) {
    console.error('❌ Error generating AI chat response:', error);
    
    const fallbackMessages = {
      'hi': 'मुझे खुशी होगी कि मैं आपकी मदद कर सकूं, लेकिन अभी मुझे तकनीकी समस्या का सामना करना पड़ रहा है। कृपया कुछ देर बाद पुनः प्रयास करें।',
      'kn': 'ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಸಂತೋಷಪಡುತ್ತೇನೆ, ಆದರೆ ಇದೀಗ ತಾಂತ್ರಿಕ ಸಮಸ್ಯೆಯನ್ನು ಎದುರಿಸುತ್ತಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      'en': "I'd be happy to help you, but I'm experiencing technical difficulties right now. Please try again in a moment."
    };

    return fallbackMessages[locale as keyof typeof fallbackMessages] || fallbackMessages.en;
  }
}

export async function generateStockAnalysis(
  symbol: string,
  stockData: Record<string, unknown>,
  userProfile?: UserProfile,
  locale: string = 'en'
): Promise<{
  analysis: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1 normalized from rating
  reasoning: string[];
}> {
  try {
    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userContext = userProfile ? `
    User Profile:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ${userProfile.monthlyIncome || 'Not specified'}
    ` : '';

    // Language instruction based on locale
    const languageInstruction = locale === 'hi'
      ? 'Respond in Hindi (हिन्दी). Use Devanagari script.'
      : locale === 'kn'
        ? 'Respond in Kannada (ಕನ್ನಡ). Use Kannada script.'
        : 'Respond in English.';

    const prompt = `Analyze this Indian stock and provide investment advice. ${languageInstruction} Use the provided stock symbol exactly in your analysis and compute a numeric rating from 0 to 100 (where 0 is very bearish and 100 is very bullish). Do not default to 50. Return JSON only.

    ${userContext}
    
    Stock Symbol: ${symbol}
    Stock Data:
    - Current Price: ₹${stockData.price}
    - Change: ${stockData.change} (${stockData.changePercent}%)
    - Volume: ${stockData.volume}
    - High: ₹${stockData.high}
    - Low: ₹${stockData.low}
    - Open: ₹${stockData.open}
    - Previous Close: ₹${stockData.previousClose}

    Provide a comprehensive analysis and return a JSON response with this exact structure:
    {
      "analysis": "Detailed technical and fundamental analysis",
      "recommendation": "BUY|SELL|HOLD",
      "rating": 73,
      "confidence": 0.85,
      "reasoning": ["Reason 1", "Reason 2", "Reason 3"]
    }

    Consider:
    1. Technical indicators (price trends, volume)
    2. Market sentiment
    3. User's risk tolerance and investment goals
    4. Indian market conditions
    5. Sector performance

    Return only valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = await response.text();

    // Clean the response
    let cleanedResponse = text.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanedResponse);
    // Normalize rating (0-100) to confidence (0-1) if provided
    let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : undefined;
    if (typeof parsed.rating === 'number' && !Number.isNaN(parsed.rating)) {
      const r = Math.max(0, Math.min(100, parsed.rating));
      confidence = r / 100;
    }
    return {
      analysis: parsed.analysis || 'No analysis provided.',
      recommendation: (parsed.recommendation || 'HOLD').toUpperCase(),
      confidence: typeof confidence === 'number' ? confidence : 0.5,
      reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [],
    };
  } catch (error) {
    console.error('❌ Error generating stock analysis:', error);
    return {
      analysis: "Unable to generate analysis at this time.",
      recommendation: 'HOLD',
      confidence: 0.5,
      reasoning: ['Analysis temporarily unavailable']
    };
  }
}

export async function translateText(text: string, targetLocale: string): Promise<string> {
  try {
    if (!text) return text;
    if (!targetLocale || targetLocale === 'en') return text;
    
    // Map locale codes to language names for better translation
    const localeToLanguage: Record<string, string> = {
      'hi': 'Hindi',
      'kn': 'Kannada',
      'en': 'English'
    };
    
    const languageName = localeToLanguage[targetLocale] || targetLocale;
    
    const genAI = createGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Translate the following English text to ${languageName}. Return ONLY the translated text without quotes, explanations, or extra commentary. Keep the meaning accurate and natural.

Text: ${text}`;
    
    const res = await model.generateContent(prompt);
    const out = await res.response.text();
    const translated = (out || text).trim();
    
    console.log(`Translated "${text.substring(0, 50)}..." to ${languageName}: "${translated.substring(0, 50)}..."`);
    
    return translated;
  } catch (error) {
    console.error(`Translation error for locale ${targetLocale}:`, error);
    return text;
  }
}