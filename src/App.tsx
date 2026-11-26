/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { CommunityView } from './components/CommunityView';
import { MarketsView } from './components/MarketsView';
import { MenuView } from './components/MenuView';
import {
  AlertModal,
  CalendarModal,
  ScreenerModal,
  SearchModal,
} from './components/Modals';
import { SuperchartsView } from './components/SuperchartsView';
import { TopBar } from './components/TopBar';
import { WatchlistView } from './components/WatchlistView';
import {
  DEFAULT_WATCHLIST_IDS,
  ECONOMIC_EVENTS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_SYMBOLS,
} from './data/marketData';
import {
  CommunityPost,
  MarketSymbol,
  NavTabId,
  PriceAlert,
} from './types/market';

const STORAGE_WATCHLIST = 'pulsemarkets_watchlist_v1';
const STORAGE_ALERTS = 'pulsemarkets_alerts_v1';
const STORAGE_POSTS = 'pulsemarkets_posts_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>('markets');
  const [symbols, setSymbols] = useState<MarketSymbol[]>(INITIAL_SYMBOLS);
  const [selectedSymbolId, setSelectedSymbolId] = useState<string>('spx');
  const [liveFeedEnabled, setLiveFeedEnabled] = useState<boolean>(true);

  const [watchlistIds, setWatchlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WATCHLIST);
      return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST_IDS;
    } catch {
      return DEFAULT_WATCHLIST_IDS;
    }
  });

  const [alerts, setAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ALERTS);
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'al-init-1',
              symbol: 'NVDA',
              name: 'NVIDIA Corporation',
              targetPrice: 150.0,
              condition: 'above',
              active: true,
              createdAt: 'Today 09:30',
            },
          ];
    } catch {
      return [];
    }
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_POSTS);
      return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
    } catch {
      return INITIAL_COMMUNITY_POSTS;
    }
  });

  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [screenerOpen, setScreenerOpen] = useState<boolean>(false);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  const [alertTargetSymbol, setAlertTargetSymbol] = useState<MarketSymbol | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 2400);
    return () => clearTimeout(t);
  }, [toastMsg]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WATCHLIST, JSON.stringify(watchlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [watchlistIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ALERTS, JSON.stringify(alerts));
    } catch {
      // Ignore storage errors
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_POSTS, JSON.stringify(communityPosts));
    } catch {
      // Ignore storage errors
    }
  }, [communityPosts]);

  // Keyboard shortcuts: '/' or Cmd/Ctrl+K opens search, Escape closes modals
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !isInput)) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setScreenerOpen(false);
        setCalendarOpen(false);
        setAlertTargetSymbol(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Gentle real-time simulated tick stream
  useEffect(() => {
    if (!liveFeedEnabled) return;
    const interval = setInterval(() => {
      setSymbols((prev) =>
        prev.map((sym) => {
          // Only tick ~40% of instruments per cycle for realistic pulse
          if (Math.random() > 0.4) return sym;
          const jitter = (Math.random() - 0.49) * 0.0016;
          const nextPrice = Math.max(0.01, sym.price * (1 + jitter));
          const roundedPrice = Number(nextPrice.toFixed(sym.decimals));
          const deltaPct = jitter * 100;
          const nextChangePct = Number((sym.changePct + deltaPct).toFixed(2));
          const nextSparkline = [...sym.sparkline.slice(1), roundedPrice];
          return {
            ...sym,
            price: roundedPrice,
            changePct: nextChangePct,
            sparkline: nextSparkline,
          };
        })
      );
    }, 2600);
    return () => clearInterval(interval);
  }, [liveFeedEnabled]);

  const handleToggleWatchlist = (id: string) => {
    const sym = symbols.find((s) => s.id === id);
    setWatchlistIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        if (sym) showToast(`Removed ${sym.symbol} from Watchlist`);
        return prev.filter((item) => item !== id);
      }
      if (sym) showToast(`Added ${sym.symbol} to Watchlist`);
      return [id, ...prev];
    });
  };

  const handleOpenChart = (symbolId: string) => {
    setSelectedSymbolId(symbolId);
    setActiveTab('supercharts');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCreateAlert = (
    symbol: MarketSymbol,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    const newAlert: PriceAlert = {
      id: `al-${Date.now()}`,
      symbol: symbol.symbol,
      name: symbol.name,
      targetPrice,
      condition,
      active: true,
      createdAt: new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    };
    setAlerts((prev) => [newAlert, ...prev]);
    showToast(`Alert armed for ${symbol.symbol} ${condition} ${targetPrice}`);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    showToast('Alert removed');
  };

  const handleToggleLike = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const liked = !p.liked;
        return { ...p, liked, likes: p.likes + (liked ? 1 : -1) };
      })
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, bookmarked: !p.bookmarked } : p))
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setCommunityPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [
            ...p.comments,
            { id: `c-${Date.now()}`, author: 'You', text, time: 'Just now' },
          ],
        };
      })
    );
  };

  const handlePublishPost = (
    draft: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>
  ) => {
    const post: CommunityPost = {
      ...draft,
      id: `post-${Date.now()}`,
      timestamp: 'Just now',
      likes: 1,
      commentsCount: 0,
      liked: true,
      comments: [],
    };
    setCommunityPosts((prev) => [post, ...prev]);
    showToast('Market thesis published');
  };

  const handleResetWorkspace = () => {
    setWatchlistIds(DEFAULT_WATCHLIST_IDS);
    setAlerts([]);
    setCommunityPosts(INITIAL_COMMUNITY_POSTS);
    showToast('Workspace reset to defaults');
  };

  return (
    <div className="bg-[#0f131e] text-[#dfe2f2] flex flex-col min-h-screen">
      <TopBar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={() => setSearchOpen(true)}
        liveFeedEnabled={liveFeedEnabled}
        onToggleLiveFeed={() => {
          setLiveFeedEnabled((v) => !v);
          showToast(liveFeedEnabled ? 'Live market ticks paused' : 'Live market ticks resumed');
        }}
        alerts={alerts}
      />

      <main className="flex-1 w-full pt-14 md:pt-16 pb-20 md:pb-8 bg-[#0f131e]">
        {activeTab === 'markets' && (
          <MarketsView
            symbols={symbols}
            economicEvents={ECONOMIC_EVENTS}
            watchlistIds={watchlistIds}
            liveFeedEnabled={liveFeedEnabled}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenChart={handleOpenChart}
            onOpenScreener={() => setScreenerOpen(true)}
            onOpenCalendar={() => setCalendarOpen(true)}
            onOpenCommunity={() => {
              setActiveTab('community');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistView
            symbols={symbols}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenChart={handleOpenChart}
            onOpenSearch={() => setSearchOpen(true)}
            onResetDefaultWatchlist={() => {
              setWatchlistIds(DEFAULT_WATCHLIST_IDS);
              showToast('Default watchlist restored');
            }}
          />
        )}

        {activeTab === 'supercharts' && (
          <SuperchartsView
            symbols={symbols}
            selectedSymbolId={selectedSymbolId}
            onSelectSymbol={setSelectedSymbolId}
            watchlistIds={watchlistIds}
            onToggleWatchlist={handleToggleWatchlist}
            onOpenAlertModal={(sym) => setAlertTargetSymbol(sym)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityView
            posts={communityPosts}
            symbols={symbols}
            onToggleLike={handleToggleLike}
            onToggleBookmark={handleToggleBookmark}
            onAddComment={handleAddComment}
            onPublishPost={handlePublishPost}
            onOpenChart={handleOpenChart}
          />
        )}

        {activeTab === 'menu' && (
          <MenuView
            liveFeedEnabled={liveFeedEnabled}
            onToggleLiveFeed={() => setLiveFeedEnabled((v) => !v)}
            alerts={alerts}
            onDeleteAlert={handleDeleteAlert}
            onOpenScreener={() => setScreenerOpen(true)}
            onOpenCalendar={() => setCalendarOpen(true)}
            onSelectTab={(tab) => setActiveTab(tab)}
            onResetWorkspace={handleResetWorkspace}
          />
        )}
      </main>

      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals */}
      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        symbols={symbols}
        watchlistIds={watchlistIds}
        onToggleWatchlist={handleToggleWatchlist}
        onSelectSymbol={handleOpenChart}
      />

      <ScreenerModal
        open={screenerOpen}
        onClose={() => setScreenerOpen(false)}
        symbols={symbols}
        onSelectSymbol={handleOpenChart}
      />

      <CalendarModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        events={ECONOMIC_EVENTS}
      />

      <AlertModal
        symbol={alertTargetSymbol}
        onClose={() => setAlertTargetSymbol(null)}
        onCreateAlert={handleCreateAlert}
      />

      {/* Toast Feedback */}
      {toastMsg && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#2a2e39] border border-[#363a45] text-xs font-medium text-[#f0f3fa] shadow-xl pointer-events-none"
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
