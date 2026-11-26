import React, { useMemo, useState } from 'react';
import {
  ArrowDownUp,
  CandlestickChart,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { formatSymbolPrice } from '../data/marketData';
import { MarketSymbol } from '../types/market';
import { Sparkline } from './Sparkline';

interface WatchlistViewProps {
  symbols: MarketSymbol[];
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenChart: (symbolId: string) => void;
  onOpenSearch: () => void;
  onResetDefaultWatchlist: () => void;
}

type WatchlistFilter = 'All' | 'Indices' | 'Stocks' | 'Crypto' | 'Macro';
type SortKey = 'default' | 'changeDesc' | 'changeAsc' | 'priceDesc';

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  symbols,
  watchlistIds,
  onToggleWatchlist,
  onOpenChart,
  onOpenSearch,
  onResetDefaultWatchlist,
}) => {
  const [filter, setFilter] = useState<WatchlistFilter>('All');
  const [sortKey, setSortKey] = useState<SortKey>('default');

  const watchlistItems = useMemo(() => {
    let items = symbols.filter((s) => watchlistIds.includes(s.id));

    if (filter === 'Indices') {
      items = items.filter((s) => s.assetClass === 'index' || s.assetClass === 'world-index');
    } else if (filter === 'Stocks') {
      items = items.filter((s) => s.assetClass === 'us-stock' || s.assetClass === 'world-stock');
    } else if (filter === 'Crypto') {
      items = items.filter((s) => s.assetClass === 'crypto');
    } else if (filter === 'Macro') {
      items = items.filter(
        (s) => s.assetClass === 'future' || s.assetClass === 'forex' || s.assetClass === 'bond'
      );
    }

    if (sortKey === 'changeDesc') {
      items = [...items].sort((a, b) => b.changePct - a.changePct);
    } else if (sortKey === 'changeAsc') {
      items = [...items].sort((a, b) => a.changePct - b.changePct);
    } else if (sortKey === 'priceDesc') {
      items = [...items].sort((a, b) => b.price - a.price);
    }

    return items;
  }, [symbols, watchlistIds, filter, sortKey]);

  const gainersCount = watchlistItems.filter((s) => s.changePct >= 0).length;
  const avgChange =
    watchlistItems.length > 0
      ? watchlistItems.reduce((acc, s) => acc + s.changePct, 0) / watchlistItems.length
      : 0;

  const cycleSort = () => {
    const order: SortKey[] = ['default', 'changeDesc', 'changeAsc', 'priceDesc'];
    const next = order[(order.indexOf(sortKey) + 1) % order.length];
    setSortKey(next);
  };

  const sortLabels: Record<SortKey, string> = {
    default: 'Custom Order',
    changeDesc: 'Top Gainers',
    changeAsc: 'Top Losers',
    priceDesc: 'Highest Price',
  };

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 pb-10">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f3fa] font-[var(--font-display)] tracking-tight">
            Watchlist
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5 tabular-nums">
            {watchlistIds.length} tracked symbols · {gainersCount} advancing · Avg{' '}
            <span className={avgChange >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
              {avgChange >= 0 ? '+' : ''}
              {avgChange.toFixed(2)}%
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleSort}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] text-xs font-medium text-[#dfe2f2] transition-colors cursor-pointer whitespace-nowrap"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[#787b86]" />
            <span>{sortLabels[sortKey]}</span>
          </button>
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2962ff] hover:bg-[#2962ff]/90 text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Symbol</span>
          </button>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
        {(['All', 'Indices', 'Stocks', 'Crypto', 'Macro'] as WatchlistFilter[]).map((tab) => {
          const active = filter === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
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

      {/* Watchlist Items */}
      {watchlistItems.length === 0 ? (
        <div className="bg-[#1e222d] rounded-xl p-8 text-center flex flex-col items-center gap-3 mt-2">
          <div className="w-12 h-12 rounded-full bg-[#2a2e39] flex items-center justify-center text-[#787b86]">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#f0f3fa]">
              No symbols in this watchlist view
            </h3>
            <p className="text-xs text-[#787b86] mt-1 max-w-sm">
              Search across global indices, US stocks, crypto, and commodities to track live moves here.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2962ff] text-white text-xs font-semibold cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Browse Symbols</span>
            </button>
            {watchlistIds.length === 0 && (
              <button
                type="button"
                onClick={onResetDefaultWatchlist}
                className="px-4 py-2 rounded-lg bg-[#2a2e39] text-[#dfe2f2] text-xs font-medium hover:bg-[#363a45] cursor-pointer"
              >
                Restore Defaults
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#1e222d] rounded-xl p-2.5 md:p-4 shadow-md flex flex-col gap-1.5">
          <div className="hidden md:grid grid-cols-12 px-3 py-1.5 text-[10px] font-semibold text-[#50535e] uppercase tracking-wider">
            <div className="col-span-4">Symbol</div>
            <div className="col-span-3 text-center">Intraday Trend</div>
            <div className="col-span-2 text-right">Last Price</div>
            <div className="col-span-2 text-right">Change</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {watchlistItems.map((item) => {
            const pos = item.changePct >= 0;
            return (
              <div
                key={item.id}
                onClick={() => onOpenChart(item.id)}
                className="grid grid-cols-12 items-center py-2.5 px-2.5 md:px-3 rounded-lg bg-[#171b26] hover:bg-[#363a45]/60 transition-colors cursor-pointer gap-2"
              >
                <div className="col-span-6 md:col-span-4 flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg bg-[#2a2e39] flex items-center justify-center font-bold text-[11px] shrink-0"
                    style={{ color: item.badgeColor ?? '#b6c4ff' }}
                  >
                    {item.shortCode}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-[#f0f3fa] truncate">
                        {item.symbol}
                      </span>
                      <span className="text-[10px] text-[#50535e] font-semibold">
                        {item.exchange}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#787b86] truncate">{item.name}</span>
                  </div>
                </div>

                <div className="hidden md:flex col-span-3 justify-center">
                  <div className="w-28 h-6">
                    <Sparkline data={item.sparkline} positive={pos} height={24} />
                  </div>
                </div>

                <div className="col-span-4 md:col-span-4 flex md:grid md:grid-cols-2 items-center justify-end gap-3">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-[#f0f3fa] tabular-nums font-mono">
                      {formatSymbolPrice(item)}
                    </div>
                    <div
                      className={`md:hidden text-[10px] font-semibold tabular-nums ${
                        pos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {pos ? '+' : ''}
                      {item.changePct.toFixed(2)}%
                    </div>
                  </div>
                  <div className="hidden md:flex justify-end">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                        pos
                          ? 'bg-[#089981]/12 text-[#089981]'
                          : 'bg-[#f23645]/12 text-[#f23645]'
                      }`}
                    >
                      {pos ? '+' : ''}
                      {item.changePct.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                  <button
                    type="button"
                    aria-label={`Open ${item.symbol} chart`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenChart(item.id);
                    }}
                    className="hidden sm:flex p-1.5 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#2962ff] cursor-pointer"
                  >
                    <CandlestickChart className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${item.symbol} from watchlist`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(item.id);
                    }}
                    className="p-1.5 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#f23645] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
