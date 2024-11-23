import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Controls } from './components/Controls';
import { SignalCard } from './components/SignalCard';
import { fetchCandles, fetchSpotPairs } from './services/binance';
import { Signal, Candle } from './types';

function App() {
  const [timeframe, setTimeframe] = useState('1h');
  const [sortBy, setSortBy] = useState('time');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [signals, setSignals] = useState<Signal[]>([]);

  const timeframes = {
    '1m': '1 دقيقة',
    '5m': '5 دقائق',
    '15m': '15 دقيقة',
    '1h': '1 ساعة',
    '4h': '4 ساعات',
    '1d': 'يوم',
    '1w': 'أسبوع',
    '1M': 'شهر'
  };

  const analyzeCandles = (pair: string, candles: Candle[]): Signal | null => {
    const lastCandle = candles[candles.length - 1];
    const open = parseFloat(lastCandle.open);
    const close = parseFloat(lastCandle.close);
    const high = parseFloat(lastCandle.high);
    const low = parseFloat(lastCandle.low);

    const body = Math.abs(open - close);
    const lowerWick = Math.min(open, close) - low;
    const upperWick = high - Math.max(open, close);
    
    if (lowerWick > body * 2 && upperWick < body) {
      return {
        pair,
        time: lastCandle.closeTime,
        price: lastCandle.close,
        wickLength: lowerWick
      };
    }
    return null;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const pairs = await fetchSpotPairs();
      const signalPromises = pairs.slice(0, 20).map(async (pair) => {
        const candles = await fetchCandles(pair, timeframe);
        return analyzeCandles(pair, candles);
      });

      const newSignals = (await Promise.all(signalPromises)).filter(
        (signal): signal is Signal => signal !== null
      );

      setSignals(newSignals.sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'wick':
            return b.wickLength - a.wickLength;
          default:
            return b.time - a.time;
        }
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [timeframe, sortBy]);

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <Header
        darkMode={darkMode}
        loading={loading}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onRefresh={fetchData}
      />

      <main className="container mx-auto p-4">
        <Controls
          timeframe={timeframe}
          sortBy={sortBy}
          timeframes={timeframes}
          onTimeframeChange={setTimeframe}
          onSortByChange={setSortBy}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <SignalCard key={signal.pair} signal={signal} />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;