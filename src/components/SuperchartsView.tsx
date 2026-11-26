import React, { useMemo, useRef, useState } from 'react';
import {
  Activity,
  BellPlus,
  CandlestickChart,
  ChevronDown,
  Layers,
  LineChart,
  Star,
} from 'lucide-react';
import {
  formatRawPrice,
  formatSymbolPrice,
  generateCandlesForSymbol,
} from '../data/marketData';
import { ChartStyle, MarketSymbol, Timeframe } from '../types/market';

interface SuperchartsViewProps {
  symbols: MarketSymbol[];
  selectedSymbolId: string;
  onSelectSymbol: (id: string) => void;
  watchlistIds: string[];
  onToggleWatchlist: (id: string) => void;
  onOpenAlertModal: (symbol: MarketSymbol) => void;
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

function computeEMA(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const k = 2 / (period + 1);
  const ema: number[] = [values[0]];
  for (let i = 1; i < values.length; i++) {
    ema.push(values[i] * k + ema[i - 1] * (1 - k));
  }
  return ema;
}

export const SuperchartsView: React.FC<SuperchartsViewProps> = ({
  symbols,
  selectedSymbolId,
  onSelectSymbol,
  watchlistIds,
  onToggleWatchlist,
  onOpenAlertModal,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [showEma20, setShowEma20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [symbolMenuOpen, setSymbolMenuOpen] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeSymbol = useMemo(
    () => symbols.find((s) => s.id === selectedSymbolId) ?? symbols[0],
    [symbols, selectedSymbolId]
  );

  const candles = useMemo(
    () => generateCandlesForSymbol(activeSymbol, timeframe, 56),
    [activeSymbol, timeframe]
  );

  const ema20 = useMemo(
    () => computeEMA(candles.map((c) => c.close), 20),
    [candles]
  );
  const ema50 = useMemo(
    () => computeEMA(candles.map((c) => c.close), 50),
    [candles]
  );

  const activeCandle =
    hoverIdx !== null && candles[hoverIdx] ? candles[hoverIdx] : candles[candles.length - 1];

  const isStarred = watchlistIds.includes(activeSymbol.id);
  const isPositive = activeSymbol.changePct >= 0;

  // Chart SVG dimensions
  const viewW = 900;
  const viewH = 420;
  const padLeft = 14;
  const padRight = 72;
  const padTop = 18;
  const padBottom = 30;
  const priceAreaHeight = showVolume ? viewH - padTop - padBottom - 56 : viewH - padTop - padBottom;
  const chartWidth = viewW - padLeft - padRight;

  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVol = Math.max(...candles.map((c) => c.volume)) || 1;

  const yForPrice = (price: number) =>
    padTop + priceAreaHeight - ((price - minPrice) / priceRange) * priceAreaHeight;

  const xForIndex = (idx: number) =>
    padLeft + ((idx + 0.5) / candles.length) * chartWidth;

  const candleBodyWidth = Math.max(4, (chartWidth / candles.length) * 0.62);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * viewW;
    const chartRel = relX - padLeft;
    if (chartRel < 0 || chartRel > chartWidth) {
      setHoverIdx(null);
      return;
    }
    const idx = Math.min(
      candles.length - 1,
      Math.max(0, Math.floor((chartRel / chartWidth) * candles.length))
    );
    setHoverIdx(idx);
  };

  // Price grid ticks
  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => {
    const price = maxPrice - t * priceRange;
    const y = padTop + t * priceAreaHeight;
    return { price, y };
  });

  const linePoints = candles
    .map((c, idx) => `${xForIndex(idx).toFixed(1)},${yForPrice(c.close).toFixed(1)}`)
    .join(' ');

  const areaPath =
    candles.length > 0
      ? `M${xForIndex(0).toFixed(1)},${(padTop + priceAreaHeight).toFixed(1)} ` +
        candles
          .map((c, idx) => `L${xForIndex(idx).toFixed(1)},${yForPrice(c.close).toFixed(1)}`)
          .join(' ') +
        ` L${xForIndex(candles.length - 1).toFixed(1)},${(padTop + priceAreaHeight).toFixed(1)} Z`
      : '';

  const ema20Path = ema20
    .map((val, idx) => `${idx === 0 ? 'M' : 'L'}${xForIndex(idx).toFixed(1)},${yForPrice(val).toFixed(1)}`)
    .join(' ');

  const ema50Path = ema50
    .map((val, idx) => `${idx === 0 ? 'M' : 'L'}${xForIndex(idx).toFixed(1)},${yForPrice(val).toFixed(1)}`)
    .join(' ');

  const quickSymbols = symbols.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-3 md:px-6 pt-3 pb-10">
      {/* Top Symbol & Action Bar */}
      <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md mb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Symbol Selector */}
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSymbolMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#171b26] hover:bg-[#2a2e39] border border-[#363a45]/70 transition-colors cursor-pointer"
            >
              <span className="text-sm font-bold text-[#f0f3fa]">{activeSymbol.symbol}</span>
              <span className="text-xs text-[#787b86] hidden sm:inline">
                {activeSymbol.name}
              </span>
              <ChevronDown className="w-4 h-4 text-[#787b86]" />
            </button>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#f0f3fa] tabular-nums font-mono">
                  {formatSymbolPrice(activeSymbol)}
                </span>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {activeSymbol.changePct.toFixed(2)}%
                </span>
              </div>
              <div className="text-[10px] text-[#787b86]">
                {activeSymbol.exchange} · {timeframe} Interactive Chart
              </div>
            </div>

