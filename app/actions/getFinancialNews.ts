'use server';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  imageUrl?: string;
}

export async function getFinancialNews(category: string = 'general'): Promise<NewsArticle[]> {
  try {
    const mockNews: NewsArticle[] = [
      {
        id: '1',
        title: 'Indian Stock Market Shows Strong Performance',
        description: 'The Indian stock market continues to show resilience with major indices reaching new highs amid global economic uncertainties.',
        url: 'https://example.com/news/1',
        publishedAt: new Date().toISOString(),
        source: 'Financial Times',
        imageUrl: 'https://via.placeholder.com/300x200?text=Stock+Market'
      },
      {
        id: '2',
        title: 'Cryptocurrency Market Analysis',
        description: 'Bitcoin and other major cryptocurrencies show mixed signals as investors navigate through market volatility.',
        url: 'https://example.com/news/2',
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: 'Crypto News',
        imageUrl: 'https://via.placeholder.com/300x200?text=Crypto+Market'
      },
      {
        id: '3',
        title: 'Economic Growth Forecast',
        description: 'Experts predict continued economic growth for India with focus on digital transformation and infrastructure development.',
        url: 'https://example.com/news/3',
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: 'Economic Times',
        imageUrl: 'https://via.placeholder.com/300x200?text=Economy'
      },
      {
        id: '4',
        title: 'Technology Stocks Rally',
        description: 'Technology companies show strong performance as digital transformation accelerates across industries.',
        url: 'https://example.com/news/4',
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: 'Tech News',
        imageUrl: 'https://via.placeholder.com/300x200?text=Technology'
      },
      {
        id: '5',
        title: 'Banking Sector Updates',
        description: 'Major banks report strong quarterly results with improved asset quality and digital banking adoption.',
        url: 'https://example.com/news/5',
        publishedAt: new Date(Date.now() - 14400000).toISOString(),
        source: 'Banking Today',
        imageUrl: 'https://via.placeholder.com/300x200?text=Banking'
      }
    ];

    // Filter news based on category (used for mock fallback)
    const categoryKeywords: { [key: string]: string[] } = {
      stocks: ['stock', 'market', 'trading', 'equity', 'share'],
      crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'digital currency'],
      economy: ['economy', 'gdp', 'inflation', 'interest rate', 'monetary'],
      technology: ['tech', 'technology', 'digital', 'software', 'ai', 'artificial intelligence'],
      general: []
    };

    const apiKey = process.env.NEWS_API_KEY;
    if (apiKey) {
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
      const response = await fetch(url, { next: { revalidate: 300 } });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.articles)) {
          const mapped: NewsArticle[] = data.articles.map((article: any, index: number) => ({
            id: `news-${index}`,
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article?.source?.name || 'News',
            imageUrl: article.urlToImage,
          }));
          // Filter out empty items
          return mapped.filter(n => n.title && n.url);
        }
      }
      // If API fails, fall through to mock
    }

    const keywords = categoryKeywords[category] || [];
    if (keywords.length === 0) {
      return mockNews;
    }
    return mockNews.filter(article => 
      keywords.some(keyword => 
        article.title.toLowerCase().includes(keyword) || 
        article.description.toLowerCase().includes(keyword)
      )
    );
  } catch (error) {
    console.error('Error fetching financial news:', error);
    // Last-resort fallback to mock
    return [
      {
        id: 'fallback-1',
        title: 'News temporarily unavailable',
        description: 'We could not load live news at the moment. Showing placeholder content.',
        url: '#',
        publishedAt: new Date().toISOString(),
        source: 'System',
      },
    ];
  }
}

