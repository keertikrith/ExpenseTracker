'use server';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
}

export async function getStockData(symbol: string): Promise<StockData | CryptoData> {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    if (!apiKey) {
      throw new Error('Twelve Data API key not configured');
    }

    // Determine if it's a crypto symbol
    const isCrypto = symbol.includes('/USD') || symbol.includes('/BTC') || symbol.includes('/ETH');
    
    let url: string;
    if (isCrypto) {
      url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`;
    } else {
      url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.message || 'API returned an error');
    }

    if (isCrypto) {
      // For crypto, we need to get additional data
      const quoteUrl = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
      const quoteResponse = await fetch(quoteUrl);
      const quoteData = await quoteResponse.json();

      return {
        symbol: symbol,
        name: getCryptoName(symbol),
        price: parseFloat(data.price),
        change24h: parseFloat(quoteData.change || '0'),
        changePercent24h: parseFloat(quoteData.percent_change || '0'),
        volume24h: parseFloat(quoteData.volume || '0'),
        marketCap: parseFloat(quoteData.market_cap || '0')
      } as CryptoData;
    } else {
      return {
        symbol: symbol,
        name: data.name || symbol.replace('.BSE', ''),
        price: parseFloat(data.close || data.price),
        change: parseFloat(data.change || '0'),
        changePercent: parseFloat(data.percent_change || '0'),
        volume: parseFloat(data.volume || '0'),
        marketCap: parseFloat(data.market_cap || '0'),
        high: parseFloat(data.high || '0'),
        low: parseFloat(data.low || '0'),
        open: parseFloat(data.open || '0'),
        previousClose: parseFloat(data.previous_close || '0')
      } as StockData;
    }
  } catch (error) {
    console.error('Error fetching stock data:', error);
    
    // Return mock data for development/testing
    if (symbol.includes('/USD')) {
      return {
        symbol: symbol,
        name: getCryptoName(symbol),
        price: Math.random() * 100000,
        change24h: (Math.random() - 0.5) * 1000,
        changePercent24h: (Math.random() - 0.5) * 10,
        volume24h: Math.random() * 1000000000,
        marketCap: Math.random() * 1000000000000
      } as CryptoData;
    } else {
      return {
        symbol: symbol,
        name: symbol.replace('.BSE', ''),
        price: Math.random() * 5000,
        change: (Math.random() - 0.5) * 100,
        changePercent: (Math.random() - 0.5) * 5,
        volume: Math.random() * 10000000,
        marketCap: Math.random() * 100000000000,
        high: Math.random() * 5000,
        low: Math.random() * 5000,
        open: Math.random() * 5000,
        previousClose: Math.random() * 5000
      } as StockData;
    }
  }
}

function getCryptoName(symbol: string): string {
  const cryptoNames: { [key: string]: string } = {
    'BTC/USD': 'Bitcoin',
    'ETH/USD': 'Ethereum',
    'BNB/USD': 'Binance Coin',
    'ADA/USD': 'Cardano',
    'SOL/USD': 'Solana',
    'XRP/USD': 'Ripple',
    'DOT/USD': 'Polkadot',
    'DOGE/USD': 'Dogecoin',
    'AVAX/USD': 'Avalanche',
    'MATIC/USD': 'Polygon'
  };
  return cryptoNames[symbol] || symbol;
}



