import React, { useMemo, useState } from 'react';
import { Calendar, Search, Star, X } from 'lucide-react';
import { formatSymbolPrice } from '../data/marketData';
import { EconomicEvent, MarketSymbol } from '../types/market';

/* ---------------- Search Modal ---------------- */
interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  symbols: MarketSymbol[];
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onSelectSymbol: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  open,
  onClose,
  symbols,
  watchlistIds,
  onToggleWatchlist,
  onSelectSymbol,
}) => {
  const [query, setQuery] = useState('');
  const [assetFilter, setAssetFilter] = useState<string>('all');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return symbols.filter((s) => {
      const matchesType =
        assetFilter === 'all' ||
        (assetFilter === 'stocks' && (s.assetClass === 'us-stock' || s.assetClass === 'world-stock')) ||
        (assetFilter === 'indices' && (s.assetClass === 'index' || s.assetClass === 'world-index')) ||
        (assetFilter === 'crypto' && s.assetClass === 'crypto') ||
        (assetFilter === 'macro' &&
          (s.assetClass === 'future' || s.assetClass === 'forex' || s.assetClass === 'bond' || s.assetClass === 'etf'));
      if (!matchesType) return false;
      if (!q) return true;
      return (
        s.symbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.exchange.toLowerCase().includes(q)
      );
    });
  }, [symbols, query, assetFilter]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center p-3 pt-16 md:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e222d] border border-[#363a45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[78vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#2a2e39]">
          <Search className="w-4 h-4 text-[#787b86]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol, company, crypto, or exchange..."
            className="flex-1 bg-transparent text-sm text-[#f0f3fa] placeholder:text-[#787b86] focus:outline-none"
          />
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#2a2e39] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-[#2a2e39] overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'indices', label: 'Indices' },
            { id: 'stocks', label: 'Stocks' },
            { id: 'crypto', label: 'Crypto' },
            { id: 'macro', label: 'Futures / FX / Bonds' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setAssetFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap cursor-pointer ${
                assetFilter === tab.id
                  ? 'bg-[#2962ff] text-white'
                  : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-2 flex flex-col gap-1">
          {results.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#787b86]">
              No matching symbols found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((sym) => {
              const pos = sym.changePct >= 0;
              const starred = watchlistIds.includes(sym.id);
              return (
                <div
                  key={sym.id}
                  onClick={() => {
                    onSelectSymbol(sym.id);
                    onClose();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-[#2a2e39] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#171b26] flex items-center justify-center font-bold text-[11px] text-[#b6c4ff] shrink-0">
                      {sym.shortCode}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#f0f3fa]">{sym.symbol}</span>
                        <span className="text-[10px] text-[#787b86]">{sym.exchange}</span>
                      </div>
                      <div className="text-[11px] text-[#787b86] truncate">{sym.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-[#f0f3fa] font-mono tabular-nums">
                        {formatSymbolPrice(sym)}
                      </div>
                      <div
                        className={`text-[10px] font-semibold tabular-nums ${
                          pos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {pos ? '+' : ''}
                        {sym.changePct.toFixed(2)}%
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={starred ? 'Remove from watchlist' : 'Add to watchlist'}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(sym.id);
                      }}
                      className="p-1.5 rounded hover:bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa] cursor-pointer"
                    >
                      <Star
                        className={`w-4 h-4 ${starred ? 'fill-[#2962ff] text-[#2962ff]' : ''}`}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- US Stock Screener Modal ---------------- */
interface ScreenerModalProps {
  open: boolean;
  onClose: () => void;
  symbols: MarketSymbol[];
  onSelectSymbol: (id: string) => void;
}

export const ScreenerModal: React.FC<ScreenerModalProps> = ({
  open,
  onClose,
  symbols,
  onSelectSymbol,
}) => {
  const [perfFilter, setPerfFilter] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortField, setSortField] = useState<'volume' | 'change' | 'price'>('volume');

  const stocks = useMemo(() => {
    let list = symbols.filter((s) => s.assetClass === 'us-stock');
    if (perfFilter === 'gainers') list = list.filter((s) => s.changePct > 0);
    if (perfFilter === 'losers') list = list.filter((s) => s.changePct < 0);

    return [...list].sort((a, b) => {
      if (sortField === 'change') return b.changePct - a.changePct;
      if (sortField === 'price') return b.price - a.price;
      return (b.volumeNum ?? 0) - (a.volumeNum ?? 0);
    });
  }, [symbols, perfFilter, sortField]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#1e222d] border border-[#363a45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[84vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
          <div>
            <h2 className="text-sm font-bold text-[#f0f3fa]">US Equities Screener</h2>
            <p className="text-[11px] text-[#787b86]">NASDAQ & NYSE active session filter</p>
          </div>
          <button
            type="button"
            aria-label="Close screener"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#2a2e39] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#171b26] border-b border-[#2a2e39]">
          <div className="flex items-center gap-1.5">
            {(['all', 'gainers', 'losers'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPerfFilter(f)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize cursor-pointer ${
                  perfFilter === f ? 'bg-[#2962ff] text-white' : 'bg-[#2a2e39] text-[#c3c5d8]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#787b86]">
            <span>Sort:</span>
            {(['volume', 'change', 'price'] as const).map((sf) => (
              <button
                key={sf}
                type="button"
                onClick={() => setSortField(sf)}
                className={`px-2 py-1 rounded capitalize cursor-pointer ${
                  sortField === sf ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold' : 'hover:text-[#f0f3fa]'
                }`}
              >
                {sf}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto p-3 flex flex-col gap-1">
          {stocks.map((st) => {
            const pos = st.changePct >= 0;
            return (
              <div
                key={st.id}
                onClick={() => {
                  onSelectSymbol(st.id);
                  onClose();
                }}
                className="grid grid-cols-12 items-center px-3 py-2.5 rounded-lg bg-[#171b26] hover:bg-[#2a2e39] cursor-pointer transition-colors gap-2"
              >
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-7 h-7 rounded bg-[#2a2e39] flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ color: st.badgeColor ?? '#f0f3fa' }}
                  >
                    {st.shortCode}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#f0f3fa]">{st.symbol}</div>
                    <div className="text-[10px] text-[#787b86] truncate">{st.name}</div>
                  </div>
                </div>
                <div className="col-span-2 text-right text-[11px] text-[#787b86] font-mono hidden sm:block">
                  {st.marketCap}
                </div>
                <div className="col-span-2 text-right text-[11px] text-[#c3c5d8] font-mono tabular-nums">
                  {st.volume}
                </div>
                <div className="col-span-3 sm:col-span-3 text-right">
                  <div className="text-xs font-semibold text-[#f0f3fa] font-mono tabular-nums">
                    {formatSymbolPrice(st)}
                  </div>
                  <div
                    className={`text-[10px] font-semibold tabular-nums ${
                      pos ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {pos ? '+' : ''}
                    {st.changePct.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Economic Calendar Modal ---------------- */
interface CalendarModalProps {
  open: boolean;
  onClose: () => void;
  events: EconomicEvent[];
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ open, onClose, events }) => {
  const [impactFilter, setImpactFilter] = useState<'All' | 'High' | 'Medium'>('All');

  const filtered = useMemo(
    () => (impactFilter === 'All' ? events : events.filter((e) => e.impact === impactFilter)),
    [events, impactFilter]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1e222d] border border-[#363a45] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#b6c4ff]" />
            <h2 className="text-sm font-bold text-[#f0f3fa]">Global Economic Calendar</h2>
          </div>
          <button
            type="button"
            aria-label="Close calendar"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#2a2e39] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 px-4 py-2.5 bg-[#171b26] border-b border-[#2a2e39]">
          {(['All', 'High', 'Medium'] as const).map((imp) => (
            <button
              key={imp}
              type="button"
              onClick={() => setImpactFilter(imp)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                impactFilter === imp ? 'bg-[#2962ff] text-white' : 'bg-[#2a2e39] text-[#c3c5d8]'
              }`}
            >
              {imp === 'All' ? 'All Impact' : `${imp} Impact`}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-3 flex flex-col gap-2">
          {filtered.map((ev) => (
            <div key={ev.id} className="p-3 rounded-xl bg-[#171b26] flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2a2e39] text-[#f0f3fa] font-bold">
                    {ev.currency}
                  </span>
                  <span className="text-xs font-semibold text-[#f0f3fa]">{ev.title}</span>
                </div>
                <span className="text-[11px] text-[#787b86]">{ev.timeLabel}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between text-[11px] text-[#787b86] gap-2">
                <span>{ev.country}</span>
                <div className="flex items-center gap-4 font-mono tabular-nums">
                  <span>
                    Consensus: <strong className="text-[#f0f3fa]">{ev.consensus}</strong>
                  </span>
                  <span>
                    Previous: <strong className="text-[#c3c5d8]">{ev.previous}</strong>
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                    ev.impact === 'High'
                      ? 'bg-[#da2237]/25 text-[#ffb3b0]'
                      : 'bg-[#2a2e39] text-[#c3c5d8]'
                  }`}
                >
                  {ev.impact} Impact
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Set Price Alert Modal ---------------- */
interface AlertModalProps {
  symbol: MarketSymbol | null;
  onClose: () => void;
  onCreateAlert: (symbol: MarketSymbol, targetPrice: number, condition: 'above' | 'below') => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ symbol, onClose, onCreateAlert }) => {
  const [target, setTarget] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below'>('above');

  React.useEffect(() => {
    if (symbol) {
      setTarget((symbol.price * 1.02).toFixed(symbol.decimals));
      setCondition('above');
    }
  }, [symbol]);

  if (!symbol) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(target);
    if (!Number.isFinite(num) || num <= 0) return;
    onCreateAlert(symbol, num, condition);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-[#1e222d] border border-[#363a45] rounded-2xl shadow-2xl p-4 flex flex-col gap-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#f0f3fa]">Create Alert · {symbol.symbol}</h3>
            <p className="text-[11px] text-[#787b86]">
              Current: {formatSymbolPrice(symbol)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#787b86] hover:text-[#f0f3fa] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCondition('above')}
            className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
              condition === 'above'
                ? 'bg-[#089981]/20 text-[#089981] border border-[#089981]/50'
                : 'bg-[#171b26] text-[#787b86]'
            }`}
          >
            Crossing Above
          </button>
          <button
            type="button"
            onClick={() => setCondition('below')}
            className={`py-2 rounded-lg text-xs font-medium cursor-pointer ${
              condition === 'below'
                ? 'bg-[#f23645]/20 text-[#f23645] border border-[#f23645]/50'
                : 'bg-[#171b26] text-[#787b86]'
            }`}
          >
            Crossing Below
          </button>
        </div>

        <div>
          <label className="text-[11px] text-[#787b86] block mb-1">Target Price</label>
          <input
            type="number"
            step="any"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-sm text-[#f0f3fa] font-mono focus:outline-none focus:border-[#2962ff]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 rounded-lg bg-[#2a2e39] text-xs text-[#dfe2f2] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#2962ff] text-xs font-semibold text-white cursor-pointer"
          >
            Arm Alert
          </button>
        </div>
      </form>
    </div>
  );
};