            {symbolMenuOpen && (
              <div className="absolute top-12 left-0 w-72 max-h-80 overflow-y-auto bg-[#1e222d] border border-[#363a45] rounded-xl shadow-2xl p-2 z-40">
                <div className="px-2 py-1 text-[10px] font-semibold text-[#787b86] uppercase tracking-wider">
                  Switch Instrument
                </div>
                <div className="flex flex-col gap-0.5 mt-1">
                  {symbols.map((sym) => (
                    <button
                      key={sym.id}
                      type="button"
                      onClick={() => {
                        onSelectSymbol(sym.id);
                        setSymbolMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        sym.id === activeSymbol.id
                          ? 'bg-[#2962ff]/20 text-[#f0f3fa]'
                          : 'hover:bg-[#2a2e39] text-[#dfe2f2]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">{sym.symbol}</div>
                        <div className="text-[10px] text-[#787b86] truncate">{sym.name}</div>
                      </div>
                      <span className="font-mono tabular-nums text-[11px]">
                        {formatSymbolPrice(sym)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Watchlist + Alert Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWatchlist(activeSymbol.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                isStarred
                  ? 'bg-[#2962ff]/15 text-[#b6c4ff] border border-[#2962ff]/40'
                  : 'bg-[#171b26] text-[#dfe2f2] hover:bg-[#2a2e39]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-[#2962ff] text-[#2962ff]' : ''}`} />
              <span>{isStarred ? 'Watching' : 'Watchlist'}</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenAlertModal(activeSymbol)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2962ff] hover:bg-[#2962ff]/90 text-white text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              <BellPlus className="w-3.5 h-3.5" />
              <span>Set Alert</span>
            </button>
          </div>
        </div>

        {/* Chart Toolbar: Timeframes + Style + Overlays */}
        <div className="mt-3 pt-3 border-t border-[#2a2e39] flex flex-wrap items-center justify-between gap-2">
          {/* Timeframes */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  timeframe === tf
                    ? 'bg-[#2a2e39] text-[#f0f3fa] font-semibold'
                    : 'text-[#787b86] hover:text-[#f0f3fa]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type & Indicators */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center bg-[#171b26] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setChartStyle('candles')}
                title="Candlestick Chart"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  chartStyle === 'candles'
                    ? 'bg-[#2a2e39] text-[#f0f3fa]'
                    : 'text-[#787b86] hover:text-[#f0f3fa]'
                }`}
              >
                <CandlestickChart className="w-3.5 h-3.5" />
                <span>Candles</span>
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('area')}
                title="Area Chart"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  chartStyle === 'area'
                    ? 'bg-[#2a2e39] text-[#f0f3fa]'
                    : 'text-[#787b86] hover:text-[#f0f3fa]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Area</span>
              </button>
              <button
                type="button"
                onClick={() => setChartStyle('line')}
                title="Line Chart"
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer ${
                  chartStyle === 'line'
                    ? 'bg-[#2a2e39] text-[#f0f3fa]'
                    : 'text-[#787b86] hover:text-[#f0f3fa]'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Line</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowEma20((v) => !v)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                showEma20
                  ? 'bg-[#2962ff]/20 text-[#b6c4ff]'
                  : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              EMA 20
            </button>
            <button
              type="button"
              onClick={() => setShowEma50((v) => !v)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                showEma50
                  ? 'bg-[#84f7db]/15 text-[#84f7db]'
                  : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              EMA 50
            </button>
            <button
              type="button"
              onClick={() => setShowVolume((v) => !v)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors ${
                showVolume
                  ? 'bg-[#2a2e39] text-[#f0f3fa]'
                  : 'bg-[#171b26] text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>Vol</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart Surface */}
      <div className="bg-[#131722] border border-[#2a2e39] rounded-xl p-3 md:p-4 shadow-lg">
        {/* Live OHLC Readout Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 text-[11px] font-mono tabular-nums">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#787b86]">
              O{' '}
              <span className="text-[#f0f3fa]">
                {formatRawPrice(activeCandle.open, activeSymbol.decimals, activeSymbol.prefix)}
              </span>
            </span>
            <span className="text-[#787b86]">
              H{' '}
              <span className="text-[#089981]">
                {formatRawPrice(activeCandle.high, activeSymbol.decimals, activeSymbol.prefix)}
              </span>
            </span>
            <span className="text-[#787b86]">
              L{' '}
              <span className="text-[#f23645]">
                {formatRawPrice(activeCandle.low, activeSymbol.decimals, activeSymbol.prefix)}
              </span>
            </span>
            <span className="text-[#787b86]">
              C{' '}
              <span className="text-[#f0f3fa]">
                {formatRawPrice(activeCandle.close, activeSymbol.decimals, activeSymbol.prefix)}
              </span>
            </span>
            <span className="text-[#787b86]">
              Vol <span className="text-[#c3c5d8]">{activeCandle.volume.toLocaleString()}</span>
            </span>
          </div>
          <span className="text-[#787b86]">{activeCandle.time}</span>
        </div>

        {/* SVG Chart Canvas */}
        <div className="w-full aspect-[16/10] md:aspect-[21/9] min-h-[270px] relative select-none">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${viewW} ${viewH}`}
            className="w-full h-full touch-none cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="chartAreaGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2962ff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2962ff" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Lines + Right Price Axis */}
            {gridTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={padLeft + chartWidth}
                  y2={tick.y}
                  stroke="#2a2e39"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={padLeft + chartWidth + 8}
                  y={tick.y + 3.5}
                  fill="#787b86"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {tick.price.toLocaleString('en-US', {
                    minimumFractionDigits: activeSymbol.decimals,
                    maximumFractionDigits: activeSymbol.decimals,
                  })}
                </text>
              </g>
            ))}

            {/* Volume Histogram */}
            {showVolume &&
              candles.map((c, idx) => {
                const up = c.close >= c.open;
                const x = xForIndex(idx) - candleBodyWidth / 2;
                const barH = (c.volume / maxVol) * 44;
                const barY = viewH - padBottom - barH;
                return (
                  <rect
                    key={`vol-${idx}`}
                    x={x}
                    y={barY}
                    width={candleBodyWidth}
                    height={barH}
                    rx={1}
                    fill={up ? 'rgba(8, 153, 129, 0.28)' : 'rgba(242, 54, 69, 0.28)'}
                  />
                );
              })}

            {/* Chart Series */}
            {chartStyle === 'candles' &&
              candles.map((c, idx) => {
                const up = c.close >= c.open;
                const color = up ? '#089981' : '#f23645';
                const cx = xForIndex(idx);
                const yHigh = yForPrice(c.high);
                const yLow = yForPrice(c.low);
                const yOpen = yForPrice(c.open);
                const yClose = yForPrice(c.close);
                const bodyTop = Math.min(yOpen, yClose);
                const bodyH = Math.max(2, Math.abs(yClose - yOpen));

                return (
                  <g key={`c-${idx}`}>
                    <line
                      x1={cx}
                      y1={yHigh}
                      x2={cx}
                      y2={yLow}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    <rect
                      x={cx - candleBodyWidth / 2}
                      y={bodyTop}
                      width={candleBodyWidth}
                      height={bodyH}
                      rx="1"
                      fill={color}
                    />
                  </g>
                );
              })}

            {chartStyle === 'area' && (
              <>
                <path d={areaPath} fill="url(#chartAreaGrad)" />
                <polyline
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  points={linePoints}
                />
              </>
            )}

            {chartStyle === 'line' && (
              <polyline
                fill="none"
                stroke={isPositive ? '#089981' : '#f23645'}
                strokeWidth="2.2"
                strokeLinejoin="round"
                points={linePoints}
              />
            )}

            {/* Moving Average Overlays */}
            {showEma20 && (
              <path
                d={ema20Path}
                fill="none"
                stroke="#2962ff"
                strokeWidth="1.5"
                strokeOpacity="0.9"
              />
            )}
            {showEma50 && (
              <path
                d={ema50Path}
                fill="none"
                stroke="#84f7db"
                strokeWidth="1.5"
                strokeOpacity="0.85"
              />
            )}

            {/* Live Price Tag Line */}
            {(() => {
              const last = candles[candles.length - 1];
              const lastY = yForPrice(last.close);
              const tagColor = isPositive ? '#089981' : '#f23645';
              return (
                <g>
                  <line
                    x1={padLeft}
                    y1={lastY}
                    x2={padLeft + chartWidth}
                    y2={lastY}
                    stroke={tagColor}
                    strokeDasharray="2 3"
                    strokeOpacity="0.7"
                  />
                  <rect
                    x={padLeft + chartWidth + 2}
                    y={lastY - 9}
                    width={66}
                    height={18}
                    rx={3}
                    fill={tagColor}
                  />
                  <text
                    x={padLeft + chartWidth + 6}
                    y={lastY + 3.5}
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {last.close.toLocaleString('en-US', {
                      minimumFractionDigits: activeSymbol.decimals,
                      maximumFractionDigits: activeSymbol.decimals,
                    })}
                  </text>
                </g>
              );
            })()}

            {/* Interactive Crosshair */}
            {hoverIdx !== null && candles[hoverIdx] && (
              <g>
                <line
                  x1={xForIndex(hoverIdx)}
                  y1={padTop}
                  x2={xForIndex(hoverIdx)}
                  y2={viewH - padBottom}
                  stroke="#787b86"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <line
                  x1={padLeft}
                  y1={yForPrice(candles[hoverIdx].close)}
                  x2={padLeft + chartWidth}
                  y2={yForPrice(candles[hoverIdx].close)}
                  stroke="#787b86"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <circle
                  cx={xForIndex(hoverIdx)}
                  cy={yForPrice(candles[hoverIdx].close)}
                  r={4}
                  fill="#2962ff"
                  stroke="#f0f3fa"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Time Axis Labels */}
            {[0, 14, 28, 42, candles.length - 1].map((idx) => {
              const pt = candles[idx];
              if (!pt) return null;
              return (
                <text
                  key={`t-${idx}`}
                  x={xForIndex(idx)}
                  y={viewH - 8}
                  textAnchor="middle"
                  fill="#787b86"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {pt.time}
                </text>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Quick Symbol Strip */}
      <div className="mt-4">
        <div className="text-[11px] font-semibold text-[#787b86] uppercase tracking-wider mb-2">
          Quick Switch Instruments
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickSymbols.map((sym) => {
            const active = sym.id === activeSymbol.id;
            const pos = sym.changePct >= 0;
            return (
              <button
                key={sym.id}
                type="button"
                onClick={() => onSelectSymbol(sym.id)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2.5 shrink-0 transition-colors cursor-pointer ${
                  active
                    ? 'bg-[#2a2e39] border border-[#2962ff]/60'
                    : 'bg-[#1e222d] hover:bg-[#262a35] border border-transparent'
                }`}
              >
                <span className="text-xs font-semibold text-[#f0f3fa]">{sym.symbol}</span>
                <span
                  className={`text-[11px] font-mono tabular-nums font-semibold ${
                    pos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {pos ? '+' : ''}
                  {sym.changePct.toFixed(2)}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
