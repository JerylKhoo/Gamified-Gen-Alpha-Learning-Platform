import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import characterImg from '../assets/trippiTroppi.png';
import LoadingScreen from '../components/LoadingScreen';

const badgeScrollStyle = `
  .badge-scroll::-webkit-scrollbar { width: 4px; }
  .badge-scroll::-webkit-scrollbar-track { background: transparent; }
  .badge-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.4); border-radius: 99px; }
  .badge-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.7); }
`;

const API_URL = import.meta.env.VITE_API_URL;

// Format lessonId → readable title (mirrors LearnPage.jsx)
function formatLessonId(lessonId) {
  return lessonId
    .replace(/[-_.]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

// Parse JSONB user.points field — handle empty {}, number, or structured object
function parseXP(raw) {
  if (raw == null) return 0;
  try {
    const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (typeof p === 'number') return p;
    return p.xp ?? p.total ?? p.value ?? p.score ?? 0;
  } catch {
    return 0;
  }
}

function xpToLevel(xp) {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

function levelToRank(level) {
  if (level >= 10) return '🏆 GOAT';
  if (level >= 7)  return '⭐ Pro';
  if (level >= 4)  return '🌟 Rising Star';
  return '🎮 Rookie';
}

// ── Edit Profile Modal ──────────────────────────────────────────────────────
function EditProfileModal({ userData, onClose, onSave }) {
  const [name, setName]             = useState(userData?.name || '');
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected]     = useState(userData?.profilePic || null);
  const [saving, setSaving]         = useState(false);
  const [loadingChars, setLoadingChars] = useState(true);
  const [saveError, setSaveError]   = useState(null);

  useEffect(() => {
    async function fetchChars() {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/v1/profilepics`, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const urls = json.data ?? [];
        setCharacters(urls.map(url => ({ name: url.split('/').pop(), url })));
      }
      setLoadingChars(false);
    }
    fetchChars();

    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const body = {};
      if (name.trim()) body.name = name.trim();
      if (selected)    body.profilePic = selected;

      const res = await fetch(`${API_URL}/api/v1/users/${session.user.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        const saved = json.data;
        onSave({
          ...saved,
          ...(name.trim() && { name: name.trim() }),
          ...(selected && { profilePic: selected }),
        });
        onClose();
      } else {
        const errText = await res.text();
        console.error('Profile update failed:', res.status, errText);
        setSaveError(`Save failed (${res.status}): ${errText || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Update profile error:', err);
      setSaveError(`Save failed: ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const previewSrc = selected || userData?.profilePic || characterImg;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-[#0d0f18] border border-[rgba(139,92,246,0.25)] rounded-[20px] p-6 w-full max-w-[560px] mx-4 shadow-[0_0_60px_rgba(139,92,246,0.2)]"
        style={{ animation: 'modalIn 0.18s cubic-bezier(0.2,0,0.2,1)' }}
      >
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: scale(0.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);   }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[#f0eeff] font-extrabold text-lg m-0">Edit Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[rgba(255,255,255,0.05)] text-[#7c6ea8] hover:text-[#f0eeff] hover:bg-[rgba(139,92,246,0.2)] transition-all cursor-pointer border-none text-lg leading-none"
          >×</button>
        </div>

        {/* Name input */}
        <label className="block text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em] mb-1">
          Display Name
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your name…"
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(139,92,246,0.18)] rounded-[10px] px-4 py-2 text-[#f0eeff] text-sm placeholder-[#5a5278] outline-none focus:border-[rgba(139,92,246,0.55)] focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all mb-5"
        />

        {/* Character picker */}
        <p className="text-[0.75rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em] m-0 mb-3">
          Choose Character
        </p>
        <div className="flex gap-4">
          {/* Large preview */}
          <div className="flex-shrink-0 w-[130px] h-[130px] bg-[rgba(139,92,246,0.07)] border border-[rgba(139,92,246,0.2)] rounded-[14px] flex items-center justify-center">
            <img
              src={previewSrc}
              alt="Preview"
              className="w-[100px] h-[100px] object-contain drop-shadow-lg"
              onError={e => { e.currentTarget.src = characterImg; }}
            />
          </div>

          {/* Character grid */}
          <div className="flex-1 min-h-0">
            {loadingChars ? (
              <p className="text-[#5a5278] text-sm">Loading characters…</p>
            ) : characters.length === 0 ? (
              <p className="text-[#5a5278] text-sm">No characters found.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto styled-scroll pr-1">
                {characters.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelected(c.url)}
                    className={`w-full aspect-square rounded-[10px] bg-[rgba(255,255,255,0.04)] border-2 flex items-center justify-center p-1 cursor-pointer transition-all hover:border-[#8b5cf6] hover:bg-[rgba(139,92,246,0.1)] ${
                      selected === c.url
                        ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.18)] shadow-[0_0_10px_rgba(139,92,246,0.35)]'
                        : 'border-[rgba(139,92,246,0.15)]'
                    }`}
                  >
                    <img
                      src={c.url}
                      alt={c.name}
                      className="w-full h-full object-contain"
                      onError={e => { e.currentTarget.src = characterImg; }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {saveError && (
          <p className="mt-4 mb-0 text-[0.78rem] text-[#f87171] bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.25)] rounded-[8px] px-3 py-2">
            {saveError}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[10px] bg-[rgba(255,255,255,0.05)] border border-[rgba(139,92,246,0.18)] text-[#9090b0] text-sm font-bold cursor-pointer hover:bg-[rgba(255,255,255,0.09)] hover:text-[#f0eeff] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white border-none rounded-[10px] text-sm font-extrabold cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

const cardCls =
  "bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.18)] rounded-[20px] p-[1.6rem] backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.1)] before:content-[''] before:absolute before:inset-0 before:rounded-[20px] before:bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06)_0%,transparent_65%)] before:pointer-events-none";

const VISUALS = [
  { bg: 'from-[#0c1a2e] via-[#1e3a5f] to-[#1e40af]',   pattern: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.35) 0%, transparent 55%)' },
  { bg: 'from-[#1e1b4b] via-[#312e81] to-[#4c1d95]',   pattern: 'radial-gradient(circle at 70% 30%, rgba(139,92,246,0.3) 0%, transparent 60%)' },
  { bg: 'from-[#0f1a2a] via-[#1e3a5f] to-[#0e7490]',   pattern: 'radial-gradient(circle at 35% 65%, rgba(34,211,238,0.25) 0%, transparent 55%)' },
  { bg: 'from-[#1a1200] via-[#78350f] to-[#d97706]',   pattern: 'radial-gradient(circle at 60% 50%, rgba(251,191,36,0.3) 0%, transparent 50%)' },
  { bg: 'from-[#1a0a0a] via-[#7f1d1d] to-[#dc2626]',   pattern: 'radial-gradient(circle at 70% 20%, rgba(239,68,68,0.3) 0%, transparent 55%)' },
  { bg: 'from-[#1a0a1a] via-[#4a044e] to-[#a21caf]',   pattern: 'radial-gradient(circle at 40% 30%, rgba(217,70,239,0.3) 0%, transparent 55%)' },
];

function getVisual(courseId) {
  const hash = courseId ? [...courseId].reduce((acc, c) => acc + c.charCodeAt(0), 0) : 0;
  return VISUALS[hash % VISUALS.length];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function resolveBadgeIcon(icon) {
  if (!icon) return null;
  if (icon.startsWith('http')) return icon;
  return `${SUPABASE_URL}/storage/v1/object/public/badges/${icon}`;
}

function BadgesSection({ badges = [] }) {
  const [hoveredBadge, setHoveredBadge] = useState(null); // { badge, x, y }

  return (
    <div className="w-full flex-1 flex flex-col">
      {badges.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.12)] rounded-[16px]">
          <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Badges Earned</h2>
          <span className="text-3xl">🏅</span>
          <p className="text-[#6b6490] text-sm m-0">Complete courses to earn badges.</p>
        </div>
      ) : (
        <>
        <div className="flex-1 flex flex-col gap-3 p-4 bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.12)] rounded-[16px]">
          <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] m-0">Badges Earned</h2>
          <style>{badgeScrollStyle}</style>
          <div className="badge-scroll overflow-y-auto flex-1 grid grid-cols-2 gap-3 justify-items-center" style={{ maxHeight: '140px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(139,92,246,0.4) transparent' }}>
          {badges.map(b => (
            <div
              key={b.badgeId}
              className="flex flex-col items-center gap-2 w-[72px] cursor-default"
              onMouseEnter={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHoveredBadge({ badge: b, x: rect.left + rect.width / 2, y: rect.bottom });
              }}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              {b.icon ? (
                <img src={resolveBadgeIcon(b.icon)} alt={b.badgeId} className="w-14 h-14 object-contain drop-shadow-md" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-2xl">
                  🏅
                </div>
              )}
              <span className="text-[0.65rem] text-[#a78bfa] font-semibold text-center leading-tight line-clamp-2">{b.badgeId}</span>
            </div>
          ))}
        </div>
        {/* Fixed badge preview portal */}
        </div>
        {hoveredBadge && (
          <div
            className="pointer-events-none fixed z-[9999] flex flex-col items-center"
            style={{ left: hoveredBadge.x, top: hoveredBadge.y + 8, transform: 'translate(-50%, 0)' }}
          >
            <div className="w-3 h-3 bg-[#1a1530] border-l border-t border-[rgba(139,92,246,0.3)] rotate-45 mb-[-6px]" />
            <div className="bg-[#1a1530] border border-[rgba(139,92,246,0.3)] rounded-[12px] p-3 shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex flex-col items-center gap-2">
              {hoveredBadge.badge.icon ? (
                <img src={resolveBadgeIcon(hoveredBadge.badge.icon)} alt={hoveredBadge.badge.badgeId} className="w-20 h-20 object-contain drop-shadow-lg" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-4xl">🏅</div>
              )}
              <span className="text-[0.78rem] text-[#e0d9ff] font-semibold text-center max-w-[100px]">{hoveredBadge.badge.badgeId}</span>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
}

function CourseProgressSection({ courses, earnedBadges, navigate }) {
  if (courses.length === 0) return null;

  const hasStarted = courses.some(c => c.started && c.progress < 100);

  if (!hasStarted) {
    return (
      <div className="w-full flex-1 flex flex-col">
        <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] mb-3">Ongoing Courses</h2>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-10 bg-[rgba(255,255,255,0.02)] border border-[rgba(139,92,246,0.12)] rounded-[16px]">
          <span className="text-4xl">📚</span>
          <p className="text-[#6b6490] text-sm m-0">You have no ongoing courses.</p>
          <button
            onClick={() => navigate('/learn')}
            className="px-6 py-2 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white text-sm font-bold rounded-xl border-none cursor-pointer shadow-[0_4px_18px_rgba(139,92,246,0.4)] transition-all hover:opacity-90 hover:-translate-y-px active:translate-y-0"
          >
            Browse Courses →
          </button>
        </div>
      </div>
    );
  }

  // Associate badges with courses: badge is linked if its badgeId contains the courseId (or vice versa)
  function getBadgesForCourse(courseId) {
    return Object.values(earnedBadges).filter(b =>
      b.badgeId.toLowerCase().includes(courseId.toLowerCase()) ||
      courseId.toLowerCase().includes(b.badgeId.toLowerCase())
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col">
      <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] mb-3">Ongoing Courses</h2>
      <div className="grid grid-cols-1 gap-3">
        {courses.filter(c => c.started && c.progress < 100).map(c => {
          const badges = getBadgesForCourse(c.courseId);
          const { bg, pattern } = getVisual(c.courseId);
          return (
            <div
              key={c.courseId}
              onClick={() => navigate(`/course/${encodeURIComponent(c.courseId)}`)}
              className="flex items-center gap-4 px-5 py-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.15)] rounded-[14px] cursor-pointer transition-all hover:border-[rgba(139,92,246,0.35)] hover:bg-[rgba(139,92,246,0.06)]"
            >
              {/* Thumbnail */}
              <CourseThumb courseId={c.courseId} image={c.image} bg={bg} pattern={pattern} />

              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[0.92rem] font-bold text-[#e0d9ff] truncate">{c.name}</span>
                  <span className="text-[0.75rem] font-extrabold text-[#a78bfa] flex-shrink-0">{c.progress}%</span>
                </div>
                <div className="h-[6px] bg-[rgba(139,92,246,0.12)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full transition-all"
                    style={{ width: `${c.progress}%` }}
                  />
                </div>
                {!c.started && (
                  <span className="text-[0.7rem] text-[#5a5278] font-medium">Not started</span>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {badges.length > 0 ? (
                  badges.map(b => (
                    <div key={b.badgeId} title={b.badgeId} className="flex flex-col items-center gap-1">
                      {b.icon ? (
                        <img src={b.icon} alt={b.badgeId} className="w-9 h-9 object-contain drop-shadow-md" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-white text-base">
                          🏅
                        </div>
                      )}
                      <span className="text-[0.6rem] text-[#a78bfa] font-semibold text-center max-w-[56px] truncate">{b.badgeId}</span>
                    </div>
                  ))
                ) : c.progress >= 100 ? (
                  <div className="w-9 h-9 rounded-full bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] flex items-center justify-center text-base" title="Completed">
                    ✅
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] flex items-center justify-center" title="Badge locked">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b4870" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CourseThumb({ courseId, image, bg, pattern }) {
  const [imgOk, setImgOk] = useState(!!image);
  return (
    <div className={`w-12 h-12 rounded-[10px] flex-shrink-0 bg-gradient-to-br ${bg} overflow-hidden relative`}>
      {imgOk ? (
        <img src={image} alt={courseId} onError={() => setImgOk(false)} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: pattern }} />
      )}
    </div>
  );
}

function JumpBackIn({ course, navigate }) {
  const { bg, pattern } = getVisual(course.courseId);
  const [imgOk, setImgOk] = useState(!!course.image);

  return (
    <div className="w-full">
      <h2 className="text-[1.1rem] font-extrabold text-[#f0eeff] mb-3">
        {course.jumpState === 'in-progress' ? 'Jump back in' : course.jumpState === 'all-completed' ? 'Continue Learning' : 'Start Learning'}
      </h2>
      <div
        className="relative rounded-[20px] overflow-hidden h-[200px] bg-[#12111f] border border-[rgba(139,92,246,0.15)] cursor-pointer group flex"
        onClick={() => navigate(`/course/${encodeURIComponent(course.courseId)}`)}
      >
        {/* Left: content */}
        <div className="flex flex-col justify-between p-6 flex-1 min-w-0 z-10">
          {/* Progress bar */}
          <div className="flex items-center gap-3 w-full max-w-[280px]">
            <div className="flex-1 h-[6px] bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] rounded-full transition-all"
                style={{ width: `${course.progress}%` }} />
            </div>
            <span className="text-[#a78bfa] text-[0.75rem] font-bold">{course.progress}%</span>
          </div>

          {/* Course info */}
          <div className="flex flex-col gap-3">
            <div>
              <span className="text-[#6b6490] text-[0.68rem] font-semibold tracking-[0.12em] uppercase">Course</span>
              <h3 className="text-[#f0eeff] text-[1.5rem] font-extrabold m-0 leading-tight">
                {course.name}
              </h3>
            </div>
            <button
              onClick={e => { e.stopPropagation(); navigate(`/course/${encodeURIComponent(course.courseId)}`); }}
              className="w-fit px-5 py-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white text-sm font-bold rounded-xl border-none cursor-pointer transition-all shadow-[0_4px_18px_rgba(139,92,246,0.5)]"
            >
              {course.jumpState === 'in-progress' ? 'Continue Learning' : 'Start Course'}
            </button>
          </div>
        </div>

        {/* Right: image */}
        <div className={`w-[45%] flex-shrink-0 relative bg-gradient-to-br ${bg}`}>
          {imgOk ? (
            <img src={course.image} alt={course.name} onError={() => setImgOk(false)}
              className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0" style={{ background: pattern }} />
          )}
          {/* Fade edge toward content */}
          <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#12111f] to-transparent" />
        </div>
      </div>
    </div>
  );
}

const SEEN_BADGES_KEY = 'seen_badge_ids';

function getSeenBadgeIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function saveSeenBadgeIds(ids) {
  localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify([...ids]));
}

export default function HomePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const toastFired = useRef(false);
  const [userData,      setUserData]      = useState(null);
  const [courses,       setCourses]       = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [earnedBadges,  setEarnedBadges]  = useState({});   // badgeId → Badge
  const [loading,       setLoading]       = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [streakData,    setStreakData]     = useState(null);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const userId  = session.user.id;

        // Fetch everything in parallel
        const [userRes, coursesRes, progressRes, streakRes, badgesRes, userBadgesRes, courseProgressRes, coursesWithModulesRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/users/${userId}`,        { headers }),
          fetch(`${API_URL}/api/v1/courses`,                { headers }),
          fetch(`${API_URL}/api/v1/quiz-progress/me`,       { headers }),
          fetch(`${API_URL}/api/v1/streaks/me`,             { headers }),
          fetch(`${API_URL}/api/v1/badges`,                 { headers }),
          fetch(`${API_URL}/api/v1/user-badges/me`,         { headers }),
          fetch(`${API_URL}/api/v1/course-progress/me`,     { headers }),
          fetch(`${API_URL}/api/v1/courses-with-modules`,   { headers }),
        ]);

        const user               = userRes.ok               ? (await userRes.json()).data               : null;
        const allCourses         = coursesRes.ok            ? (await coursesRes.json()).data            ?? [] : [];
        const progress           = progressRes.ok           ? (await progressRes.json()).data           ?? [] : [];
        const streak             = streakRes.ok             ? (await streakRes.json()).data             : null;
        const allBadges          = badgesRes.ok             ? (await badgesRes.json()).data             ?? [] : [];
        const userBadges         = userBadgesRes.ok         ? (await userBadgesRes.json()).data         ?? [] : [];
        const courseProgress     = courseProgressRes.ok     ? (await courseProgressRes.json()).data     ?? [] : [];
        const coursesWithModules = coursesWithModulesRes.ok ? (await coursesWithModulesRes.json()).data ?? [] : [];

        // badgeId → full badge details, filtered to only earned ones
        const badgeDetailsMap = Object.fromEntries(allBadges.map(b => [b.badgeId, b]));
        const earned = {};
        for (const ub of userBadges) {
          if (badgeDetailsMap[ub.badgeId]) earned[ub.badgeId] = badgeDetailsMap[ub.badgeId];
        }
        setEarnedBadges(earned);

        // Badge unlock notifications — only fire once per session
        if (!toastFired.current) {
          toastFired.current = true;
          const seenIds = getSeenBadgeIds();
          const newBadgeIds = Object.keys(earned).filter(id => !seenIds.has(id));
          if (newBadgeIds.length > 0) {
            newBadgeIds.forEach((id, i) => {
              const badge = earned[id];
              setTimeout(() => {
                addToast({
                  icon: resolveBadgeIcon(badge.icon) || '🏅',
                  title: 'Badge Unlocked!',
                  description: badge.badgeId,
                  duration: 6000,
                });
              }, i * 800); // stagger multiple toasts
            });
            // Mark all earned badges as seen
            const allSeen = new Set([...seenIds, ...Object.keys(earned)]);
            saveSeenBadgeIds(allSeen);
          }
        }

        setStreakData(streak);

        setUserData(user);

        // courseId → total module count
        const totalModulesMap = Object.fromEntries(
          coursesWithModules.map(c => [c.courseId, c.modules?.length ?? 0])
        );

        // courseId → completed module count
        const completedModulesMap = {};
        for (const p of courseProgress) {
          completedModulesMap[p.courseId] = (completedModulesMap[p.courseId] ?? 0) + 1;
        }

        // Progress = (completedModules + quizCompleted) / (totalModules + 1)
        const quizStartedIds   = new Set(progress.map(p => p.courseId));
        const moduleStartedIds = new Set(courseProgress.map(p => p.courseId));
        const startedIds       = new Set([...quizStartedIds, ...moduleStartedIds]);

        // Quiz is only "done" when the adaptive system has exhausted all questions (theta === 3.0)
        const quizCompletedIds = new Set(
          progress.filter(p => {
            try {
              const score = typeof p.adaptiveScore === 'string' ? JSON.parse(p.adaptiveScore) : p.adaptiveScore;
              return score?.theta >= 3.0;
            } catch { return false; }
          }).map(p => p.courseId)
        );

        const moduleProgress = (courseId) => {
          const total = totalModulesMap[courseId] ?? 0;
          if (total === 0) return 0;
          const completedMods = completedModulesMap[courseId] ?? 0;
          const quizDone = quizCompletedIds.has(courseId) ? 1 : 0;
          return Math.round(((completedMods + quizDone) / (total + 1)) * 100);
        };

        const sorted = [
          ...allCourses.filter(c => startedIds.has(c.courseId)),
          ...allCourses.filter(c => !startedIds.has(c.courseId)),
        ];
        const courseList = sorted.map(c => ({
          courseId: c.courseId,
          name:     formatLessonId(c.courseId),
          image:    c.image ?? null,
          progress: moduleProgress(c.courseId),
          started:  startedIds.has(c.courseId),
        }));
        setCourses(courseList);

        // Determine Jump Back In state
        const inProgressCourses = courseList.filter(c => c.started && c.progress < 100);
        const notStartedCourses = courseList.filter(c => !c.started);

        let jumpCourse = null;
        let jumpState  = 'not-started';

        if (inProgressCourses.length > 0) {
          // State 2: show in-progress course with highest progress
          jumpCourse = inProgressCourses.reduce((best, c) => c.progress > best.progress ? c : best);
          jumpState  = 'in-progress';
        } else if (startedIds.size > 0) {
          // State 3: all started courses are completed, show a not-yet-started course
          const fallback = notStartedCourses[0] ?? courseList[0] ?? null;
          jumpCourse = fallback;
          jumpState  = 'all-completed';
        } else {
          // State 1: nothing started, show first available course
          jumpCourse = courseList[0] ?? null;
          jumpState  = 'not-started';
        }

        if (jumpCourse) {
          setCurrentCourse({ ...jumpCourse, jumpState });
        }
      } catch (err) {
        console.error('HomePage fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const xp    = parseXP(userData?.points);
  const level = xpToLevel(xp);
  const rank  = levelToRank(level);

  if (loading) return <LoadingScreen />;

  return (
    <main className="h-full flex flex-col items-center p-7 overflow-auto max-sm:p-4">
      {showEditModal && (
        <EditProfileModal
          userData={userData}
          onClose={() => setShowEditModal(false)}
          onSave={updated => setUserData(updated)}
        />
      )}
      <div className="flex flex-col gap-[1.1rem] my-auto w-fit min-w-[70%] max-lg:min-w-[90%] max-sm:w-full">

        {/* ── Profile Card + Badges ── */}
        <div className="flex gap-5 max-md:flex-col">
          {/* Profile Card */}
          <div className={`${cardCls} flex items-center gap-7 flex-1 min-w-0 !p-4`}>
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="relative">
                <img
                  src={userData?.profilePic || characterImg}
                  alt="Character"
                  className="w-[90px] h-[90px] object-contain drop-shadow-lg select-none"
                  onError={e => { e.currentTarget.src = characterImg; }}
                />
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white text-[0.65rem] font-extrabold px-[7px] py-[2px] rounded-[20px] border-[1.5px] border-[#0d0b1e]">
                  Lv.{level}
                </div>
              </div>
              <button onClick={() => setShowEditModal(true)} className="flex items-center gap-1 px-3 py-[0.25rem] rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#a78bfa] text-[0.7rem] font-bold cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.28)] hover:text-[#ede9fe]">
                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/>
                </svg>
                Edit
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[#7c6ea8] m-0">Welcome back,</p>
              <h2 className="text-[2.2rem] font-extrabold text-[#f0eeff] m-0 -tracking-[0.5px]">
                {userData?.name ?? '...'}
              </h2>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0 ml-auto max-sm:hidden">
              {/* XP Badge */}
              <span className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(251,146,60,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)] flex items-center justify-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><defs><linearGradient id="xpStarGrad" x1="187.9" x2="324.1" y1="138.1" y2="373.9" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fcd966"/><stop offset=".5" stopColor="#fcd966"/><stop offset="1" stopColor="#fccd34"/></linearGradient></defs><path fill="url(#xpStarGrad)" stroke="#fcd34d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="m105.7 263.5l107.5 29.9a7.9 7.9 0 0 1 5.4 5.4l29.9 107.5a7.8 7.8 0 0 0 15 0l29.9-107.5a7.9 7.9 0 0 1 5.4-5.4l107.5-29.9a7.8 7.8 0 0 0 0-15l-107.5-29.9a7.9 7.9 0 0 1-5.4-5.4l-29.9-107.5a7.8 7.8 0 0 0-15 0l-29.9 107.5a7.9 7.9 0 0 1-5.4 5.4l-107.5 29.9a7.8 7.8 0 0 0 0 15Z"><animateTransform additive="sum" attributeName="transform" calcMode="spline" dur="6s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="rotate" values="-15 256 256; 15 256 256; -15 256 256"/><animate attributeName="opacity" dur="6s" values="1; .75; 1; .75; 1; .75; 1"/></path></svg>
                {xp} XP
              </span>
              {/* Rank Badge */}
              <span className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border border-[rgba(139,92,246,0.3)] text-center">
                {rank}
              </span>
              {/* Streak Badge */}
              <span
                title={`Longest streak: ${streakData?.longestStreak ?? 0} days`}
                className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(251,146,60,0.15)] text-[#fb923c] border border-[rgba(251,146,60,0.35)] flex items-center justify-center gap-1"
              >
                🔥 {streakData?.currentStreak ?? 0} day{(streakData?.currentStreak ?? 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Badges Card */}
          <div className="w-[260px] flex-shrink-0 max-md:w-full flex flex-col">
            <BadgesSection badges={Object.values(earnedBadges)} />
          </div>
        </div>

        {/* ── Jump Back In ── */}
        {currentCourse && <JumpBackIn course={currentCourse} navigate={navigate} />}

        {/* ── Ongoing Courses ── */}
        <CourseProgressSection courses={courses} earnedBadges={earnedBadges} navigate={navigate} />

      </div>

    </main>
  );
}
