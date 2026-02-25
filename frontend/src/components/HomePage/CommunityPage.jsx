import { useState, useEffect } from 'react';

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

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// TODO (backend): Replace static array with a fetch:
//   const [threads, setThreads] = useState([]);
//   useEffect(() => {
//     fetch(`/api/forum/threads?category=${activeCategory}&q=${search}`)
//       .then(r => r.json())
//       .then(setThreads);
//   }, [activeCategory, search]);

const MOCK_THREADS = [
  {
    id: 1,
    title: "No cap, what does 'delulu' actually mean? Asking fr fr",
    category: 'Slang Help',
    author: 'SkibidiSage',
    avatarEmoji: '🧠',
    avatarBg: 'from-[#7c3aed] to-[#4f46e5]',
    timestamp: '2h ago',
    replies: 24,
    likes: 47,
    isHot: true,
    preview: "I keep seeing it everywhere on my FYP but I'm lowkey lost. Is it like delusion or something else entirely?",
  },
  {
    id: 2,
    title: "My rizz tier list based on the course material — W or L?",
    category: 'Showcase',
    author: 'RizzKingXD',
    avatarEmoji: '🔥',
    avatarBg: 'from-[#dc2626] to-[#7f1d1d]',
    timestamp: '5h ago',
    replies: 61,
    likes: 132,
    isHot: true,
    preview: "After finishing Rizz Theory I ranked all the techniques. S tier: eye contact + silence. D tier: unsolicited opinions.",
  },
  {
    id: 3,
    title: "Can someone explain the 'Sigma' meme to my boomer dad? lmao",
    category: 'Memes',
    author: 'NoCap_Nathan',
    avatarEmoji: '🐺',
    avatarBg: 'from-[#15803d] to-[#14532d]',
    timestamp: '1d ago',
    replies: 38,
    likes: 88,
    isHot: false,
    preview: "He saw me doing the sigma walk and now he thinks it's a math thing. Help.",
  },
  {
    id: 4,
    title: "Tips for memorising brainrot vocab faster — my Anki method",
    category: 'Tips & Tricks',
    author: 'StudyModeActivated',
    avatarEmoji: '📖',
    avatarBg: 'from-[#0e7490] to-[#0f3460]',
    timestamp: '1d ago',
    replies: 15,
    likes: 54,
    isHot: false,
    preview: "I make Anki cards for each slang term with a meme as the image. Retention went from 40% to 90% no cap.",
  },
  {
    id: 5,
    title: "Skibidi Toilet lore explained — a full deep-dive thread",
    category: 'Memes',
    author: 'LoreKeeper99',
    avatarEmoji: '🚽',
    avatarBg: 'from-[#0284c7] to-[#0f3460]',
    timestamp: '2d ago',
    replies: 102,
    likes: 240,
    isHot: true,
    preview: "Season 1-7 summary, character analysis, and what it actually says about Gen Alpha storytelling instincts.",
  },
  {
    id: 6,
    title: "Is 'based' still based or is it cringe now? A serious discussion",
    category: 'Slang Help',
    author: 'BasedPhilosopher',
    avatarEmoji: '🤔',
    avatarBg: 'from-[#a21caf] to-[#4a044e]',
    timestamp: '3d ago',
    replies: 77,
    likes: 109,
    isHot: false,
    preview: "The half-life of internet slang is getting shorter. Is 'based' already too mainstream to be based?",
  },
  {
    id: 7,
    title: "Share your funniest 'NPC moment' IRL — I'll go first",
    category: 'Off-Topic',
    author: 'GlitchedInRL',
    avatarEmoji: '🤖',
    avatarBg: 'from-[#d97706] to-[#78350f]',
    timestamp: '4d ago',
    replies: 93,
    likes: 175,
    isHot: true,
    preview: "I walked into a glass door at full speed in front of 20 people and just stood there smiling. Peak NPC energy.",
  },
  {
    id: 8,
    title: "W take: TikTok slang is actually improving linguistic creativity",
    category: 'Off-Topic',
    author: 'LinguistOnMain',
    avatarEmoji: '🌐',
    avatarBg: 'from-[#0e7490] to-[#155e75]',
    timestamp: '5d ago',
    replies: 44,
    likes: 67,
    isHot: false,
    preview: "Hot take but language evolving via memes follows the same patterns as historical creole formation. Discuss.",
  },
];

// ─── Stat summary bar (pinned above thread list) ──────────────────────────────
// Mirrors the badge pill style used in HomePage.jsx profile card
const STATS = [
  { label: 'Threads',  value: '128',  color: 'text-[#a78bfa]', bg: 'bg-[rgba(139,92,246,0.12)] border-[rgba(139,92,246,0.2)]' },
  { label: 'Members',  value: '2.4k', color: 'text-[#4ade80]', bg: 'bg-[rgba(74,222,128,0.08)] border-[rgba(74,222,128,0.2)]' },
  { label: 'Online',   value: '37',   color: 'text-[#fbbf24]', bg: 'bg-[rgba(251,191,36,0.1)]  border-[rgba(251,191,36,0.25)]' },
];

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
const IconHeart = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
// TODO (backend): Pass onClick={() => navigate(`/home/community/thread/${thread.id}`)}
function ThreadCard({ thread, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group flex items-start gap-4 bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_28px_rgba(139,92,246,0.15)] hover:-translate-y-0.5"
    >
      {/* ── Author Avatar ── */}
      {/* Gradient circle with emoji — matches the Level badge + XP pill style in HomePage.jsx */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br ${thread.avatarBg}
          flex items-center justify-center text-[1.1rem] select-none shadow-[0_2px_8px_rgba(0,0,0,0.4)]`}
      >
        {thread.avatarEmoji}
      </div>

      {/* ── Thread Body ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-[0.3rem]">

        {/* Row 1: category pill + hot badge */}
        <div className="flex items-center gap-[0.4rem] flex-wrap">
          <CategoryPill category={thread.category} small />
          {thread.isHot && (
            // Hot badge — mirrors the orange "Day 5" streak pill in HomePage.jsx
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

        {/* Row 4: author · timestamp — mirrors course category label in LearnPage.jsx */}
        <div className="flex items-center gap-[0.4rem] text-[0.75rem] text-[#5a5278] mt-[0.05rem]">
          <span className="font-semibold text-[#7c6ea8]">{thread.author}</span>
          <span className="opacity-40">·</span>
          <span>{thread.timestamp}</span>
        </div>
      </div>

      {/* ── Stats Column ── */}
      {/* Right-aligned reply/like counts — mirrors the lesson/time badges in HomePage.jsx */}
      <div className="flex-shrink-0 flex flex-col items-end gap-[0.45rem] text-[0.78rem] text-[#5a5278] mt-[0.1rem]">
        <span className="flex items-center gap-[0.3rem]">
          <IconReply />
          {thread.replies}
        </span>
        <span className="flex items-center gap-[0.3rem]">
          <IconHeart />
          {thread.likes}
        </span>
      </div>
    </div>
  );
}

// ─── CreatePostModal ──────────────────────────────────────────────────────────
// Structure mirrors CourseModal from LearnPage.jsx:
//   fixed overlay + backdrop-blur, centered card, Escape-to-close, modalIn animation
//
// TODO (backend): Replace handleSubmit body with:
//   const res = await fetch('/api/forum/threads', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ title, category, content, authorId: currentUser.id }),
//   });
//   if (res.ok) { refreshThreads(); onClose(); }
function CreatePostModal({ onClose }) {
  const [title,    setTitle]    = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]); // default: first real category
  const [content,  setContent]  = useState('');

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

  function handleSubmit(e) {
    e.preventDefault();
    // TODO (backend): await POST /api/forum/threads
    onClose();
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

          {/* Action buttons */}
          <div className="flex gap-3 justify-end pt-1">
            {/* Cancel — secondary style, mirrors "View Stats" button in HomePage.jsx */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-transparent border border-[rgba(139,92,246,0.2)] text-[#9090b0] rounded-[10px] text-[0.88rem] font-semibold cursor-pointer transition-all hover:border-[rgba(139,92,246,0.4)] hover:text-[#f0eeff]"
            >
              Cancel
            </button>
            {/* Submit — primary gradient, mirrors "Lock In" button in HomePage.jsx */}
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white rounded-[10px] text-[0.88rem] font-extrabold cursor-pointer shadow-[0_4px_16px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_22px_rgba(124,58,237,0.5)] border-none"
            >
              Post it →
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
  const [activeCategory,  setActiveCategory]  = useState('All');
  const [search,          setSearch]          = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // TODO (backend): replace MOCK_THREADS with stateful fetch (see comment above)
  const filtered = MOCK_THREADS.filter(t =>
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
      {/* Pill badges mirror the XP / rank / streak badges in HomePage.jsx profile card */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {STATS.map(s => (
          <span
            key={s.label}
            className={`text-sm font-bold px-4 py-[0.35rem] rounded-[20px] border flex items-center gap-1 ${s.bg} ${s.color}`}
          >
            {s.value} <span className="font-medium text-[#5a5278]">{s.label}</span>
          </span>
        ))}
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
      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">

          {/* Thread count label — mirrors "Last 12 days" label style in HomePage.jsx */}
          <p className="text-[0.78rem] text-[#5a5278] font-semibold m-0 mb-1">
            {filtered.length} thread{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            {search && ` matching "${search}"`}
          </p>

          {/* Thread cards */}
          {/* TODO (backend): onClick → navigate(`/home/community/thread/${thread.id}`) */}
          {filtered.map(thread => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              onClick={() => { /* TODO: navigate to thread detail */ }}
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
        <CreatePostModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
