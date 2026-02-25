import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

// Maps a known category to visual properties; unknown categories get a default
const CATEGORY_VISUALS = {
  'Slang':            { emoji: '🔥', bg: 'from-[#0c1a2e] via-[#1e3a5f] to-[#1e40af]',   pattern: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.35) 0%, transparent 55%)' },
  'Meme Culture':     { emoji: '😭', bg: 'from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',   pattern: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.3) 0%, transparent 60%)' },
  'Social Media':     { emoji: '🌐', bg: 'from-[#0f1a2a] via-[#1e3a5f] to-[#0e7490]',   pattern: 'radial-gradient(circle at 35% 65%, rgba(34,211,238,0.25) 0%, transparent 55%)' },
  'Gen Z Language':   { emoji: '✨', bg: 'from-[#1a1200] via-[#78350f] to-[#d97706]',   pattern: 'radial-gradient(circle at 60% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)' },
  'TikTok':           { emoji: '📱', bg: 'from-[#1a0a0a] via-[#7f1d1d] to-[#dc2626]',   pattern: 'radial-gradient(circle at 70% 20%, rgba(239,68,68,0.3) 0%, transparent 55%)' },
  'Internet Culture': { emoji: '🤖', bg: 'from-[#1a0a1a] via-[#4a044e] to-[#a21caf]',   pattern: 'radial-gradient(circle at 40% 30%, rgba(217,70,239,0.3) 0%, transparent 55%)' },
};

const DEFAULT_VISUAL = {
  emoji: '📚',
  bg: 'from-[#0a1a2e] via-[#0f3460] to-[#1e40af]',
  pattern: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.3) 0%, transparent 60%)',
};

