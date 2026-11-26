import React from 'react';
import {
  Activity,
  Bell,
  Calendar,
  ChevronRight,
  Filter,
  List,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { NavTabId, PriceAlert } from '../types/market';

interface MenuViewProps {
  liveFeedEnabled: boolean;
  onToggleLiveFeed: () => void;
  alerts: PriceAlert[];
  onDeleteAlert: (id: string) => void;
  onOpenScreener: () => void;
  onOpenCalendar: () => void;
  onSelectTab: (tab: NavTabId) => void;
  onResetWorkspace: () => void;
}

export const MenuView: React.FC<MenuViewProps> = ({
  liveFeedEnabled,
  onToggleLiveFeed,
  alerts,
  onDeleteAlert,
  onOpenScreener,
  onOpenCalendar,
  onSelectTab,
  onResetWorkspace,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-3 md:px-6 pt-4 pb-10 flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-[#f0f3fa] font-[var(--font-display)] tracking-tight">
          Workspace Menu
        </h1>
        <p className="text-xs text-[#787b86] mt-0.5">
          Market tools, alert rules, and terminal feed preferences
        </p>
      </div>

      {/* Quick Tools */}
      <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col gap-1.5">
        <div className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider px-1 pb-1">
          Analytical Tools
        </div>

        <button
          type="button"
          onClick={onOpenScreener}
          className="flex items-center justify-between p-3 rounded-lg bg-[#171b26] hover:bg-[#262a35] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-[#2962ff]" />
            <div className="text-left">
              <div className="text-xs font-semibold text-[#f0f3fa]">US Stock Screener</div>
              <div className="text-[11px] text-[#787b86]">Filter equities by volume, price, and volatility</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#787b86]" />
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          className="flex items-center justify-between p-3 rounded-lg bg-[#171b26] hover:bg-[#262a35] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-[#b6c4ff]" />
            <div className="text-left">
              <div className="text-xs font-semibold text-[#f0f3fa]">Full Economic Calendar</div>
              <div className="text-[11px] text-[#787b86]">Upcoming CPI, central bank rates, and payrolls</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#787b86]" />
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('watchlist')}
          className="flex items-center justify-between p-3 rounded-lg bg-[#171b26] hover:bg-[#262a35] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <List className="w-4 h-4 text-[#089981]" />
            <div className="text-left">
              <div className="text-xs font-semibold text-[#f0f3fa]">Tracked Watchlist</div>
              <div className="text-[11px] text-[#787b86]">Manage pinned symbols across asset classes</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#787b86]" />
        </button>
      </div>

      {/* Live Feed & Preferences */}
      <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col gap-2">
        <div className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider px-1">
          Market Stream Settings
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-[#171b26]">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-[#089981]" />
            <div>
              <div className="text-xs font-semibold text-[#f0f3fa]">Live Market Tick Simulation</div>
              <div className="text-[11px] text-[#787b86]">
                Stream real-time micro price fluctuations across indices, stocks, and crypto
              </div>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={liveFeedEnabled}
            onClick={onToggleLiveFeed}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
              liveFeedEnabled ? 'bg-[#089981]' : 'bg-[#2a2e39]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                liveFeedEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="bg-[#1e222d] rounded-xl p-3 md:p-4 shadow-md flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Bell className="w-3.5 h-3.5 text-[#2962ff]" />
            <span className="text-[10px] font-semibold text-[#787b86] uppercase tracking-wider">
              Armed Price Alerts ({alerts.length})
            </span>
          </div>
        </div>

        {alerts.length === 0 ? (
          <div className="p-4 rounded-lg bg-[#171b26] text-xs text-[#787b86] text-center">
            No active alerts. Open any symbol in Supercharts and click Set Alert.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {alerts.map((al) => (
              <div
                key={al.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#171b26]"
              >
                <div>
                  <div className="text-xs font-semibold text-[#f0f3fa]">
                    {al.symbol} · {al.name}
                  </div>
                  <div className="text-[11px] text-[#787b86] font-mono tabular-nums">
                    Trigger when {al.condition} {al.targetPrice.toLocaleString()} · {al.createdAt}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Delete alert"
                  onClick={() => onDeleteAlert(al.id)}
                  className="p-2 rounded-lg text-[#787b86] hover:text-[#f23645] hover:bg-[#2a2e39] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset Local Storage */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onResetWorkspace}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] text-xs text-[#787b86] hover:text-[#f0f3fa] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Saved Watchlist & Alerts</span>
        </button>
      </div>
    </div>
  );
};
