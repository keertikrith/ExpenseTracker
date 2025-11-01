'use server';

import { translateText } from '@/lib/ai';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

export async function getFinancialNews(category: string = 'general', locale: string = 'en'): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.error('NEWS_API_KEY is not configured');
    return [];
  }

  try {
    // Map our categories to queries
    const categoryToQuery: { [key: string]: string } = {
      general: 'finance OR investing OR markets',
      stocks: 'stocks OR equities OR shares OR NIFTY OR Sensex',
      crypto: 'cryptocurrency OR bitcoin OR ethereum OR blockchain',
      economy: 'economy OR GDP OR inflation OR RBI OR interest rates',
      technology: 'technology stocks OR fintech OR AI investing',
    };
    
    const query = categoryToQuery[category] || categoryToQuery.general;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=12&sortBy=publishedAt&language=en&apiKey=${apiKey}`;
    
    console.log(`Fetching news for category: ${category}, locale: ${locale}`);
    
    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, { 
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        'User-Agent': 'ExpenseTracker-AI/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`NewsAPI error: ${response.status} ${response.statusText}`);
      if (response.status === 429) {
        console.error('NewsAPI rate limit exceeded');
      } else if (response.status === 401) {
        console.error('NewsAPI authentication failed - check API key');
      }
      return [];
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error('NewsAPI returned error:', data.message);
      return [];
    }
    
    if (!Array.isArray(data.articles)) {
      console.error('NewsAPI returned invalid data structure');
      return [];
    }
    
    let mapped: NewsArticle[] = data.articles
      .filter((article: unknown) => {
        const a = article as Record<string, unknown>;
        return a.title && a.url && a.title !== '[Removed]';
      })
      .map((article: unknown, index: number) => {
        const a = article as Record<string, unknown>;
        return {
          id: `news-${Date.now()}-${index}`,
          title: String(a.title || ''),
          description: String(a.description || 'No description available'),
          url: String(a.url || ''),
          publishedAt: String(a.publishedAt || ''),
          source: String((a.source as Record<string, unknown>)?.name || 'News Source'),
          imageUrl: a.urlToImage ? String(a.urlToImage) : undefined,
        };
      });
    
    // Translate news if locale is not English
    if (locale !== 'en' && mapped.length > 0) {
      console.log(`Translating ${mapped.length} news articles to ${locale}`);
      try {
        const translatedMapped = await Promise.all(
          mapped.map(async (article) => {
            const [translatedTitle, translatedDescription] = await Promise.all([
              translateText(article.title, locale),
              translateText(article.description, locale)
            ]);
            
            return {
              ...article,
              title: translatedTitle || article.title,
              description: translatedDescription || article.description,
            };
          })
        );
        mapped = translatedMapped;
        console.log(`Successfully translated news articles to ${locale}`);
      } catch (translationError) {
        console.error('Error translating news articles:', translationError);
        // Return original articles if translation fails
      }
    }
    
    console.log(`Successfully fetched ${mapped.length} news articles`);
    return mapped;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    if (errorName === 'AbortError') {
      console.error('News API request timed out');
    } else {
      console.error('Error fetching financial news:', errorMessage);
    }
    
    // Return empty array instead of fallback data
    return [];
  }
}

