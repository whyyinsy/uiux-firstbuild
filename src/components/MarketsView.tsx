import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bitcoin,
  Calendar,
  ChevronRight,
  Flame,
  Globe,
  LineChart,
  MessageSquare,
  Star,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  CRYPTO_GAINERS_CHIPS,
  MARKET_CATEGORIES,
  formatRawPrice,
  formatSymbolPrice,
} from '../data/marketData';
import {
  EconomicEvent,
  MarketCategory,
  MarketSymbol,
  StockMoverFilter,
} from '../types/market';
import { Sparkline } from './Sparkline';

interface MarketsViewProps {
  symbols: MarketSymbol[];
  economicEvents: EconomicEvent[];
  watchlistIds: string[];
  liveFeedEnabled: boolean;
  onToggleWatchlist: (id: string) => void;
  onOpenChart: (symbolId: string) => void;
  onOpenScreener: () => void;
  onOpenCalendar: () => void;
  onOpenCommunity: () => void;
}

const MOVER_FILTERS: StockMoverFilter[] = [
  'Highest Volume',
  'Gainers',
  'Losers',
  'Most Volatile',
];

export const MarketsView: React.FC<MarketsViewProps> = ({
  symbols,
  economicEvents,
  watchlistIds,
  liveFeedEnabled,
  onToggleWatchlist,
  onOpenChart,
  onOpenScreener,
  onOpenCalendar,
  onOpenCommunity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('Overview');
  const [moverFilter, setMoverFilter] = useState<StockMoverFilter>('Highest Volume');
  const [interactiveSparklines, setInteractiveSparklines] = useState<boolean>(false);
  const [hoveredCardPoint, setHoveredCardPoint] = useState<Record<string, number | null>>({});
  const [showAllWorldIndices, setShowAllWorldIndices] = useState<boolean>(false);
  const [showAllCrypto, setShowAllCrypto] = useState<boolean>(false);

  const majorIndices = useMemo(
    () => symbols.filter((s) => s.assetClass === 'index'),
    [symbols]
  );

  const worldIndices = useMemo(() => {
    const list = symbols.filter((s) => s.assetClass === 'world-index');
    return showAllWorldIndices ? list : list.slice(0, 5);
  }, [symbols, showAllWorldIndices]);

  const usStocks = useMemo(() => {
    const list = [...symbols.filter((s) => s.assetClass === 'us-stock')];
    if (moverFilter === 'Highest Volume') {
      list.sort((a, b) => (b.volumeNum ?? 0) - (a.volumeNum ?? 0));
    } else if (moverFilter === 'Gainers') {
      list.sort((a, b) => b.changePct - a.changePct);
    } else if (moverFilter === 'Losers') {
      list.sort((a, b) => a.changePct - b.changePct);
    } else if (moverFilter === 'Most Volatile') {
      list.sort((a, b) => (b.volatilityScore ?? 0) - (a.volatilityScore ?? 0));
    }
    return selectedCategory === 'US Stocks' ? list : list.slice(0, 5);
  }, [symbols, moverFilter, selectedCategory]);

  const cryptoSymbols = useMemo(() => {
    const list = symbols.filter((s) => s.assetClass === 'crypto');
    return showAllCrypto || selectedCategory === 'Crypto' ? list : list.slice(0, 4);
  }, [symbols, showAllCrypto, selectedCategory]);

  const futuresSymbols = useMemo(
    () => symbols.filter((s) => s.assetClass === 'future'),
    [symbols]
  );

  const categorySpecificSymbols = useMemo(() => {
    if (selectedCategory === 'World Stocks') {
      return symbols.filter((s) => s.assetClass === 'world-stock');
    }
    if (selectedCategory === 'Forex') {
      return symbols.filter((s) => s.assetClass === 'forex');
    }
    if (selectedCategory === 'Bonds') {
      return symbols.filter((s) => s.assetClass === 'bond');
    }
    if (selectedCategory === 'ETFs') {
      return symbols.filter((s) => s.assetClass === 'etf');
    }
    return [];
  }, [symbols, selectedCategory]);

  const showOverview = selectedCategory === 'Overview';

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Horizontal Market Category Ribbon */}
      <div className="w-full bg-[#131722] border-b border-[#2a2e39]/60 px-3 md:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {MARKET_CATEGORIES.map((category) => {
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold shadow-sm'
                    : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto">
        {/* Category-specific focused asset view (World Stocks, Forex, Bonds, ETFs) */}
        {categorySpecificSymbols.length > 0 && (
          <section className="px-3 md:px-6 pt-4">
            <div className="bg-[#1e222d] rounded-xl p-3.5 md:p-4 shadow-md">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="w-[18px] h-[18px] text-[#2962ff]" />
                  <h2 className="text-base font-semibold text-[#f0f3fa] tracking-tight">
                    {selectedCategory} Markets
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Overview')}
                  className="text-xs font-medium text-[#2962ff] hover:underline cursor-pointer"
                >
                  Back to Overview
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categorySpecificSymbols.map((item) => {
                  const pos = item.changePct >= 0;
                  const starred = watchlistIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => onOpenChart(item.id)}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#171b26] hover:bg-[#363a45]/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-[#2a2e39] flex items-center justify-center font-bold text-[11px] text-[#b6c4ff] shrink-0">
                          {item.shortCode}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-semibold text-[#f0f3fa] truncate">
                            {item.symbol}
                          </span>
                          <span className="text-[11px] text-[#787b86] truncate">
                            {item.name} · {item.exchange}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-16 h-6 hidden sm:block">
                          <Sparkline data={item.sparkline} positive={pos} height={24} />
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-semibold text-[#f0f3fa] tabular-nums font-mono">
                            {formatSymbolPrice(item)}
                          </span>
                          <span
                            className={`text-[11px] font-semibold tabular-nums ${
                              pos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {pos ? '+' : ''}
                            {item.changePct.toFixed(2)}%
                          </span>
                        </div>
                        <button
                          type="button"
                          aria-label={starred ? `Remove ${item.symbol} from watchlist` : `Add ${item.symbol} to watchlist`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(item.id);
                          }}
                          className="p-1.5 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f0f3fa] cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              starred ? 'fill-[#2962ff] text-[#2962ff]' : ''
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Major Indices Section */}
        {(showOverview || selectedCategory === 'Indices') && (
          <section aria-label="Major Indices">
            <div className="px-3 md:px-6 pt-4 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#f0f3fa] tracking-tight font-[var(--font-display)]">
                  Major Indices
                </h2>
                {liveFeedEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse" />
                )}
              </div>
              <button
                type="button"
                onClick={() => setInteractiveSparklines((prev) => !prev)}
                className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  interactiveSparklines
                    ? 'text-[#2962ff]'
                    : 'text-[#787b86] hover:text-[#f0f3fa]'
                }`}
              >
                <span>{interactiveSparklines ? 'Interactive On' : 'Interactive'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Indices Carousel on Mobile / 4-column Grid on Desktop */}
            <div className="w-full overflow-x-auto no-scrollbar px-3 md:px-6 py-1.5">
              <div className="flex md:grid md:grid-cols-4 gap-2.5 w-max md:w-full">
                {majorIndices.map((idx) => {
                  const pos = idx.changePct >= 0;
                  const hoverVal = hoveredCardPoint[idx.id];
                  const displayPrice =
                    interactiveSparklines && hoverVal != null
                      ? formatRawPrice(hoverVal, idx.decimals, idx.prefix, idx.suffix)
                      : formatSymbolPrice(idx);
                  const starred = watchlistIds.includes(idx.id);

                  return (
                    <div
                      key={idx.id}
                      onClick={() => onOpenChart(idx.id)}
                      className="w-48 md:w-auto bg-[#1e222d] hover:bg-[#262a35] border border-transparent hover:border-[#363a45] rounded-xl p-3 shadow-md flex flex-col justify-between shrink-0 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-semibold text-[#787b86] uppercase tracking-[0.06em] truncate">
                            {idx.name}
                          </div>
                          <div className="text-base font-bold text-[#f0f3fa] tracking-tight">
                            {idx.symbol}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tabular-nums ${
                              pos
                                ? 'bg-[#089981]/12 text-[#089981]'
                                : 'bg-[#f23645]/12 text-[#f23645]'
                            }`}
                          >
                            {pos ? '+' : ''}
                            {idx.changePct.toFixed(2)}%
                          </span>
                          <button
                            type="button"
                            aria-label={starred ? 'Remove from watchlist' : 'Add to watchlist'}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWatchlist(idx.id);
                            }}
                            className="opacity-75 group-hover:opacity-100 p-0.5 text-[#787b86] hover:text-[#f0f3fa] cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                starred ? 'fill-[#2962ff] text-[#2962ff]' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="my-1.5 flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-[#f0f3fa] tracking-tight tabular-nums font-mono">
                          {displayPrice}
                        </span>
                        {interactiveSparklines && hoverVal != null && (
                          <span className="text-[10px] text-[#2962ff] font-medium">Point</span>
                        )}
                      </div>

                      <div className="h-7 w-full flex items-end">
                        <Sparkline
                          data={idx.sparkline}
                          positive={pos}
                          height={28}
                          interactive={interactiveSparklines}
                          onHoverPoint={(val) =>
                            setHoveredCardPoint((prev) => ({ ...prev, [idx.id]: val }))
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Responsive Multi-Column Grid on Desktop / Single-Column Flow on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-5 px-3 md:px-6 mt-4">
          {/* Left Column on Desktop (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* World Indices Table Panel */}
            {(showOverview || selectedCategory === 'Indices') && (
              <section className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col">
                <div className="flex items-center justify-between pb-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-[18px] h-[18px] text-[#2962ff]" />
                    <h2 className="text-base font-semibold text-[#f0f3fa] font-[var(--font-display)]">
                      World Indices
                    </h2>
                  </div>
                  <span className="text-[10px] font-semibold text-[#50535e] uppercase tracking-[0.06em]">
                    Local Sessions
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  {worldIndices.map((idx) => {
                    const pos = idx.changePct >= 0;
                    return (
                      <div
                        key={idx.id}
                        onClick={() => onOpenChart(idx.id)}
                        className="flex items-center justify-between py-2 px-2 rounded bg-[#171b26] hover:bg-[#363a45]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[#2a2e39] flex items-center justify-center font-bold text-[10px] text-[#787b86] shrink-0">
                            {idx.countryCode}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#f0f3fa] truncate">
                              {idx.name}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-medium">
                              {idx.symbol} · {idx.exchange}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs text-[#f0f3fa] tabular-nums font-semibold font-mono">
                            {formatSymbolPrice(idx)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold tabular-nums ${
                              pos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {pos ? '+' : ''}
                            {idx.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllWorldIndices((prev) => !prev)}
                  className="mt-2.5 pt-1.5 flex items-center justify-center gap-1.5 text-[#2962ff] text-xs font-medium hover:underline cursor-pointer"
                >
                  <span>
                    {showAllWorldIndices ? 'Show fewer indices' : 'See all major indices'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>
            )}

            {/* US Stocks Movers & Active Cards */}
            {(showOverview || selectedCategory === 'US Stocks') && (
              <section>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <LineChart className="w-5 h-5 text-[#2962ff]" />
                    <h2 className="text-base font-semibold text-[#f0f3fa] font-[var(--font-display)]">
                      US Stocks Movers
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#2a2e39] text-[10px] font-semibold text-[#787b86] uppercase tracking-[0.05em]">
                    Regular Session
                  </span>
                </div>

                {/* Sub-tabs Switcher */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1.5">
                  {MOVER_FILTERS.map((tab) => {
                    const active = moverFilter === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setMoverFilter(tab)}
                        className={`px-3 py-1.5 rounded text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold'
                            : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa]'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </div>

                <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md mt-1 flex flex-col gap-1.5">
                  {usStocks.map((stock) => {
                    const pos = stock.changePct >= 0;
                    return (
                      <div
                        key={stock.id}
                        onClick={() => onOpenChart(stock.id)}
                        className="flex items-center justify-between py-2 px-2 rounded bg-[#171b26] hover:bg-[#363a45]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-lg bg-[#2a2e39] flex items-center justify-center font-bold text-[11px] shrink-0"
                            style={{ color: stock.badgeColor ?? '#f0f3fa' }}
                          >
                            {stock.shortCode}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-[#f0f3fa]">
                                {stock.symbol}
                              </span>
                              <span className="text-[10px] font-semibold text-[#50535e]">
                                {stock.exchange}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#787b86] truncate">
                              {stock.name}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs text-[#f0f3fa] tabular-nums font-semibold font-mono">
                            {formatSymbolPrice(stock)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#50535e] tabular-nums font-mono">
                              {stock.volume}
                            </span>
                            <span
                              className={`text-[10px] font-semibold tabular-nums ${
                                pos ? 'text-[#089981]' : 'text-[#f23645]'
                              }`}
                            >
                              {pos ? '+' : ''}
                              {stock.changePct.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="mt-1 flex justify-between items-center px-1 pt-1.5">
                    <span className="text-[10px] text-[#50535e]">
                      Market data factually delayed 15m
                    </span>
                    <button
                      type="button"
                      onClick={onOpenScreener}
                      className="text-[#2962ff] text-[11px] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Explore US Screener</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Column on Desktop (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 mt-5 lg:mt-0">
            {/* Cryptocurrencies Live Feed */}
            {(showOverview || selectedCategory === 'Crypto') && (
              <section>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bitcoin className="w-5 h-5 text-[#84f7db]" />
                    <h2 className="text-base font-semibold text-[#f0f3fa] font-[var(--font-display)]">
                      Crypto Pulse
                    </h2>
                  </div>
                  <span className="text-[10px] font-semibold text-[#787b86] uppercase tracking-[0.06em]">
                    24H Volatility
                  </span>
                </div>

                {/* Crypto Gainers Chips Strip */}
                <div className="w-full overflow-x-auto no-scrollbar py-1 mb-1">
                  <div className="flex gap-1.5 w-max">
                    {CRYPTO_GAINERS_CHIPS.map((chip) => (
                      <button
                        key={chip.symbol}
                        type="button"
                        onClick={() => onOpenChart('btcusd')}
                        className="px-2.5 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                      >
                        <span className="text-[10px] font-semibold text-[#787b86]">
                          {chip.symbol}
                        </span>
                        <span className="text-[10px] text-[#089981] font-bold tabular-nums">
                          +{chip.changePct.toFixed(2)}%
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col gap-1.5">
                  {cryptoSymbols.map((coin) => {
                    const pos = coin.changePct >= 0;
                    return (
                      <div
                        key={coin.id}
                        onClick={() => onOpenChart(coin.id)}
                        className="flex items-center justify-between py-2 px-2 rounded bg-[#171b26] hover:bg-[#363a45]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="w-8 h-8 rounded-full bg-[#2a2e39] flex items-center justify-center font-bold text-xs shrink-0"
                            style={{ color: coin.badgeColor ?? '#dfe2f2' }}
                          >
                            {coin.shortCode}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-[#f0f3fa] truncate">
                              {coin.name}
                            </span>
                            <span className="text-[10px] text-[#787b86] font-medium">
                              {coin.symbol} · Cap {coin.marketCap}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-xs text-[#f0f3fa] tabular-nums font-semibold font-mono">
                            {formatSymbolPrice(coin)}
                          </span>
                          <span
                            className={`text-[10px] font-semibold tabular-nums ${
                              pos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {pos ? '+' : ''}
                            {coin.changePct.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setShowAllCrypto((prev) => !prev)}
                    className="mt-1 pt-1 flex items-center justify-center gap-1.5 text-[#2962ff] text-xs font-medium hover:underline cursor-pointer"
                  >
                    <span>
                      {showAllCrypto
                        ? 'Show top 4 crypto pairs'
                        : 'View all 12,000+ crypto coins'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>
            )}

            {/* Futures & Commodities 2x2 Bento Section */}
            {(showOverview || selectedCategory === 'Futures') && (
              <section>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-[#ffd700]" />
                    <h2 className="text-base font-semibold text-[#f0f3fa] font-[var(--font-display)]">
                      Futures & Commodities
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenChart('gc1')}
                    className="text-[11px] font-medium text-[#2962ff] hover:underline cursor-pointer"
                  >
                    Quotes
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {futuresSymbols.map((fut) => {
                    const pos = fut.changePct >= 0;
                    return (
                      <div
                        key={fut.id}
                        onClick={() => onOpenChart(fut.id)}
                        className="bg-[#1e222d] hover:bg-[#262a35] border border-transparent hover:border-[#363a45] rounded-xl p-3 shadow-md flex flex-col justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-[#787b86] font-medium">
                              {fut.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold tabular-nums ${
                                pos ? 'text-[#089981]' : 'text-[#f23645]'
                              }`}
                            >
                              {pos ? '+' : ''}
                              {fut.changePct.toFixed(2)}%
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-[#f0f3fa] tabular-nums font-mono">
                            {formatSymbolPrice(fut)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-2.5 pt-1 text-[10px] text-[#50535e] font-semibold">
                          <span>{fut.symbol}</span>
                          <span>{fut.exchange}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Economic Calendar & Market Highlights */}
            {(showOverview || selectedCategory === 'Economy') && (
              <section className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col">
                <div className="flex items-center justify-between pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-[18px] h-[18px] text-[#b6c4ff]" />
                    <h2 className="text-base font-semibold text-[#f0f3fa] font-[var(--font-display)]">
                      Economic Calendar
                    </h2>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#da2237]/30 text-[#ffb3b0] text-[10px] font-semibold uppercase tracking-[0.05em]">
                    High Impact
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {(selectedCategory === 'Economy'
                    ? economicEvents
                    : economicEvents.slice(0, 3)
                  ).map((ev) => {
                    const toneClass =
                      ev.statusTone === 'bullish'
                        ? 'bg-[#089981]/12 text-[#089981]'
                        : ev.statusTone === 'blue'
                        ? 'bg-[#2962ff]/15 text-[#2962ff]'
                        : ev.statusTone === 'bearish'
                        ? 'bg-[#f23645]/12 text-[#f23645]'
                        : 'bg-[#2a2e39] text-[#787b86]';

                    return (
                      <div
                        key={ev.id}
                        onClick={onOpenCalendar}
                        className="p-2.5 rounded-lg bg-[#171b26] flex flex-col gap-1 hover:bg-[#363a45]/60 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#c3c5d8] font-bold shrink-0">
                              {ev.currency}
                            </span>
                            <span className="text-xs text-[#f0f3fa] font-semibold truncate">
                              {ev.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#50535e] whitespace-nowrap shrink-0">
                            {ev.timeLabel}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 gap-2">
                          <span className="text-[#787b86]">
                            {ev.id === 'fed-rate' ? 'Forecast:' : 'Consensus:'}{' '}
                            <span className="text-[#f0f3fa] font-semibold tabular-nums font-mono">
                              {ev.consensus}
                            </span>
                          </span>
                          <span className="text-[#787b86]">
                            {ev.id === 'fed-rate' ? 'Current:' : 'Previous:'}{' '}
                            <span className="text-[#f0f3fa] tabular-nums font-mono">
                              {ev.previous}
                            </span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${toneClass}`}>
                            {ev.statusTag}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={onOpenCalendar}
                  className="mt-2.5 pt-1.5 flex items-center justify-center gap-1 text-[#2962ff] text-xs font-medium hover:underline cursor-pointer"
                >
                  <span>Open full Economic Calendar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </section>
            )}

            {/* Interactive Community Trend Mini Banner */}
            <section>
              <div
                onClick={onOpenCommunity}
                className="bg-gradient-to-r from-[#1e222d] via-[#2a2e39] to-[#1e222d] rounded-xl p-3.5 shadow-md flex items-center justify-between gap-3 cursor-pointer hover:brightness-110 transition-all"
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[10px] text-[#66dabf] uppercase font-bold tracking-wider">
                    Trading Community
                  </span>
                  <span className="text-[13px] text-[#f0f3fa] font-semibold mt-0.5 truncate">
                    Top Discussion: AMD & NVDA Tech Cycles
                  </span>
                  <span className="text-[11px] text-[#787b86]">
                    2.4k active quantitative remarks today
                  </span>
                </div>
                <button
                  type="button"
                  aria-label="Open Trading Community"
                  className="w-9 h-9 rounded-full bg-[#2962ff] text-white flex items-center justify-center shrink-0 shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-[18px] h-[18px]" />
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
