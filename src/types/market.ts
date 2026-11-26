export type NavTabId = 'markets' | 'watchlist' | 'supercharts' | 'community' | 'menu';

export type MarketCategory =
  | 'Overview'
  | 'Indices'
  | 'US Stocks'
  | 'World Stocks'
  | 'Crypto'
  | 'Futures'
  | 'Forex'
  | 'Bonds'
  | 'ETFs'
  | 'Economy';

export type StockMoverFilter = 'Highest Volume' | 'Gainers' | 'Losers' | 'Most Volatile';

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W';
export type ChartStyle = 'candles' | 'area' | 'line';

export type AssetClass =
  | 'index'
  | 'world-index'
  | 'us-stock'
  | 'world-stock'
  | 'crypto'
  | 'future'
  | 'forex'
  | 'bond'
  | 'etf';

export interface MarketSymbol {
  id: string;
  symbol: string;
  name: string;
  shortCode: string;
  exchange: string;
  assetClass: AssetClass;
  price: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  changePct: number;
  volume?: string;
  volumeNum?: number;
  volatilityScore?: number;
  marketCap?: string;
  badgeColor?: string;
  countryCode?: string;
  high24h?: number;
  low24h?: number;
  sparkline: number[];
}

export interface CryptoMoverChip {
  symbol: string;
  changePct: number;
}

export interface EconomicEvent {
  id: string;
  currency: string;
  title: string;
  timeLabel: string;
  consensus: string;
  previous: string;
  actual?: string;
  statusTag: string;
  statusTone: 'bullish' | 'blue' | 'neutral' | 'bearish';
  impact: 'High' | 'Medium' | 'Low';
  country: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  handle: string;
  avatarInitials: string;
  avatarColor: string;
  symbol: string;
  title: string;
  summary: string;
  bias: 'Bullish' | 'Bearish' | 'Neutral';
  category: 'Stocks' | 'Crypto' | 'Macro' | 'Indices';
  timeframe: string;
  timestamp: string;
  likes: number;
  commentsCount: number;
  liked?: boolean;
  bookmarked?: boolean;
  comments: {
    id: string;
    author: string;
    text: string;
    time: string;
  }[];
  sparkline: number[];
}

export interface PriceAlert {
  id: string;
  symbol: string;
  name: string;
  targetPrice: number;
  condition: 'above' | 'below';
  active: boolean;
  createdAt: string;
}

export interface CandlePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
