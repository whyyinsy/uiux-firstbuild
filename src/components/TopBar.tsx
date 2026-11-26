import React, { useState } from 'react';
import {
  Bell,
  CandlestickChart,
  Check,
  List,
  Menu,
  MessageSquare,
  Search,
  TrendingUp,
  User,
} from 'lucide-react';
import { NavTabId, PriceAlert } from '../types/market';

interface TopBarProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onOpenSearch: () => void;
  liveFeedEnabled: boolean;
  onToggleLiveFeed: () => void;
  alerts: PriceAlert[];
  onClearTriggeredAlerts?: () => void;
}

const DESKTOP_TABS: { id: NavTabId; label: string; icon: React.ReactNode }[] = [
  { id: 'markets', label: 'Markets', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'watchlist', label: 'Watchlist', icon: <List className="w-4 h-4" /> },
  { id: 'supercharts', label: 'Supercharts', icon: <CandlestickChart className="w-4 h-4" /> },
  { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'menu', label: 'Menu', icon: <Menu className="w-4 h-4" /> },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSearch,
  liveFeedEnabled,
  onToggleLiveFeed,
  alerts,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const activeAlertsCount = alerts.filter((a) => a.active).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-safe bg-[#131722]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.45)] border-b border-[#2a2e39]/60">
      <div className="max-w-7xl mx-auto h-14 md:h-16 px-3 md:px-6 flex items-center justify-between gap-3 md:gap-6">
        {/* Left: Search Trigger (faithful to Stitch) + Desktop Nav */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onSelectTab('markets')}
            className="hidden md:flex items-center gap-2 text-[#f0f3fa] font-semibold tracking-tight text-base whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span className="w-7 h-7 rounded-md bg-[#2962ff] flex items-center justify-center text-white font-bold text-xs">
              PM
            </span>
            <span className="font-[var(--font-display)]">PulseMarkets</span>
          </button>

          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search markets and symbols"
            className="flex items-center gap-2 flex-1 max-w-[220px] md:max-w-[280px] bg-[#171b26] hover:bg-[#1e222d] border border-[#2a2e39]/80 px-2.5 py-1.5 rounded h-9 transition-colors cursor-pointer text-left"
          >
            <Search className="w-4 h-4 text-[#787b86] shrink-0" />
            <span className="text-[#787b86] text-xs truncate select-none flex-1">
              Search markets, symbols...
            </span>
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-[#787b86] bg-[#2a2e39] rounded">
              /
            </kbd>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary Navigation">
            {DESKTOP_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2a2e39] text-[#f0f3fa]'
                      : 'text-[#787b86] hover:text-[#f0f3fa] hover:bg-[#1e222d]'
                  }`}
                >
                  <span className={isActive ? 'text-[#2962ff]' : ''}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Market Session Status + Notifications + Profile */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0 relative">
          <button
            type="button"
            onClick={onToggleLiveFeed}
            title={liveFeedEnabled ? 'Live market ticks active (click to pause)' : 'Market ticks paused (click to resume)'}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#2a2e39] hover:bg-[#363a45] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                liveFeedEnabled ? 'bg-[#089981] animate-pulse' : 'bg-[#787b86]'
              }`}
            />
            <span className="text-[10px] font-semibold text-[#c3c5d8] uppercase tracking-wider">
              {liveFeedEnabled ? 'MKT OPEN' : 'PAUSED'}
            </span>
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => {
                setNotifOpen((prev) => !prev);
                setProfileOpen(false);
              }}
              className="w-11 h-11 flex items-center justify-center text-[#787b86] hover:text-[#f0f3fa] transition-colors rounded-lg relative cursor-pointer"
            >
              <Bell className="w-[19px] h-[19px]" />
              {activeAlertsCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2962ff]" />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-[#1e222d] border border-[#363a45] rounded-xl shadow-2xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2e39]">
                  <span className="text-xs font-semibold text-[#f0f3fa]">Market Alerts</span>
                  <span className="text-[10px] font-mono text-[#787b86]">
                    {activeAlertsCount} active
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1.5 max-h-56 overflow-y-auto">
                  {alerts.length === 0 ? (
                    <p className="text-xs text-[#787b86] py-3 text-center">
                      No price alerts yet. Set alerts inside Supercharts.
                    </p>
                  ) : (
                    alerts.map((al) => (
                      <div
                        key={al.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-[#171b26] text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#f0f3fa]">{al.symbol}</div>
                          <div className="text-[11px] text-[#787b86]">
                            Crosses {al.condition} {al.targetPrice.toLocaleString()}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[#089981] flex items-center gap-1">
                          <Check className="w-3 h-3" /> Armed
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative">
            <button
              type="button"
              aria-label="Account Menu"
              onClick={() => {
                setProfileOpen((prev) => !prev);
                setNotifOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-[#b6c4ff] hover:bg-[#dce1ff] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
            >
              <User className="w-[17px] h-[17px] text-[#002780]" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#1e222d] border border-[#363a45] rounded-xl shadow-2xl p-3 z-50">
                <div className="pb-2 border-b border-[#2a2e39]">
                  <div className="text-xs font-semibold text-[#f0f3fa]">Trader Workspace</div>
                  <div className="text-[11px] text-[#787b86]">US Regular Session · EST</div>
                </div>
                <div className="mt-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSelectTab('watchlist');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#dfe2f2] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                  >
                    Manage Watchlist
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      onSelectTab('menu');
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[#dfe2f2] hover:bg-[#2a2e39] transition-colors cursor-pointer"
                  >
                    Terminal Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
