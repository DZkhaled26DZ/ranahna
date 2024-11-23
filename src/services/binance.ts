import axios from 'axios';
import { Candle } from '../types';

const BASE_URL = 'https://api.binance.com/api/v3';
const API_KEY = 'nc3cvP0d3LZzL9AIIgQQsjU6MKN8g5oanFkiAo4BdykbaOlce3HsTbWB3mPCoL8z';

const binanceApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    'X-MBX-APIKEY': API_KEY
  }
});

export const fetchCandles = async (
  symbol: string,
  interval: string,
  limit: number = 100
): Promise<Candle[]> => {
  const response = await binanceApi.get('/klines', {
    params: {
      symbol,
      interval,
      limit,
    },
  });

  return response.data.map((candle: any[]) => ({
    openTime: candle[0],
    open: candle[1],
    high: candle[2],
    low: candle[3],
    close: candle[4],
    volume: candle[5],
    closeTime: candle[6],
  }));
};

export const fetchSpotPairs = async (): Promise<string[]> => {
  const response = await binanceApi.get('/ticker/24hr');
  return response.data
    .filter((ticker: any) => ticker.symbol.endsWith('USDT'))
    .map((ticker: any) => ticker.symbol);
};