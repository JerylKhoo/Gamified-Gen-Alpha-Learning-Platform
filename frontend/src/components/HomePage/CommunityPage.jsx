import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Design tokens (strictly mirrors existing app theme) ──────────────────────
// Primary accent:   #8b5cf6 | rgba(139,92,246,x)
// Primary gradient: from-[#7c3aed] to-[#4f46e5]
// Card bg:          #0d0f18  (thread cards)  |  rgba(255,255,255,0.03) (stat cards)
// Card border:      rgba(139,92,246,0.18)
// Hover border:     rgba(139,92,246,0.45)
// Text primary:     #f0eeff  |  #e0d9ff
// Text secondary:   #9090b0
// Text muted:       #6b6490  |  #5a5278  |  #4b4870
// Section label:    text-[0.8rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]
// Filter tabs:      from LearnPage.jsx (exact same pattern)
// Scrollbar:        .styled-scroll  (defined in index.css)
// Modal animation:  modalIn keyframe (same as CourseModal in LearnPage.jsx)

// ─── Forum Categories ─────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Memes', 'Slang Help', 'Tips & Tricks', 'Showcase', 'Off-Topic'];

// Category pill colour map — extends the green/purple/red difficulty-pill
// pattern already established in LearnPage.jsx
const CATEGORY_STYLE = {
  'Memes':         'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.25)] text-[#a78bfa]',
  'Slang Help':    'bg-[rgba(59,130,246,0.12)]  border-[rgba(59,130,246,0.25)]  text-[#60a5fa]',
  'Tips & Tricks': 'bg-[rgba(74,222,128,0.08)]  border-[rgba(74,222,128,0.2)]   text-[#4ade80]',
  'Showcase':      'bg-[rgba(251,191,36,0.1)]   border-[rgba(251,191,36,0.25)]  text-[#fbbf24]',
  'Off-Topic':     'bg-[rgba(248,113,113,0.1)]  border-[rgba(248,113,113,0.2)]  text-[#f87171]',
};

// ─── Stat pill styles ────────────────────────────────────────────────────────
const STAT_STYLES = {
  Threads: { color: 'text-[#a78bfa]', bg: 'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.2)]' },
};

// ─── SVG icons (inline, no external dependency) ───────────────────────────────
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);
const IconReply = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconHeartOutline = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconHeartFilled = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

// ─── CategoryPill ─────────────────────────────────────────────────────────────
// Reuses the border + pill pattern from DIFFICULTY_COLOR in LearnPage.jsx
function CategoryPill({ category, small = false }) {
  const cls = CATEGORY_STYLE[category]
    ?? 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#9090b0]';
  return (
    <span
      className={`inline-flex items-center border rounded-md font-semibold tracking-[0.06em] uppercase
        ${small ? 'text-[0.63rem] px-[0.4rem] py-[0.12rem]' : 'text-[0.72rem] px-2 py-[0.25rem]'}
        ${cls}`}
    >
      {category}
    </span>
  );
}

// ─── ThreadCard ───────────────────────────────────────────────────────────────
// Layout mirrors CourseCard from LearnPage.jsx:
//   dark bg, subtle border, hover lift + purple glow, transition-all duration-300
function ThreadCard({ thread, onClick, onUpvote, upvoted, upvoting }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-4 bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_28px_rgba(139,92,246,0.15)] hover:-translate-y-0.5"
    >
      {/* ── Author Avatar ── */}
      {thread.authorProfilePic ? (
        <img
          src={thread.authorProfilePic}
          alt={thread.author}
          className="flex-shrink-0 w-10 h-10 rounded-full object-cover shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
        />
      ) : (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] flex items-center justify-center text-[1.1rem] font-bold text-white select-none shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
          {thread.author?.charAt(0)?.toUpperCase() || '?'}
        </div>
      )}

      {/* ── Thread Body ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-[0.3rem]">

        {/* Row 1: category pill + hot badge */}
        <div className="flex items-center gap-[0.4rem] flex-wrap">
          <CategoryPill category={thread.category} small />
          {thread.isHot && (
            <span className="inline-flex items-center gap-[0.22rem] text-[0.63rem] font-bold text-[#fb923c] bg-[rgba(251,146,60,0.1)] border border-[rgba(251,146,60,0.2)] rounded-md px-[0.38rem] py-[0.1rem]">
              🔥 Hot
            </span>
          )}
        </div>

        {/* Row 2: title */}
        <h3 className="m-0 text-[0.97rem] font-bold text-[#e0d9ff] group-hover:text-white transition-colors leading-snug line-clamp-2">
          {thread.title}
        </h3>

        {/* Row 3: preview snippet */}
        <p className="m-0 text-[0.82rem] text-[#6b7280] leading-relaxed line-clamp-1">
          {thread.preview}
        </p>

        {/* Row 4: author · timestamp */}
        <div className="flex items-center gap-[0.4rem] text-[0.75rem] text-[#5a5278] mt-[0.05rem]">
          <span className="font-semibold text-[#7c6ea8]">{thread.author}</span>
          <span className="opacity-40">·</span>
          <span>{thread.timestamp}</span>
        </div>
      </div>

      {/* ── Stats Column ── */}
      <div className="flex-shrink-0 flex flex-col items-end gap-[0.45rem] text-[0.78rem] text-[#5a5278] mt-[0.1rem]">
        <span className="flex items-center gap-[0.3rem]">
          <IconReply />
          {thread.replies}
        </span>
        <button
          onClick={e => { e.stopPropagation(); if (!upvoting) onUpvote(thread.id); }}
          disabled={upvoting}
          className={`flex items-center gap-[0.3rem] bg-transparent border-none p-0 cursor-pointer transition-all duration-200 ${
            upvoted
              ? 'text-[#f87171]'
              : 'text-[#5a5278] hover:text-[#f87171]'
          } ${upvoting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {upvoted ? <IconHeartFilled /> : <IconHeartOutline />}
          {thread.likes}
        </button>
      </div>
    </div>
  );
}

// ─── CreatePostModal ──────────────────────────────────────────────────────────
// Structure mirrors CourseModal from LearnPage.jsx:
//   fixed overlay + backdrop-blur, centered card, Escape-to-close, modalIn animation
//
function CreatePostModal({ onClose, onCreated }) {
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // default: first real category
  const [content,  setContent]  = useState('');
  const [picture,  setPicture]  = useState('');

  // Close on Escape — same pattern as CourseModal in LearnPage.jsx
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Shared input style — dark bg, purple border, purple glow on focus
  const inputCls =
    'w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] ' +
    'px-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none ' +
    'focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all';

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError('You must be logged in to post.'); return; }
      const res = await fetch(`${API_URL}/api/v1/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ title, category, description: content, picture: picture || null }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to create post');
      }
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[500px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(139,92,246,0.12)]">
          <h2 className="m-0 text-[1.1rem] font-extrabold text-[#f0eeff]">Create Post</h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent text-[#9090b0] border border-[rgba(255,255,255,0.08)] cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.1)] hover:text-[#f0eeff]"
          >
            <IconClose />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          {/* Post Title */}
          {/* Label style matches cardTitleCls used across HomePage.jsx */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
              Post Title
            </label>
            <input
              className={inputCls}
              placeholder="What's on your mind? No cap..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
              Category
            </label>
            <select
              className={inputCls + ' cursor-pointer'}
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ backgroundColor: 'rgba(13,15,24,1)' }} /* override browser default */
            >
              {CATEGORIES.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
              Content
            </label>
            <textarea
              className={inputCls + ' resize-none h-[110px] leading-relaxed'}
              placeholder="Spill the tea... (be respectful tho fr)"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>

          {/* Image URL */}
          <div className="flex flex-col gap-[0.4rem]">
            <label className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">
              Image URL <span className="font-normal text-[#5a5278]">(optional)</span>
            </label>
            <input
              className={inputCls}
              placeholder="Paste an image link..."
              value={picture}
              onChange={e => setPicture(e.target.value)}
            />
            {picture && (
              <img
                src={picture}
                alt="Preview"
                className="w-full max-h-[160px] object-cover rounded-lg border border-[rgba(139,92,246,0.15)] mt-1"
                onError={e => { e.target.style.display = 'none'; }}
                onLoad={e => { e.target.style.display = 'block'; }}
              />
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm m-0">{error}</p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-[rgba(139,92,246,0.2)] text-[#9090b0] rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all hover:border-[rgba(139,92,246,0.4)] hover:text-[#f0eeff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white rounded-[10px] text-[0.88rem] font-extrabold cursor-pointer shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(124,58,237,0.5)] border-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post it →'}
            </button>
          </div>
        </form>

        {/* Reuse same keyframe name as CourseModal in LearnPage.jsx */}
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>
      </div>
    </div>
  );
}

// ─── CommunityPage (default export) ──────────────────────────────────────────
// Mounts at /home/community via App.jsx
// Outer wrapper mirrors LearnPage.jsx: full-width, min-h-screen, px-8 py-8
export default function CommunityPage() {
  const navigate = useNavigate();
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [search,          setSearch]          = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts,           setPosts]           = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [upvotedIds,      setUpvotedIds]      = useState(new Set());
  const [upvotingId,      setUpvotingId]      = useState(null);

  async function fetchPosts() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const headers = { Authorization: `Bearer ${session.access_token}` };
      const [postsRes, upvotesRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/posts`, { headers }),
        fetch(`${API_URL}/api/v1/posts/upvotes/me`, { headers }),
      ]);
      if (postsRes.ok) {
        setPosts(await postsRes.json());
      }
      if (upvotesRes.ok) {
        const ids = await upvotesRes.json();
        setUpvotedIds(new Set(ids));
      }
    } catch { /* keep empty */ }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchPosts(); }, []);

  async function handleUpvote(postId) {
    const wasUpvoted = upvotedIds.has(postId);
    const delta = wasUpvoted ? -1 : 1;
    setUpvotingId(postId);

    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.postId === postId ? { ...p, upvote: Math.max(0, (p.upvote || 0) + delta) } : p
    ));
    setUpvotedIds(prev => {
      const next = new Set(prev);
      wasUpvoted ? next.delete(postId) : next.add(postId);
      return next;
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch(`${API_URL}/api/v1/posts/${postId}/upvote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        // Sync with server's actual count
        const updated = await res.json();
        setPosts(prev => prev.map(p =>
          p.postId === postId ? { ...p, upvote: updated.upvote } : p
        ));
      } else {
        // Revert on error
        setPosts(prev => prev.map(p =>
          p.postId === postId ? { ...p, upvote: Math.max(0, (p.upvote || 0) - delta) } : p
        ));
        setUpvotedIds(prev => {
          const next = new Set(prev);
          wasUpvoted ? next.add(postId) : next.delete(postId);
          return next;
        });
      }
    } catch {
      // Revert on network error
      setPosts(prev => prev.map(p =>
        p.postId === postId ? { ...p, upvote: Math.max(0, (p.upvote || 0) - delta) } : p
      ));
      setUpvotedIds(prev => {
        const next = new Set(prev);
        wasUpvoted ? next.add(postId) : next.delete(postId);
        return next;
      });
    } finally {
      setUpvotingId(null);
    }
  }

  // Map backend posts to thread-card shape
  const threads = posts.map((p) => ({
    id: p.postId,
    title: p.title || '(Untitled)',
    category: p.category || 'Off-Topic',
    author: p.authorName || 'Member',
    authorProfilePic: p.authorProfilePic || null,
    timestamp: '',
    replies: 0,
    likes: p.upvote || 0,
    isHot: (p.upvote || 0) >= 10,
    preview: p.description || '',
  }));

  const filtered = threads.filter(t =>
    (activeCategory === 'All' || t.category === activeCategory) &&
    (search === '' || t.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      {/* Layout mirrors LearnPage.jsx header block */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 mb-1 flex items-center gap-3">
            Community Forum
          </h1>
          <p className="text-[#6b6490] text-sm m-0">
            Share W takes, ask slang questions, and vibe with the community.
          </p>
        </div>

        {/* "Create Post" — primary gradient button, mirrors "Lock In" in HomePage.jsx */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex-shrink-0 flex items-center gap-2 px-5 py-[0.6rem] bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white rounded-xl text-[0.9rem] font-extrabold cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] border-none"
        >
          <IconPlus />
          Create Post
        </button>
      </div>

      {/* ── Community Stats Bar ──────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <span className={`text-sm font-bold px-4 py-[0.35rem] rounded-[20px] border flex items-center gap-1 ${STAT_STYLES.Threads.bg} ${STAT_STYLES.Threads.color}`}>
          {posts.length} <span className="font-medium text-[#5a5278]">Threads</span>
        </span>
      </div>

      {/* ── Search Input ─────────────────────────────────────────────────────── */}
      <div className="relative mb-5">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4b4870] pointer-events-none">
          <IconSearch />
        </div>
        <input
          type="text"
          placeholder="Search threads..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-[400px] bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] pl-9 pr-3 py-2 text-[0.9rem] text-[#f0eeff] placeholder:text-[#4b4870] outline-none focus:border-[rgba(139,92,246,0.5)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] transition-all"
        />
      </div>

      {/* ── Category Filter Tabs ─────────────────────────────────────────────── */}
      {/* Exact same pill tab pattern as LearnPage.jsx FILTERS */}
      <div className="flex gap-2 flex-wrap mb-7">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-[0.45rem] rounded-full text-sm font-semibold border cursor-pointer transition-all ${
              activeCategory === cat
                ? 'bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.5)] text-[#c4b5fd]'
                : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#6b6490] hover:border-[rgba(139,92,246,0.3)] hover:text-[#a78bfa]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Thread List ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#6b6490]">
          <p className="text-lg font-semibold animate-pulse">Loading posts...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex flex-col gap-3">

          {/* Thread count label — mirrors "Last 12 days" label style in HomePage.jsx */}
          <p className="text-[0.78rem] text-[#5a5278] font-semibold m-0 mb-1">
            {filtered.length} thread{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {search && ` matching "${search}"`}
          </p>

          {filtered.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => navigate(`/community/${thread.id}`)}
              onUpvote={handleUpvote}
              upvoted={upvotedIds.has(thread.id)}
              upvoting={upvotingId === thread.id}
            />
          ))}
        </div>
      ) : (
        /* Empty state — mirrors LearnPage.jsx empty state block */
        <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-lg font-semibold m-0">
            {search
              ? `No threads matching "${search}"`
              : 'No threads in this category yet.'}
          </p>
          <p className="text-sm mt-2 text-[#3a3860]">Be the first to post something!</p>
        </div>
      )}

      {/* ── Create Post Modal ────────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchPosts}
        />
      )}
    </div>
  );
}
