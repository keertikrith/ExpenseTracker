'use client';

import { useState, useEffect } from 'react';
import { getStockData } from '@/app/actions/getStockData';
import { generateStockAnalysis } from '@/app/actions/generateStockAnalysis';
import { getUserProfile } from '@/lib/userProfile';
import { getStockSeries } from '@/app/actions/getStockSeries';
import { useTranslations, useLocale } from 'next-intl';

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

interface StockAnalysis {
  analysis: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string[];
}

type Mode = 'stocks' | 'crypto' | 'both';

const StockMarket = ({ mode = 'both' }: { mode?: Mode }) => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [crypto, setCrypto] = useState<CryptoData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stocks' | 'crypto'>(mode === 'crypto' ? 'crypto' : 'stocks');
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [stockAnalysis, setStockAnalysis] = useState<StockAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [series, setSeries] = useState<Array<{ time: string; price: number }>>([]);
  
  const t = useTranslations('markets');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  // Popular Indian stocks
  const popularStocks = [
    'RELIANCE.BSE', 'TCS.BSE', 'HDFCBANK.BSE', 'INFY.BSE', 'HINDUNILVR.BSE',
    'ICICIBANK.BSE', 'SBIN.BSE', 'BHARTIARTL.BSE', 'ITC.BSE', 'KOTAKBANK.BSE',
    'LT.BSE', 'ASIANPAINT.BSE', 'AXISBANK.BSE', 'MARUTI.BSE', 'NESTLEIND.BSE'
  ];

  // Popular cryptocurrencies
  const popularCrypto = [
    'BTC/USD', 'ETH/USD', 'BNB/USD', 'ADA/USD', 'SOL/USD',
    'XRP/USD', 'DOT/USD', 'DOGE/USD', 'AVAX/USD', 'MATIC/USD'
  ];

  useEffect(() => {
    loadInitialData();
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      if (mode !== 'crypto') {
        const stockPromises = popularStocks.slice(0, 10).map(symbol => 
          getStockData(symbol).catch(() => null)
        );
        const stockResults = await Promise.all(stockPromises);
        const validStocks = stockResults.filter(stock => stock !== null) as StockData[];
        setStocks(validStocks);
      }

      if (mode !== 'stocks') {
        const cryptoPromises = popularCrypto.slice(0, 10).map(symbol => 
          getStockData(symbol).catch(() => null)
        );
        const cryptoResults = await Promise.all(cryptoPromises);
        const validCrypto = cryptoResults.filter(crypto => crypto !== null) as CryptoData[];
        setCrypto(validCrypto);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const symbol = searchQuery.toUpperCase();
      const data = await getStockData(symbol);
      
      if (activeTab === 'stocks') {
        if ('change' in data) {
          const stockData = data as StockData;
          setStocks(prev => {
            const exists = prev.find(stock => stock.symbol === stockData.symbol);
            if (!exists) {
              return [stockData, ...prev];
            }
            return prev;
          });
        } else {
          alert('Please search a valid stock symbol (e.g., RELIANCE.BSE)');
        }
      } else {
        if ('change24h' in data) {
          const cryptoData = data as CryptoData;
          setCrypto(prev => {
            const exists = prev.find(c => c.symbol === cryptoData.symbol);
            if (!exists) {
              return [cryptoData, ...prev];
            }
            return prev;
          });
        } else {
          alert('Please search a valid crypto pair (e.g., BTC/USD)');
        }
      }
    } catch (error) {
      console.error('Error searching:', error);
      alert('Stock not found. Please check the symbol and try again.');
    } finally {
      setIsLoading(false);
      setSearchQuery('');
    }
  };

  const handleStockClick = async (stock: StockData) => {
    setSelectedStock(stock);
    setIsAnalyzing(true);
    try {
      // Load series in parallel with analysis
      const [seriesData, analysis] = await Promise.all([
        getStockSeries(stock.symbol),
        generateStockAnalysis(stock.symbol, stock, userProfile, locale),
      ]);
      setSeries(seriesData);
      setStockAnalysis(analysis);
    } catch (error) {
      console.error('Error generating analysis:', error);
      setStockAnalysis({
        analysis: "Unable to generate analysis at this time.",
        recommendation: 'HOLD',
        confidence: 0.5,
        reasoning: ['Analysis temporarily unavailable']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatCryptoPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
    return volume.toString();
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'BUY':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'SELL':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      case 'HOLD':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-800';
    }
  };

  const getGrowwUrl = (symbol: string) => {
    const cleanSymbol = symbol.replace('.BSE', '').toLowerCase();
    return `https://groww.in/stocks/${cleanSymbol}`;
  };

  return (
    <div className='bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100/50 dark:border-gray-700/50 hover:shadow-2xl'>
      {/* Header */}
      <div className='p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg'>
              <span className='text-white text-sm sm:text-lg'>📈</span>
            </div>
            <div>
            <h3 className='text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100'>
              {mode === 'crypto' ? t('cryptocurrency') : mode === 'stocks' ? t('indianStocks') : t('stockMarketCrypto')}
            </h3>
            <p className='text-xs text-gray-500 dark:text-gray-400 mt-0.5'>
              {t('realTimeData')}
            </p>
            </div>
          </div>
          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className='px-3 py-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-lg text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed'
          >
            {isLoading ? tCommon('loading') : tCommon('refresh')}
          </button>
        </div>

        {/* Search */}
        <div className='flex gap-2'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'stocks' ? t('searchPlaceholder') : t('cryptoSearchPlaceholder')}
            className='flex-1 p-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !searchQuery.trim()}
            className='px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed'
          >
            {tCommon('search')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex border-b border-gray-100 dark:border-gray-700'>
        <button
          onClick={() => setActiveTab('stocks')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'stocks'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('indianStocks')}
        </button>
        <button
          onClick={() => setActiveTab('crypto')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'crypto'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {t('cryptocurrency')}
        </button>
      </div>

      {/* Content */}
      <div className='p-4 sm:p-6'>
      {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='animate-pulse bg-gray-100 dark:bg-gray-700 p-4 rounded-xl'>
                <div className='flex justify-between items-center'>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-24'></div>
                    <div className='h-3 bg-gray-200 dark:bg-gray-600 rounded w-32'></div>
                  </div>
                  <div className='space-y-2'>
                    <div className='h-4 bg-gray-200 dark:bg-gray-600 rounded w-20'></div>
                    <div className='h-3 bg-gray-200 dark:bg-gray-600 rounded w-16'></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='space-y-3'>
            {mode === 'crypto' ? null : mode === 'stocks' ? (
              stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                          {stock.symbol.replace('.BSE', '')}
                        </h4>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {stock.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400'>
                        <span>{t('volume')}: {formatVolume(stock.volume)}</span>
                        <span>{t('high')}: {formatPrice(stock.high)}</span>
                        <span>{t('low')}: {formatPrice(stock.low)}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                        {formatPrice(stock.price)}
                      </div>
                      <div className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
                        {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : activeTab === 'stocks' ? (
              stocks.map((stock) => (
                <div
                  key={stock.symbol}
                  onClick={() => handleStockClick(stock)}
                  className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                          {stock.symbol.replace('.BSE', '')}
                        </h4>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {stock.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400'>
                        <span>{t('volume')}: {formatVolume(stock.volume)}</span>
                        <span>{t('high')}: {formatPrice(stock.high)}</span>
                        <span>{t('low')}: {formatPrice(stock.low)}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                        {formatPrice(stock.price)}
                      </div>
                      <div className={`text-sm font-medium ${getChangeColor(stock.change)}`}>
                        {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
            {mode === 'stocks' ? null : mode === 'crypto' ? (
              crypto.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                          {crypto.symbol}
                        </h4>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {crypto.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400'>
                        <span>{t('volume')}: {formatVolume(crypto.volume24h)}</span>
                        <span>{t('marketCap')}: ${formatVolume(crypto.marketCap)}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                        {formatCryptoPrice(crypto.price)}
                      </div>
                      <div className={`text-sm font-medium ${getChangeColor(crypto.change24h)}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{formatCryptoPrice(crypto.change24h)} ({crypto.changePercent24h >= 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : activeTab === 'crypto' ? (
              crypto.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className='p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-200'
                >
                  <div className='flex justify-between items-start'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h4 className='font-semibold text-gray-900 dark:text-gray-100 text-sm'>
                          {crypto.symbol}
                        </h4>
                        <span className='text-xs text-gray-500 dark:text-gray-400'>
                          {crypto.name}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400'>
                        <span>{t('volume')}: {formatVolume(crypto.volume24h)}</span>
                        <span>{t('marketCap')}: ${formatVolume(crypto.marketCap)}</span>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                        {formatCryptoPrice(crypto.price)}
                      </div>
                      <div className={`text-sm font-medium ${getChangeColor(crypto.change24h)}`}>
                        {crypto.change24h >= 0 ? '+' : ''}{formatCryptoPrice(crypto.change24h)} ({crypto.changePercent24h >= 0 ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%)
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        )}
      </div>

      {/* Stock Analysis Modal */}
      {selectedStock && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                {selectedStock.symbol.replace('.BSE', '')} {t('analysis')}
              </h3>
              <button
                onClick={() => {
                  setSelectedStock(null);
                  setStockAnalysis(null);
                }}
                className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
              >
                <span className='text-gray-500 dark:text-gray-400'>✕</span>
              </button>
            </div>

            {/* Chart */}
            {series.length > 0 && (
              <div className='mb-6 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
                <svg viewBox='0 0 600 160' className='w-full h-40'>
                  <defs>
                    <linearGradient id='grad' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='0%' stopColor='rgba(16,185,129,0.5)' />
                      <stop offset='100%' stopColor='rgba(16,185,129,0.0)' />
                    </linearGradient>
                  </defs>
                  {(() => {
                    const prices = series.map(p => p.price);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    const pad = (max - min) * 0.1 || 1;
                    const yMin = min - pad;
                    const yMax = max + pad;
                    const toX = (i: number) => (i / (series.length - 1)) * 600;
                    const toY = (v: number) => 160 - ((v - yMin) / (yMax - yMin)) * 140 - 10;
                    const d = series
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.price).toFixed(1)}`)
                      .join(' ');
                    const area = `${d} L 600 160 L 0 160 Z`;
                    return (
                      <g>
                        <path d={area} fill='url(#grad)' />
                        <path d={d} fill='none' stroke='rgb(16,185,129)' strokeWidth='2' />
                      </g>
                    );
                  })()}
                </svg>
              </div>
            )}

            {/* Stock Info */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{t('currentPrice')}</div>
                <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatPrice(selectedStock.price)}
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{t('change')}</div>
                <div className={`text-lg font-bold ${getChangeColor(selectedStock.change)}`}>
                  {selectedStock.change >= 0 ? '+' : ''}{formatPrice(selectedStock.change)}
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{t('volume')}</div>
                <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatVolume(selectedStock.volume)}
                </div>
              </div>
              <div className='bg-gray-50 dark:bg-gray-700 p-3 rounded-lg'>
                <div className='text-xs text-gray-500 dark:text-gray-400'>{t('marketCap')}</div>
                <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
                  {formatVolume(selectedStock.marketCap)}
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            {isAnalyzing ? (
              <div className='bg-gray-50 dark:bg-gray-700 p-6 rounded-lg'>
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg flex items-center justify-center'>
                    <span className='text-white text-sm'>🤖</span>
                  </div>
                  <div className='flex space-x-1'>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                    <div className='w-2 h-2 bg-gray-400 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className='text-gray-600 dark:text-gray-400'>{t('analyzingStock')}</span>
                </div>
              </div>
            ) : stockAnalysis ? (
              <div className='space-y-4'>
                {/* Recommendation */}
                <div className={`p-4 rounded-lg border ${getRecommendationColor(stockAnalysis.recommendation)}`}>
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='text-sm font-medium'>{t('recommendation')}</div>
                      <div className='text-2xl font-bold'>{stockAnalysis.recommendation}</div>
                    </div>
                    <div className='text-right'>
                      <div className='text-sm font-medium'>{t('confidence')}</div>
                      <div className='text-lg font-bold'>{(stockAnalysis.confidence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>

                {/* Analysis */}
                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-900 dark:text-gray-100 mb-2'>{t('analysis')}</h4>
                  <p className='text-gray-700 dark:text-gray-300 text-sm leading-relaxed'>
                    {stockAnalysis.analysis}
                  </p>
                </div>

                {/* Reasoning */}
                <div className='bg-gray-50 dark:bg-gray-700 p-4 rounded-lg'>
                  <h4 className='font-semibold text-gray-900 dark:text-gray-100 mb-2'>{t('keyPoints')}</h4>
                  <ul className='space-y-1'>
                    {stockAnalysis.reasoning.map((reason, index) => (
                      <li key={index} className='text-gray-700 dark:text-gray-300 text-sm flex items-start gap-2'>
                        <span className='text-emerald-500 mt-0.5'>•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3'>
                  <a
                    href={getGrowwUrl(selectedStock.symbol)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={`flex-1 px-4 py-3 rounded-lg font-medium text-center transition-all duration-200 ${
                      stockAnalysis.recommendation === 'BUY'
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : stockAnalysis.recommendation === 'SELL'
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {stockAnalysis.recommendation === 'BUY' ? t('buyOnGroww') : 
                     stockAnalysis.recommendation === 'SELL' ? t('sellOnGroww') : 
                     t('viewOnGroww')}
                  </a>
                  <button
                    onClick={() => {
                      setSelectedStock(null);
                      setStockAnalysis(null);
                    }}
                    className='px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors duration-200'
                  >
                    {tCommon('close')}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMarket;