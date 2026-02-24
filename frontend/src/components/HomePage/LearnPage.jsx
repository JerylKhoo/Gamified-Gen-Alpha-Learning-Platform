import { useState, useEffect } from 'react';

const FILTERS = ['All', 'Slang', 'Meme Culture', 'Social Media', 'Gen Z Language', 'TikTok', 'Internet Culture'];

const DIFFICULTY_COLOR = {
  Beginner:     { pill: 'bg-[#1a2a1a] border-[rgba(74,222,128,0.2)] text-[#4ade80]' },
  Intermediate: { pill: 'bg-[#1a1a2a] border-[rgba(139,92,246,0.25)] text-[#a78bfa]' },
  Advanced:     { pill: 'bg-[#2a1a1a] border-[rgba(248,113,113,0.25)] text-[#f87171]' },
};

const courses = [
  {
    id: 1,
    title: 'Meme Linguistics 101',
    description: "Master the art of dank memes and understand what 'no cap fr fr' really means in modern digital communication.",
    category: 'Meme Culture',
    difficulty: 'Beginner',
    lessons: 8,
    bg: 'from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',
    accentBg: 'bg-[rgba(99,102,241,0.15)]',
    emoji: '😭',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.3) 0%, transparent 60%)',
    isNew: true,
  },
  {
    id: 2,
    title: 'Rizz Theory',
    description: 'Level up your social game and learn the science of charisma, Gen Z style. Unpack what it really means to have rizz.',
    category: 'Slang',
    difficulty: 'Intermediate',
    lessons: 10,
    bg: 'from-[#0c1a2e] via-[#1e3a5f] to-[#1e40af]',
    accentBg: 'bg-[rgba(59,130,246,0.15)]',
    emoji: '🔥',
    pattern: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.35) 0%, transparent 55%)',
    isNew: true,
  },
  {
    id: 3,
    title: 'Brainrot Dictionary',
    description: "Decode the viral vocabulary that's flooding your FYP — from 'skibidi' to 'gyatt' to 'sigma'. Never be lost again.",
    category: 'TikTok',
    difficulty: 'Beginner',
    lessons: 12,
    bg: 'from-[#1a0a2e] via-[#2d1b69] to-[#7c3aed]',
    accentBg: 'bg-[rgba(167,139,250,0.12)]',
    emoji: '🧠',
    pattern: 'radial-gradient(circle at 60% 40%, rgba(167,139,250,0.3) 0%, transparent 50%)',
    isNew: true,
  },
  {
    id: 4,
    title: 'Sigma Mindset',
    description: "Understand the sigma grindset and why everyone wants to be 'the lone wolf'. Explore the meme-ification of self-help culture.",
    category: 'Internet Culture',
    difficulty: 'Intermediate',
    lessons: 9,
    bg: 'from-[#0a1a0a] via-[#14532d] to-[#15803d]',
    accentBg: 'bg-[rgba(74,222,128,0.1)]',
    emoji: '🐺',
    pattern: 'radial-gradient(circle at 25% 60%, rgba(34,197,94,0.25) 0%, transparent 55%)',
    isNew: false,
  },
  {
    id: 5,
    title: 'TikTok Linguistics',
    description: "From 'slay' to 'understood the assignment' — dive deep into TikTok's fast-evolving dialect and how it spreads globally.",
    category: 'TikTok',
    difficulty: 'Beginner',
    lessons: 15,
    bg: 'from-[#1a0a0a] via-[#7f1d1d] to-[#dc2626]',
    accentBg: 'bg-[rgba(248,113,113,0.1)]',
    emoji: '📱',
    pattern: 'radial-gradient(circle at 70% 20%, rgba(239,68,68,0.3) 0%, transparent 55%)',
    isNew: true,
  },
  {
    id: 6,
    title: 'Skibidi Lore',
    description: 'Deep dive into the mysterious world of Skibidi Toilet and what it means for internet culture, storytelling and Gen Alpha.',
    category: 'Meme Culture',
    difficulty: 'Advanced',
    lessons: 7,
    bg: 'from-[#0a1a2a] via-[#0f3460] to-[#0284c7]',
    accentBg: 'bg-[rgba(14,165,233,0.1)]',
    emoji: '🚽',
    pattern: 'radial-gradient(circle at 50% 80%, rgba(14,165,233,0.3) 0%, transparent 50%)',
    isNew: false,
  },
  {
    id: 7,
    title: 'NPC Energy',
    description: "Why is everyone going NPC on social media? Unpack the 'non-playable character' trend and its commentary on modern life.",
    category: 'Internet Culture',
    difficulty: 'Intermediate',
    lessons: 11,
    bg: 'from-[#1a0a1a] via-[#4a044e] to-[#a21caf]',
    accentBg: 'bg-[rgba(217,70,239,0.1)]',
    emoji: '🤖',
    pattern: 'radial-gradient(circle at 40% 30%, rgba(217,70,239,0.3) 0%, transparent 55%)',
    isNew: true,
  },
  {
    id: 8,
    title: 'Bussin & W Takes',
    description: "Master essential Gen Alpha compliments: bussin, W take, hits different, and more. Learn to communicate peak approval.",
    category: 'Gen Z Language',
    difficulty: 'Beginner',
    lessons: 6,
    bg: 'from-[#1a1200] via-[#78350f] to-[#d97706]',
    accentBg: 'bg-[rgba(251,191,36,0.1)]',
    emoji: '✨',
    pattern: 'radial-gradient(circle at 60% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)',
    isNew: false,
  },
  {
    id: 9,
    title: 'Social Media Slang',
    description: "From 'ratio' to 'touch grass' — the complete guide to platform-specific slang across Twitter/X, Reddit, Instagram and beyond.",
    category: 'Social Media',
    difficulty: 'Intermediate',
    lessons: 13,
    bg: 'from-[#0f1a2a] via-[#1e3a5f] to-[#0e7490]',
    accentBg: 'bg-[rgba(34,211,238,0.1)]',
    emoji: '🌐',
    pattern: 'radial-gradient(circle at 35% 65%, rgba(34,211,238,0.25) 0%, transparent 55%)',
    isNew: true,
  },
];

const BarChartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="13" width="6" height="9" rx="1"/>
    <rect x="9" y="1" width="6" height="21" rx="1"/>
    <rect x="17" y="9" width="6" height="13" rx="1"/>
  </svg>
);

function CourseCard({ onClick, title, description, category, difficulty, lessons, bg, emoji, pattern, isNew }) {
  const diff = DIFFICULTY_COLOR[difficulty];
  return (
    <div
      onClick={onClick}
      className="group bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_28px_rgba(139,92,246,0.18)] hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail */}
      <div className={`relative h-[160px] bg-gradient-to-br ${bg} flex items-end overflow-hidden flex-shrink-0`}>
        <div className="absolute inset-0" style={{ background: pattern }} />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[3.5rem] drop-shadow-lg select-none">{emoji}</span>
        </div>
        {isNew && (
          <span className="absolute top-3 right-3 px-[0.6rem] py-[0.2rem] bg-[#92400e] text-[#fde68a] text-[0.72rem] font-extrabold rounded-full tracking-wide shadow-md">
            NEW!
          </span>
        )}
        <span className="absolute bottom-3 left-3 px-2 py-[0.2rem] bg-black/40 backdrop-blur-sm text-white/70 text-[0.7rem] font-semibold rounded-md">
          {lessons} lessons
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-[0.68rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">COURSE</span>
        <h3 className="text-[#f0eeff] font-bold text-[0.97rem] leading-snug m-0 group-hover:text-white transition-colors">{title}</h3>
        <p className="text-[#6b7280] text-[0.82rem] leading-relaxed m-0 line-clamp-2 flex-1">{description}</p>
        <div className={`mt-1 inline-flex items-center gap-1.5 border rounded-md px-2 py-[0.25rem] w-fit ${diff.pill}`}>
          <BarChartIcon />
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em]">{difficulty}</span>
        </div>
      </div>
    </div>
  );
}

function CourseModal({ course, onClose }) {
  const diff = DIFFICULTY_COLOR[course.difficulty];

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)] animate-[modalIn_0.2s_ease-out]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        {/* Header thumbnail */}
        <div className={`relative h-[180px] bg-gradient-to-br ${course.bg} overflow-hidden`}>
          <div className="absolute inset-0" style={{ background: course.pattern }} />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[4.5rem] drop-shadow-lg select-none">{course.emoji}</span>
          </div>
          {course.isNew && (
            <span className="absolute top-3 right-3 px-[0.6rem] py-[0.2rem] bg-[#92400e] text-[#fde68a] text-[0.72rem] font-extrabold rounded-full tracking-wide shadow-md">
              NEW!
            </span>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white/70 border border-white/10 cursor-pointer transition-all hover:bg-black/60 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[0.68rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">Course</span>
            <h2 className="text-[1.25rem] font-extrabold text-[#f0eeff] m-0 leading-snug">{course.title}</h2>
          </div>

          <p className="text-[#9ca3af] text-[0.88rem] leading-relaxed m-0">{course.description}</p>

          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 border rounded-md px-2 py-[0.25rem] ${diff.pill}`}>
              <BarChartIcon />
              <span className="text-[0.72rem] font-semibold uppercase tracking-[0.08em]">{course.difficulty}</span>
            </div>
            <span className="text-[0.78rem] text-[#6b6490] font-semibold bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.1)] px-[0.7rem] py-[0.25rem] rounded-md">
              📖 {course.lessons} lessons
            </span>
          </div>

          <button className="w-full py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.95rem] rounded-xl border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.4)] transition-all hover:opacity-90 hover:shadow-[0_6px_24px_rgba(139,92,246,0.55)] hover:-translate-y-px active:translate-y-0">
            Start Course →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

export default function LearnPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filtered = activeFilter === 'All'
    ? courses
    : courses.filter(c => c.category === activeFilter);

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 mb-1 flex items-center gap-3">
          <span>📋</span> All Courses
        </h1>
        <p className="text-[#6b6490] text-sm m-0">Explore Gen Alpha slang, meme culture, and internet lingo.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-7">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-[0.45rem] rounded-full text-sm font-semibold border cursor-pointer transition-all ${
              activeFilter === f
                ? 'bg-[rgba(139,92,246,0.2)] border-[rgba(139,92,246,0.5)] text-[#c4b5fd]'
                : 'bg-transparent border-[rgba(255,255,255,0.1)] text-[#6b6490] hover:border-[rgba(139,92,246,0.3)] hover:text-[#a78bfa]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Course grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 gap-5 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
          {filtered.map(course => (
            <CourseCard key={course.id} {...course} onClick={() => setSelectedCourse(course)} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
          <span className="text-5xl mb-4">🔍</span>
          <p className="text-lg font-semibold">No courses in this category yet.</p>
        </div>
      )}

      {/* Modal */}
      {selectedCourse && (
        <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
  );
}
