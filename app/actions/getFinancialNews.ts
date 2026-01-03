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
  // Use NewsData.io for Hindi and Kannada, NewsAPI for English
  if (locale === 'hi' || locale === 'kn') {
    return getNewsDataNews(category, locale);
  } else {
    return getNewsAPINews(category, locale);
  }
}

// NewsData.io API for Hindi/Kannada news
async function getNewsDataNews(category: string, locale: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  
  if (!apiKey) {
    console.error('NEWSDATA_API_KEY is not configured');
    return [];
  }

  try {
    // Map our categories to NewsData.io categories
    const categoryToNewsDataCategory: { [key: string]: string } = {
      general: 'business',
      stocks: 'business',
      crypto: 'technology',
      economy: 'business',
      technology: 'technology',
    };
    
    const newsDataCategory = categoryToNewsDataCategory[category] || 'business';
    const language = locale === 'hi' ? 'hi' : 'kn'; // Hindi or Kannada
    
    const url = `https://newsdata.io/api/1/latest?apikey=${apiKey}&q=${newsDataCategory}&language=${language}`;
    
    console.log(`Fetching NewsData.io news for category: ${category}, locale: ${locale}, language: ${language}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
    
    const response = await fetch(url, { 
      next: { revalidate: 300 },
      signal: controller.signal,
      headers: {
        'User-Agent': 'ExpenseTracker-AI/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`NewsData.io error: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      console.error('NewsData.io returned error:', data.message);
      return [];
    }
    
    if (!Array.isArray(data.results)) {
      console.error('NewsData.io returned invalid data structure');
      return [];
    }
    
    const mapped: NewsArticle[] = data.results
      .filter((article: unknown) => {
        const a = article as Record<string, unknown>;
        return a.title && a.link && a.title !== '[Removed]';
      })
      .map((article: unknown, index: number) => {
        const a = article as Record<string, unknown>;
        return {
          id: `newsdata-${Date.now()}-${index}`,
          title: String(a.title || ''),
          description: String(a.description || 'No description available'),
          url: String(a.link || ''),
          publishedAt: String(a.pubDate || ''),
          source: String(a.source_id || 'News Source'),
          imageUrl: a.image_url ? String(a.image_url) : undefined,
        };
      });
    
    console.log(`Successfully fetched ${mapped.length} NewsData.io articles in ${language}`);
    return mapped;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    if (errorName === 'AbortError') {
      console.error('NewsData.io API request timed out');
    } else {
      console.error('Error fetching NewsData.io news:', errorMessage);
    }
    
    return [];
  }
}

// Original NewsAPI function for English news
async function getNewsAPINews(category: string, locale: string): Promise<NewsArticle[]> {
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
    
    console.log(`Fetching NewsAPI news for category: ${category}, locale: ${locale}`);
    
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
    
    const mapped: NewsArticle[] = data.articles
      .filter((article: unknown) => {
        const a = article as Record<string, unknown>;
        return a.title && a.url && a.title !== '[Removed]';
      })
      .map((article: unknown, index: number) => {
        const a = article as Record<string, unknown>;
        return {
          id: `newsapi-${Date.now()}-${index}`,
          title: String(a.title || ''),
          description: String(a.description || 'No description available'),
          url: String(a.url || ''),
          publishedAt: String(a.publishedAt || ''),
          source: String((a.source as Record<string, unknown>)?.name || 'News Source'),
          imageUrl: a.urlToImage ? String(a.urlToImage) : undefined,
        };
      });
    
    console.log(`Successfully fetched ${mapped.length} NewsAPI articles`);
    return mapped;
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    if (errorName === 'AbortError') {
      console.error('NewsAPI request timed out');
    } else {
      console.error('Error fetching NewsAPI news:', errorMessage);
    }
    
    return [];
  }
}

