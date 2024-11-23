export interface Candle {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
}

export interface Signal {
  pair: string;
  time: number;
  price: string;
  wickLength: number;
}