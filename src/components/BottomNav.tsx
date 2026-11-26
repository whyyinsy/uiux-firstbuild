import React from 'react';
import {
  CandlestickChart,
  List,
  Menu,
  MessageSquare,
  TrendingUp,
} from 'lucide-react';
import { NavTabId } from '../types/market';

interface BottomNavProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

const TABS: { id: NavTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'watchlist', label: 'Watchlist', icon: List },
  { id: 'supercharts', label: 'Supercharts', icon: CandlestickChart },
  { id: 'community', label: 'Community', icon: MessageSquare },
  { id: 'menu', label: 'Menu', icon: Menu },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab }) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe bg-[#131722]/95 backdrop-blur-xl shadow-[0_-1px_12px_rgba(0,0,0,0.5)] border-t border-[#2a2e39]/70"
    >
      <div className="flex justify-around items-center h-16 px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] gap-0.5 transition-colors cursor-pointer ${
                isActive
                  ? 'text-[#2962ff] font-semibold'
                  : 'text-[#787b86] hover:text-[#f0f3fa]'
              }`}
            >
              <Icon className="w-[21px] h-[21px]" />
              <span className="text-[11px] leading-[14px] tracking-[0.02em] whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
