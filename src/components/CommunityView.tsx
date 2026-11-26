import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  Heart,
  MessageSquare,
  Plus,
  Send,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { CommunityPost, MarketSymbol } from '../types/market';
import { Sparkline } from './Sparkline';

interface CommunityViewProps {
  posts: CommunityPost[];
  symbols: MarketSymbol[];
  onToggleLike: (postId: string) => void;
  onToggleBookmark: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onPublishPost: (post: Omit<CommunityPost, 'id' | 'timestamp' | 'likes' | 'commentsCount' | 'comments'>) => void;
  onOpenChart: (symbolId: string) => void;
}

type FeedFilter = 'All' | 'Stocks' | 'Crypto' | 'Macro' | 'Indices';

export const CommunityView: React.FC<CommunityViewProps> = ({
  posts,
  symbols,
  onToggleLike,
  onToggleBookmark,
  onAddComment,
  onPublishPost,
  onOpenChart,
}) => {
  const [filter, setFilter] = useState<FeedFilter>('All');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [composerOpen, setComposerOpen] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newSymbol, setNewSymbol] = useState('NVDA');
  const [newBias, setNewBias] = useState<'Bullish' | 'Bearish' | 'Neutral'>('Bullish');
  const [newCategory, setNewCategory] = useState<'Stocks' | 'Crypto' | 'Macro' | 'Indices'>('Stocks');
  const [newSummary, setNewSummary] = useState('');

  const filteredPosts = useMemo(() => {
    if (filter === 'All') return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;
    const matched = symbols.find((s) => s.symbol === newSymbol) ?? symbols[0];
    onPublishPost({
      author: 'You',
      handle: '@desk_trader',
      avatarInitials: 'YT',
      avatarColor: '#2962ff',
      symbol: matched.symbol,
      title: newTitle.trim(),
      summary: newSummary.trim(),
      bias: newBias,
      category: newCategory,
      timeframe: '4H',
      sparkline: matched.sparkline,
    });
    setNewTitle('');
    setNewSummary('');
    setComposerOpen(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 md:px-6 pt-4 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#f0f3fa] font-[var(--font-display)] tracking-tight">
            Trading Community
          </h1>
          <p className="text-xs text-[#787b86] mt-0.5">
            Quantitative setups, cycle analysis, and macro trade ideas
          </p>
        </div>

        <button
          type="button"
          onClick={() => setComposerOpen((v) => !v)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2962ff] hover:bg-[#2962ff]/90 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{composerOpen ? 'Close Editor' : 'Publish Idea'}</span>
        </button>
      </div>

      {/* New Idea Composer */}
      {composerOpen && (
        <form
          onSubmit={handleCreatePost}
          className="bg-[#1e222d] border border-[#363a45] rounded-xl p-4 mb-4 flex flex-col gap-3 shadow-lg"
        >
          <div className="text-xs font-semibold text-[#f0f3fa]">New Market Thesis</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <select
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
            >
              {symbols.slice(0, 16).map((s) => (
                <option key={s.id} value={s.symbol}>
                  {s.symbol} — {s.name}
                </option>
              ))}
            </select>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
              className="bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
            >
              <option value="Stocks">Stocks</option>
              <option value="Crypto">Crypto</option>
              <option value="Macro">Macro</option>
              <option value="Indices">Indices</option>
            </select>
            <select
              value={newBias}
              onChange={(e) => setNewBias(e.target.value as typeof newBias)}
              className="bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
            >
              <option value="Bullish">Bullish Bias</option>
              <option value="Bearish">Bearish Bias</option>
              <option value="Neutral">Neutral Bias</option>
            </select>
          </div>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Headline (e.g., NVDA Breakout Watch Above $148)"
            className="bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-[#f0f3fa] placeholder:text-[#50535e] focus:outline-none focus:border-[#2962ff]"
          />
          <textarea
            rows={3}
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            placeholder="Share key levels, volume observations, or macro catalysts..."
            className="bg-[#171b26] border border-[#2a2e39] rounded-lg px-3 py-2 text-xs text-[#f0f3fa] placeholder:text-[#50535e] focus:outline-none focus:border-[#2962ff] resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-[#2a2e39] text-xs text-[#dfe2f2] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#2962ff] text-xs font-semibold text-white cursor-pointer"
            >
              Post Thesis
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3">
        {(['All', 'Stocks', 'Crypto', 'Macro', 'Indices'] as FeedFilter[]).map((tab) => {
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

      {/* Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPosts.map((post) => {
          const isExpanded = expandedPostId === post.id;
          const isBull = post.bias === 'Bullish';
          const isBear = post.bias === 'Bearish';
          const symbolMatch = symbols.find((s) => s.symbol === post.symbol);

          return (
            <article
              key={post.id}
              className="bg-[#1e222d] rounded-xl p-4 shadow-md flex flex-col justify-between gap-3"
            >
              <div>
                {/* Author Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                      style={{ backgroundColor: post.avatarColor }}
                    >
                      {post.avatarInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#f0f3fa] truncate">
                        {post.author}
                      </div>
                      <div className="text-[10px] text-[#787b86]">
                        {post.handle} · {post.timestamp}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                      isBull
                        ? 'bg-[#089981]/15 text-[#089981]'
                        : isBear
                        ? 'bg-[#f23645]/15 text-[#f23645]'
                        : 'bg-[#2a2e39] text-[#c3c5d8]'
                    }`}
                  >
                    {isBull ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : isBear ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {post.bias}
                  </span>
                </div>

                {/* Content */}
                <h2 className="text-sm font-semibold text-[#f0f3fa] mt-3 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs text-[#c3c5d8] mt-1.5 leading-relaxed">{post.summary}</p>

                {/* Embedded Chart Mini Card */}
                <div
                  onClick={() => symbolMatch && onOpenChart(symbolMatch.id)}
                  className="mt-3 p-2.5 rounded-lg bg-[#171b26] hover:bg-[#262a35] flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-xs font-bold text-[#f0f3fa]">{post.symbol}</div>
                    <div className="text-[10px] text-[#787b86]">
                      {post.timeframe} Setup · Tap to view chart
                    </div>
                  </div>
                  <div className="w-24 h-7">
                    <Sparkline data={post.sparkline} positive={!isBear} height={28} />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-[#2a2e39] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleLike(post.id)}
                    className={`flex items-center gap-1 text-xs cursor-pointer transition-colors ${
                      post.liked ? 'text-[#f23645]' : 'text-[#787b86] hover:text-[#f0f3fa]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${post.liked ? 'fill-[#f23645]' : ''}`} />
                    <span className="tabular-nums">{post.likes}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="flex items-center gap-1 text-xs text-[#787b86] hover:text-[#f0f3fa] cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="tabular-nums">{post.commentsCount}</span>
                  </button>
                </div>

                <button
                  type="button"
                  aria-label="Bookmark idea"
                  onClick={() => onToggleBookmark(post.id)}
                  className={`p-1.5 rounded cursor-pointer transition-colors ${
                    post.bookmarked ? 'text-[#2962ff]' : 'text-[#787b86] hover:text-[#f0f3fa]'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${post.bookmarked ? 'fill-[#2962ff]' : ''}`}
                  />
                </button>
              </div>

              {/* Expandable Comments */}
              {isExpanded && (
                <div className="pt-2 border-t border-[#2a2e39] flex flex-col gap-2">
                  {post.comments.length === 0 ? (
                    <p className="text-[11px] text-[#787b86]">No remarks yet. Start the thread.</p>
                  ) : (
                    post.comments.map((c) => (
                      <div key={c.id} className="bg-[#171b26] rounded-lg p-2 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-[#787b86]">
                          <span className="font-semibold text-[#dfe2f2]">{c.author}</span>
                          <span>{c.time}</span>
                        </div>
                        <p className="text-[#c3c5d8] mt-0.5 text-[11px]">{c.text}</p>
                      </div>
                    ))
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const txt = (commentText[post.id] ?? '').trim();
                      if (!txt) return;
                      onAddComment(post.id, txt);
                      setCommentText((prev) => ({ ...prev, [post.id]: '' }));
                    }}
                    className="flex items-center gap-1.5 mt-1"
                  >
                    <input
                      type="text"
                      value={commentText[post.id] ?? ''}
                      onChange={(e) =>
                        setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      placeholder="Add remark..."
                      className="flex-1 bg-[#171b26] border border-[#2a2e39] rounded-lg px-2.5 py-1.5 text-xs text-[#f0f3fa] placeholder:text-[#50535e] focus:outline-none focus:border-[#2962ff]"
                    />
                    <button
                      type="submit"
                      aria-label="Send comment"
                      className="p-2 rounded-lg bg-[#2962ff] text-white cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
