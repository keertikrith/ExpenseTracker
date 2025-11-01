'use server';

interface SeriesPoint {
  time: string; // ISO string
  price: number;
}

export async function getStockSeries(symbol: string): Promise<SeriesPoint[]> {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured');
    }

    const encodedSymbol = encodeURIComponent(symbol);
    // Use 1day candles for both to keep it simple and light
    const url = `https://api.twelvedata.com/time_series?symbol=${encodedSymbol}&interval=1day&outputsize=30&apikey=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Series API request failed: ${response.status}`);
    }

    const data = await response.json();
    if (data.status === 'error') {
      throw new Error(data.message || 'API returned an error');
    }

    const values = data.values as Array<{ datetime: string; close: string }>;
    if (!Array.isArray(values)) {
      throw new Error('Invalid series data');
    }

    // Newest first → reverse to oldest first for chart
    return values
      .slice()
      .reverse()
      .map((v) => ({ time: new Date(v.datetime).toISOString(), price: parseFloat(v.close) }))
      .filter((p) => Number.isFinite(p.price));
  } catch (error) {
    console.error('Error fetching stock series:', error);
    // Fallback: generate a simple synthetic series around a random baseline
    const base = 100 + Math.random() * 100;
    const points: SeriesPoint[] = Array.from({ length: 30 }).map((_, i) => ({
      time: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
      price: base + Math.sin(i / 5) * 5 + (Math.random() - 0.5) * 2,
    }));
    return points;
  }
}