// Formats a lesson_id like "rizz-theory" or "MEME_LINGUISTICS_101" → "Rizz Theory" / "Meme Linguistics 101"
function formatLessonId(lessonId) {
  return lessonId
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function getVisuals(category) {
  return CATEGORY_VISUALS[category] ?? DEFAULT_VISUAL;
}

function CourseCard({ lesson, onClick, completed }) {
  const { emoji, bg, pattern } = getVisuals(lesson.category);
  const title = formatLessonId(lesson.lessonId);

  return (
    <div
      id={lesson.lessonId}
      onClick={onClick}
      className="group bg-[#0d0f18] border border-[rgba(255,255,255,0.07)] rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-[rgba(139,92,246,0.45)] hover:shadow-[0_0_28px_rgba(139,92,246,0.18)] hover:-translate-y-1 flex flex-col"
    >
      {/* Thumbnail — image if available, else gradient + emoji fallback */}
      <div className={`relative bg-gradient-to-br ${bg} flex-shrink-0 overflow-hidden h-[260px]`}>
        {lesson.image ? (
          <>
            <img src={lesson.image} alt={title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0d0f18] to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="relative h-[160px]">
            <div className="absolute inset-0" style={{ background: pattern }} />
            <div className="absolute inset-0 opacity-[0.06]"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[3.5rem] drop-shadow-lg select-none">{emoji}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content — pulled up over the image when image exists */}
      <div className={`relative p-4 flex flex-col gap-2 flex-1 ${lesson.image ? '-mt-7 bg-[#0d0f18] z-10' : ''}`}>
        {completed && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/15 border border-green-500/30 text-green-400 text-[0.62rem] font-bold tracking-wide uppercase rounded-md px-2 py-[0.2rem]">
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Completed
          </div>
        )}
        <span className="text-[0.68rem] text-[#4b5563] font-semibold tracking-[0.12em] uppercase">COURSE</span>
        <h3 className="text-[#f0eeff] font-bold text-[0.97rem] leading-snug m-0 group-hover:text-white transition-colors">{title}</h3>
        {lesson.description && (
          <p className="text-[#6b7280] text-[0.82rem] leading-relaxed m-0 line-clamp-2 flex-1">{lesson.description}</p>
        )}
        <span className="mt-auto text-[0.72rem] font-semibold text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-md px-2 py-[0.25rem] w-fit">
          {lesson.category}
        </span>
      </div>
    </div>
  );
}

function CourseModal({ lesson, onClose }) {
  const { emoji, bg, pattern } = getVisuals(lesson.category);
  const title = formatLessonId(lesson.lessonId);
  const navigate = useNavigate();

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
        className="relative w-full max-w-[420px] bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        {/* Header thumbnail — image if available, else gradient + emoji fallback */}
        <div className={`relative h-[180px] bg-gradient-to-br ${bg} overflow-hidden`}>
          {lesson.image ? (
            <img src={lesson.image} alt={title} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <>
              <div className="absolute inset-0" style={{ background: pattern }} />
              <div className="absolute inset-0 opacity-[0.06]"
                style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(255,255,255,0.5) 20px,rgba(255,255,255,0.5) 21px)' }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[4.5rem] drop-shadow-lg select-none">{emoji}</span>
              </div>
            </>
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
            <h2 className="text-[1.25rem] font-extrabold text-[#f0eeff] m-0 leading-snug">{title}</h2>
          </div>

          <span className="text-[0.78rem] font-semibold text-[#8b5cf6] bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] rounded-md px-[0.7rem] py-[0.25rem] w-fit">
            {lesson.category}
          </span>

          {lesson.description && (
            <p className="text-[#9ca3af] text-[0.88rem] leading-relaxed m-0">{lesson.description}</p>
          )}

          <button
            onClick={() => navigate(`/home/learn/${lesson.lessonId}`)}
            className="w-full py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white font-bold text-[0.95rem] rounded-xl border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.4)] transition-all hover:opacity-90 hover:shadow-[0_6px_24px_rgba(139,92,246,0.55)] hover:-translate-y-px active:translate-y-0"
          >
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
  const [lessons, setLessons]             = useState([]);
  const [completedLessons, setCompleted]  = useState(new Set());
  const [filters, setFilters]             = useState(['All']);
  const [activeFilter, setActiveFilter]   = useState('All');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const headers = { Authorization: `Bearer ${session.access_token}` };

        // Fetch lessons and progress records in parallel
        const [lessonsRes, progressRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/lessons`,       { headers }),
          fetch(`${API_URL}/api/v1/progress/me`,   { headers }),
        ]);

        if (!lessonsRes.ok) throw new Error('Failed to load lessons');
        const lessonsData  = await lessonsRes.json();
        setLessons(lessonsData);

        const uniqueCategories = ['All', ...new Set(lessonsData.map(l => l.category))];
        setFilters(uniqueCategories);

        // Build a Set of lessonIds where theta = 3.0 (fully mastered, 100/100)
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const done = new Set();
          for (const p of progressData) {
            try {
              const state = JSON.parse(p.adaptiveScore || '{}');
              if (state.theta >= 3.0) done.add(p.lessonId);
            } catch { /* skip malformed record */ }
          }
          setCompleted(done);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filtered = activeFilter === 'All'
    ? lessons
    : lessons.filter(l => l.category === activeFilter);

  return (
    <div className="w-full min-h-screen px-8 py-8 overflow-auto sm:px-4 sm:py-6">

      {/* Header */}
      <div className="mb-7">
        <h1 className="text-[1.8rem] font-extrabold text-[#f0eeff] m-0 mb-1 flex items-center gap-3">
          All Courses
        </h1>
        <p className="text-[#6b6490] text-sm m-0">Explore Gen Alpha slang, meme culture, and internet lingo.</p>
      </div>

      {/* Filter tabs — built dynamically from lesson categories */}
      <div className="flex gap-2 flex-wrap mb-7">
        {filters.map(f => (
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

      {/* States */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-[#6b6490]">
          <p className="text-lg font-semibold animate-pulse">Loading courses...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center py-20 text-red-400">
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}

      {/* Course grid */}
      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="grid grid-cols-3 gap-5 xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1">
            {filtered.map(lesson => (
              <CourseCard
                key={lesson.lessonId}
                lesson={lesson}
                completed={completedLessons.has(lesson.lessonId)}
                onClick={() => setSelectedLesson(lesson)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-[#4b4870]">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-lg font-semibold">No courses in this category yet.</p>
          </div>
        )
      )}

      {/* Modal */}
      {selectedLesson && (
        <CourseModal lesson={selectedLesson} onClose={() => setSelectedLesson(null)} />
      )}
    </div>
  );
}
