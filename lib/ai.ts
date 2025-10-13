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

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
  userProfile?: UserProfile
): Promise<AIInsight[]> {
  try {
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

    const prompt = `Analyze the following expense data and provide 3-4 actionable financial insights tailored to the user's profile.
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
    const response = await result.response;
    const text = response.text();

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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Categorize this expense description into one of these categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Other. 

    Expense description: "${description}"
    
    Respond with only the category name.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const category = response.text().trim();

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
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('❌ Error generating AI answer:', error);
    return "I'm unable to provide a detailed answer at the moment. Please try refreshing the insights or check your connection.";
  }
}

export async function generateAIChatResponse(
  message: string,
  userProfile?: UserProfile,
  conversationHistory?: Array<{role: string, content: string}>
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userContext = userProfile ? `
    User Profile Context:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ${userProfile.monthlyIncome || 'Not specified'}
    - Monthly Expenses: ${userProfile.monthlyExpenses || 'Not specified'}
    - Age: ${userProfile.age || 'Not specified'}
    - Occupation: ${userProfile.occupation || 'Not specified'}
    ` : '';

    const conversationContext = conversationHistory ? `
    Recent conversation:
    ${conversationHistory.slice(-6).map(msg => `${msg.role}: ${msg.content}`).join('\n')}
    ` : '';

    const prompt = `You are a professional financial advisor AI assistant with deep knowledge of Indian financial markets and regulations. 

    ${userContext}
    ${conversationContext}

    The user is asking: "${message}"

    Provide a comprehensive, helpful response that:
    1. Directly addresses their question or concern
    2. Offers practical, actionable advice tailored to their profile
    3. Uses clear, easy-to-understand language
    4. Includes specific steps or recommendations when appropriate
    5. Maintains a professional yet friendly tone
    6. Keeps responses concise but informative (2-4 sentences)
    7. Considers Indian financial context (tax benefits, investment options, etc.)

    Focus on:
    - Budget planning and expense management
    - Debt reduction strategies
    - Investment guidance and portfolio building (including Indian mutual funds, stocks, PPF, etc.)
    - Savings optimization
    - Financial goal setting
    - Risk management
    - Tax optimization strategies (Indian tax laws)
    - Retirement planning
    - Insurance planning

    Return only the response text, no additional formatting or disclaimers.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('❌ Error generating AI chat response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment, or feel free to ask a different question about your finances.";
  }
}

export async function generateStockAnalysis(
  symbol: string,
  stockData: any,
  userProfile?: UserProfile
): Promise<{
  analysis: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number; // 0-1 normalized from rating
  reasoning: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const userContext = userProfile ? `
    User Profile:
    - Financial Goals: ${userProfile.financialGoals.join(', ')}
    - Risk Tolerance: ${userProfile.riskTolerance}
    - Investment Experience: ${userProfile.investmentExperience}
    - Monthly Income: ${userProfile.monthlyIncome || 'Not specified'}
    ` : '';

    const prompt = `Analyze this Indian stock and provide investment advice. Use the provided stock symbol exactly in your analysis and compute a numeric rating from 0 to 100 (where 0 is very bearish and 100 is very bullish). Do not default to 50. Return JSON only.

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
    const response = await result.response;
    const text = response.text();

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