import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import characterImg from '../assets/trippiTroppi.png';

const API_URL = import.meta.env.VITE_API_URL;

// Convert adaptive theta (-3 to 3, where 3.0 = fully mastered) → 0-100%
function thetaToPercent(theta) {
  if (theta == null || typeof theta !== 'number') return 0;
  return Math.round(Math.max(0, Math.min(100, ((theta + 3) / 6) * 100)));
}

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

// ActivityChart — one data point per started course, sorted ascending to show growth
function ActivityChart({ data }) {
  const w = 340, h = 130, px = 12, py = 16;
  const pts = !data || data.length === 0 ? [0, 0]
            : data.length === 1           ? [0, data[0]]
            : data;
  const minV  = Math.min(...pts);
  const maxV  = Math.max(...pts);
  const range = maxV - minV || 1;
  const xs = pts.map((_, i) => px + (i / (pts.length - 1)) * (w - px * 2));
  const ys = pts.map(v => py + (1 - (v - minV) / range) * (h - py * 2));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const area = `${line} L${xs.at(-1)},${h} L${xs[0]},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={line} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
      {xs.map((x, i) => (
        <circle key={i} cx={x} cy={ys[i]} r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? '#a78bfa' : '#8b5cf6'}
          stroke={i === pts.length - 1 ? '#fff' : 'none'} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const cardCls =
  "bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.18)] rounded-[20px] p-[1.6rem] backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.1)] before:content-[''] before:absolute before:inset-0 before:rounded-[20px] before:bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06)_0%,transparent_65%)] before:pointer-events-none";

const cardTitleCls = "text-[0.8rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em] m-0 mb-4";

const stripePositions = [15, 28, 41, 54, 67, 80];

export default function HomePage() {
  const navigate = useNavigate();
  const [userData,      setUserData]      = useState(null);
  const [courses,       setCourses]       = useState([]);
  const [chartData,     setChartData]     = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const headers = { Authorization: `Bearer ${session.access_token}` };
        const userId  = session.user.id;

        // Fetch user profile, all lessons, and user's progress in parallel
        const [userRes, lessonsRes, progressRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/users/${userId}`, { headers }),
          fetch(`${API_URL}/api/v1/lessons`,          { headers }),
          fetch(`${API_URL}/api/v1/progress/me`,      { headers }),
        ]);

        const user     = userRes.ok     ? await userRes.json()     : null;
        const lessons  = lessonsRes.ok  ? await lessonsRes.json()  : [];
        const progress = progressRes.ok ? await progressRes.json() : [];

        setUserData(user);

        // lessonId → lesson lookup
        const lessonMap = Object.fromEntries(lessons.map(l => [l.lessonId, l]));

        // lessonId → theta from progress records
        const thetaMap = {};
        for (const p of progress) {
          try {
            const state = JSON.parse(p.adaptiveScore || '{}');
            thetaMap[p.lessonId] = typeof state.theta === 'number' ? state.theta : -3;
          } catch {
            thetaMap[p.lessonId] = -3;
          }
        }

        // Courses list: started lessons sorted by progress descending
        const startedIds = progress.map(p => p.lessonId).filter(id => lessonMap[id]);
        let courseList;
        if (startedIds.length > 0) {
          courseList = startedIds.map(lid => ({
            lessonId: lid,
            name:     formatLessonId(lid),
            category: lessonMap[lid].category,
            progress: thetaToPercent(thetaMap[lid]),
          })).sort((a, b) => b.progress - a.progress);
        } else {
          // No progress yet — show all available lessons at 0%
          courseList = lessons.slice(0, 7).map(l => ({
            lessonId: l.lessonId,
            name:     formatLessonId(l.lessonId),
            category: l.category,
            progress: 0,
          }));
        }
        setCourses(courseList);

        // Chart data: full score history across all lessons, in order answered
        const history = progress.flatMap(p => {
          try { return JSON.parse(p.adaptiveHistory || '[]'); }
          catch { return []; }
        });
        setChartData(history.length > 0 ? history : [0]);

        // Current course: highest in-progress (>0% and <100%) lesson
        const active =
          courseList.find(c => c.progress > 0 && c.progress < 100) ??
          courseList[0] ??
          null;
        setCurrentCourse(active);

        // Fetch question count for the current course
        if (active) {
          const qRes = await fetch(
            `${API_URL}/api/v1/questions/lesson/${active.lessonId}`,
            { headers }
          );
          if (qRes.ok) {
            const questions = await qRes.json();
            setQuestionCount(questions.length);
          }
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

  if (loading) {
    return (
      <main className="flex items-center justify-center p-7 min-h-[88vh]">
        <p className="text-[#6b6490] text-lg font-semibold animate-pulse">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center p-7 overflow-auto max-sm:p-4">
      <div className="h-[88vh] grid grid-cols-[auto_auto] grid-rows-[auto_1fr] gap-[1.1rem] w-fit min-w-[70%] max-lg:min-w-[90%] max-sm:h-auto max-sm:w-full max-sm:flex max-sm:flex-col">

        {/* ── Profile Card ── */}
        <div className={`${cardCls} col-start-1 row-start-1 flex items-center gap-7`}>
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
            <button className="flex items-center gap-1 px-3 py-[0.25rem] rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] text-[#a78bfa] text-[0.7rem] font-bold cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.28)] hover:text-[#ede9fe]">
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
            <button className="mt-1 self-start px-5 py-2 bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border border-[rgba(139,92,246,0.3)] rounded-[10px] text-sm font-bold cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.28)] hover:text-[#ede9fe] hover:shadow-[0_0_14px_rgba(139,92,246,0.25)]">
              View Stats →
            </button>
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
          </div>
        </div>

        {/* ── My Courses Card ── */}
        <div className={`${cardCls} col-start-2 row-start-1 flex flex-col`}>
          <h3 className={cardTitleCls}>My Courses</h3>
          {courses.length === 0 ? (
            <div className="flex flex-col gap-2 flex-1 justify-center items-start">
              <p className="text-[#5a5278] text-sm m-0">No courses started yet.</p>
              <button
                onClick={() => navigate('/home/learn')}
                className="text-[#a78bfa] text-sm font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Explore courses →
              </button>
            </div>
          ) : (
            <ul className="styled-scroll list-none m-0 p-0 flex flex-col gap-[0.55rem] overflow-y-auto max-h-[220px] pr-1">
              {courses.map((c, i) => (
                <li
                  key={i}
                  onClick={() => navigate(`/home/learn/${c.lessonId}`)}
                  className="flex flex-col gap-[0.4rem] px-[0.9rem] py-[0.6rem] bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.12)] rounded-[10px] cursor-pointer transition-all hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-[0.1rem]">
                      <span className="text-[0.87rem] font-bold text-[#e0d9ff] leading-tight">{c.name}</span>
                      <span className="text-[0.7rem] text-[#6b6490] font-medium">{c.category}</span>
                    </div>
                    <span className="text-[0.75rem] font-extrabold text-[#a78bfa] flex-shrink-0 ml-3">{c.progress}%</span>
                  </div>
                  <div className="h-[5px] bg-[rgba(139,92,246,0.12)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full transition-all"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Activity + Course Card ── */}
        <div className={`${cardCls} col-span-full row-start-2 grid grid-cols-[1.35fr_1fr] gap-[1.1rem] items-stretch max-sm:grid-cols-1`}>

          {/* Left: XP Chart */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cardTitleCls}>XP Progress</h3>
              <span className="text-[0.72rem] text-[#5a5278] font-semibold">All Questions</span>
            </div>
            <div className="flex-1 min-h-[120px]">
              <ActivityChart data={chartData} />
            </div>
          </div>

          {/* Right: Current Course */}
          {currentCourse ? (
            <div className="flex flex-col justify-center gap-[1.1rem] border-l border-[rgba(139,92,246,0.15)] pl-[1.1rem] max-sm:border-l-0 max-sm:border-t max-sm:border-[rgba(139,92,246,0.15)] max-sm:pl-0 max-sm:pt-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[0.72rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Current Course</span>
                  <span className="text-[0.82rem] font-extrabold text-[#a78bfa]">{currentCourse.progress}%</span>
                </div>
                <span className="text-[1.05rem] font-black text-[#c4b5fd] tracking-[0.15em]">{currentCourse.name}</span>
                <div className="relative h-3 rounded-full bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    style={{ width: `${currentCourse.progress}%` }}
                  />
                  {stripePositions
                    .filter(left => left < currentCourse.progress)
                    .map((left, i) => (
                      <div key={i} className="absolute top-[-2px] w-[1.5px] h-5 bg-[rgba(0,0,0,0.18)] rotate-[20deg]" style={{ left: `${left}%` }} />
                    ))}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <span className="text-[0.78rem] text-[#6b6490] font-semibold bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.1)] px-[0.7rem] py-[0.3rem] rounded-lg">
                  {currentCourse.category}
                </span>
              </div>
              <button className="px-6 py-3 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white border-none rounded-xl text-[0.9rem] font-extrabold cursor-pointer tracking-[0.03em] shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] active:translate-y-0 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm0-2h12V10H6zm7.413-3.588Q14 15.826 14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17t1.413-.587M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6zM6 20V10z"/></svg>
                Lock In
              </button>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center gap-3 border-l border-[rgba(139,92,246,0.15)] pl-[1.1rem] max-sm:border-l-0 max-sm:border-t max-sm:border-[rgba(139,92,246,0.15)] max-sm:pl-0 max-sm:pt-4">
              <p className="text-[#5a5278] text-sm text-center m-0">No active course yet.</p>
              <button
                onClick={() => navigate('/home/learn')}
                className="px-5 py-2 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white rounded-xl text-sm font-bold border-none cursor-pointer shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)]"
              >
                Start Learning →
              </button>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
