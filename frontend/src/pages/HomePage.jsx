const xpData = [20, 45, 30, 65, 50, 80, 60, 90, 72, 95, 68, 100];

function ActivityChart() {
  const w = 340, h = 130, px = 12, py = 16;
  const xs = xpData.map((_, i) => px + (i / (xpData.length - 1)) * (w - px * 2));
  const ys = xpData.map(v => py + (1 - v / 100) * (h - py * 2));
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
        <circle key={i} cx={x} cy={ys[i]} r={i === xpData.length - 1 ? 5 : 3}
          fill={i === xpData.length - 1 ? '#a78bfa' : '#8b5cf6'}
          stroke={i === xpData.length - 1 ? '#fff' : 'none'} strokeWidth="1.5" />
      ))}
    </svg>
  );
}

const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const streakDays = [true, true, true, true, true, false, false];

const courses = [
  { name: 'MEME',             category: 'Internet Culture', progress: 65, lessons: 12 },
  { name: 'Brainrot Basics',  category: 'Viral Content',    progress: 80, lessons: 10 },
  { name: 'Rizz & Sigma',     category: 'Gen Z Slang',      progress: 20, lessons: 8  },
  { name: 'TikTok Vocab',     category: 'Social Media',     progress: 10, lessons: 15 },
  { name: 'Gen Z Slang',      category: 'Language',         progress: 45, lessons: 9  },
  { name: 'Skibidi Dictionary', category: 'Meme Culture',   progress: 5,  lessons: 20 },
  { name: 'Internet Humor',   category: 'Comedy',           progress: 30, lessons: 11 },
];

const cardCls =
  "bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.18)] rounded-[20px] p-[1.6rem] backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-[rgba(139,92,246,0.35)] hover:shadow-[0_0_32px_rgba(139,92,246,0.1)] before:content-[''] before:absolute before:inset-0 before:rounded-[20px] before:bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.06)_0%,transparent_65%)] before:pointer-events-none";

const cardTitleCls = "text-[0.8rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em] m-0 mb-4";

const stripePositions = [15, 28, 41, 54, 67, 80];

const CHARACTER_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 32 32" fill="#c4b5fd">
    <g fill="#c4b5fd">
      <path d="M12.959 12.258h6.017a3.027 3.027 0 0 0-3.014-3.015a3.01 3.01 0 0 0-3.003 3.015m1.258-3.701a.534.534 0 0 1-.537-.537v-.745c0-.298.239-.537.537-.537s.537.239.537.537v.745a.534.534 0 0 1-.537.537m2.958-.537c0 .298.239.537.537.537a.534.534 0 0 0 .537-.537v-.745a.534.534 0 0 0-.537-.537a.535.535 0 0 0-.537.537z"/>
      <path d="M24.244 9.711c-.336-3.657-4.12-7.356-8.155-7.356c-4.511 0-7.79 3.615-8.434 7.356c-.041.238-.146.729-.284 1.379l-.228 1.078C5.543 14 .653 20.796 2.579 22.723c.65.65 2.052.24 3.617-.604c.231.972.61 1.905 1.111 2.769a10.06 10.06 0 0 0-1.402 4.685a.933.933 0 0 0 .938.972h18.235a.933.933 0 0 0 .938-.972a10.06 10.06 0 0 0-1.387-4.66c.52-.88.912-1.83 1.145-2.81c1.578.854 2.993 1.273 3.647.62c1.978-1.978-3.232-9.09-4.685-10.691l-.044-.048c-.234-1.074-.415-1.915-.448-2.273M7.924 25.832c1.242 1.696 2.987 3.03 5.013 3.713h-6.03a9.1 9.1 0 0 1 1.018-3.713m11.068 3.713c2.022-.684 3.767-2.02 5.013-3.696a9.1 9.1 0 0 1 1.008 3.696zM21.45 14.14a7.9 7.9 0 0 1 2.618 5.876c0 4.408-3.626 7.982-8.1 7.982c-4.472 0-8.098-3.574-8.098-7.982a7.9 7.9 0 0 1 2.615-5.873c-.58-.922-.92-2.13-.92-3.677c0-3.102 3.073-5.921 5.163-5.921c.247 0 .35.287.465.608c.145.405.31.865.811.865c.49 0 .634-.44.763-.84c.108-.33.206-.633.485-.633c2.105 0 5.12 2.893 5.12 5.921c0 1.52-.333 2.736-.922 3.674"/>
    </g>
  </svg>
);

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center p-7 overflow-auto max-sm:p-4">
      <div className="h-[88vh] grid grid-cols-[auto_auto] grid-rows-[auto_1fr] gap-[1.1rem] w-fit min-w-[70%] max-lg:min-w-[90%] max-sm:h-auto max-sm:w-full max-sm:flex max-sm:flex-col">

        {/* ── Profile Card ── */}
        <div className={`${cardCls} col-start-1 row-start-1 flex items-center gap-7`}>
          <div className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="relative">
              {CHARACTER_ICON}
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white text-[0.65rem] font-extrabold px-[7px] py-[2px] rounded-[20px] border-[1.5px] border-[#0d0b1e]">
                Lv.9
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
            <h2 className="text-[2.2rem] font-extrabold text-[#f0eeff] m-0 -tracking-[0.5px]">Jiahong</h2>
            <button className="mt-1 self-start px-5 py-2 bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border border-[rgba(139,92,246,0.3)] rounded-[10px] text-sm font-bold cursor-pointer transition-all hover:bg-[rgba(139,92,246,0.28)] hover:text-[#ede9fe] hover:shadow-[0_0_14px_rgba(139,92,246,0.25)]">
              View Stats →
            </button>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 ml-auto max-sm:hidden">
            <span className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(251,146,60,0.15)] text-[#fbbf24] border border-[rgba(251,191,36,0.25)] flex items-center justify-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><defs><linearGradient id="xpStarGrad" x1="187.9" x2="324.1" y1="138.1" y2="373.9" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fcd966"/><stop offset=".5" stopColor="#fcd966"/><stop offset="1" stopColor="#fccd34"/></linearGradient></defs><path fill="url(#xpStarGrad)" stroke="#fcd34d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="m105.7 263.5l107.5 29.9a7.9 7.9 0 0 1 5.4 5.4l29.9 107.5a7.8 7.8 0 0 0 15 0l29.9-107.5a7.9 7.9 0 0 1 5.4-5.4l107.5-29.9a7.8 7.8 0 0 0 0-15l-107.5-29.9a7.9 7.9 0 0 1-5.4-5.4l-29.9-107.5a7.8 7.8 0 0 0-15 0l-29.9 107.5a7.9 7.9 0 0 1-5.4 5.4l-107.5 29.9a7.8 7.8 0 0 0 0 15Z"><animateTransform additive="sum" attributeName="transform" calcMode="spline" dur="6s" keySplines=".42, 0, .58, 1; .42, 0, .58, 1" repeatCount="indefinite" type="rotate" values="-15 256 256; 15 256 256; -15 256 256"/><animate attributeName="opacity" dur="6s" values="1; .75; 1; .75; 1; .75; 1"/></path></svg>
              380 XP
            </span>
            <span className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(139,92,246,0.15)] text-[#a78bfa] border border-[rgba(139,92,246,0.3)] text-center">🏆 GOAT</span>
            <span className="text-sm font-bold px-4 py-2 rounded-[20px] bg-[rgba(251,146,60,0.12)] text-[#fb923c] border border-[rgba(251,146,60,0.25)] flex items-center justify-center gap-1">
              Day 5
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 64 64"><path fill="#ff9d33" d="M57 26.2s-3 2.8-8.1 6.1C47.5 24.2 43.6 14.2 36 2c0 0-2.5 13.1-10.8 25.4c-3.6-5.6-5.2-10-5.2-10C-6 43.5 15.6 62 29.2 62c17.4 0 32.7-8.4 27.8-35.8"/><path fill="#ffce31" d="M46.7 49.4c1.5-3.3 2.6-7.6 2.8-13c0 0-2.1 1.8-5.7 4.1c-1-5.4-3.7-12-9-20.2c0 0-1.7 8.7-7.5 17c-2.5-3.7-3.6-6.7-3.6-6.7c-4.3 6.8-6 12.2-6.1 16.5c-2.4-.9-3.9-1.6-3.9-1.6c4.1 12.2 12.6 14.9 16.4 14.9c6.8 0 13.7-2 20.5-11.7c0-.1-1.5.3-3.9.7"/><path fill="#ffdf85" d="M21.9 43.9s2.8 3.8 4.9 2.9c0 0 4-6.3 9.8-9.8c0 0-1.2 9.6.2 11.3c1.8 2.3 6.7-2.5 6.7-2.5c0 5.7-6.2 12.8-11.8 12.8c-5.4 0-13.2-6.2-9.8-14.7"/><path fill="#ff9d33" d="M49.8 18.1c2.1-3 3.5-6.2 3.5-6.2c3.5 5.8 1.4 9.3-.1 10.4c-2.1 1.6-5.8-.7-3.4-4.2m-38.2-1c-2.1-3.5-2.3-7.9-2.3-7.9c-5 7.5-3.1 11.7-1.4 12.9c2.2 1.7 6-.9 3.7-5m11.6-7.8c.3-2.4-.7-4.8-.7-4.8c4.7 3.1 4.7 5.7 4.1 6.8c-.9 1.3-3.7.7-3.4-2"/></svg>
            </span>
          </div>
        </div>

        {/* ── My Courses Card ── */}
        <div className={`${cardCls} col-start-2 row-start-1 flex flex-col`}>
          <h3 className={cardTitleCls}>My Courses</h3>
          <ul className="styled-scroll list-none m-0 p-0 flex flex-col gap-[0.55rem] overflow-y-auto max-h-[220px] pr-1">
            {courses.map((c, i) => (
              <li key={i} className="flex flex-col gap-[0.4rem] px-[0.9rem] py-[0.6rem] bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.12)] rounded-[10px] cursor-pointer transition-all hover:border-[rgba(139,92,246,0.3)] hover:bg-[rgba(139,92,246,0.06)]">
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
        </div>

        {/* ── Activity + Course Card ── */}
        <div className={`${cardCls} col-span-full row-start-2 grid grid-cols-[1.35fr_1fr] gap-[1.1rem] items-stretch max-sm:grid-cols-1`}>

          {/* Left: XP Chart */}
          <div className="flex flex-col gap-3 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className={cardTitleCls}>XP Progress</h3>
              <span className="text-[0.72rem] text-[#5a5278] font-semibold">Last 12 days</span>
            </div>
            <div className="flex-1 min-h-[120px]">
              <ActivityChart />
            </div>
            <div className="flex gap-[0.6rem]">
              {days.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-[0.3rem]">
                  <div className={`w-[10px] h-[10px] rounded-full border-[1.5px] transition-colors ${streakDays[i] ? 'bg-[#8b5cf6] border-[#a78bfa] shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.2)]'}`} />
                  <span className="text-[0.65rem] text-[#5a5278] font-semibold">{d}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Course */}
          <div className="flex flex-col justify-center gap-[1.1rem] border-l border-[rgba(139,92,246,0.15)] pl-[1.1rem] max-sm:border-l-0 max-sm:border-t max-sm:border-[rgba(139,92,246,0.15)] max-sm:pl-0 max-sm:pt-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[0.72rem] font-bold text-[#7c6ea8] uppercase tracking-[0.1em]">Current Course</span>
                <span className="text-[0.82rem] font-extrabold text-[#a78bfa]">65%</span>
              </div>
              <span className="text-[1.05rem] font-black text-[#c4b5fd] tracking-[0.15em]">MEME</span>
              <div className="relative h-3 rounded-full bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.2)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                  style={{ width: '65%' }}
                />
                {stripePositions.map((left, i) => (
                  <div key={i} className="absolute top-[-2px] w-[1.5px] h-5 bg-[rgba(0,0,0,0.18)] rotate-[20deg]" style={{ left: `${left}%` }} />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-[0.78rem] text-[#6b6490] font-semibold bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.1)] px-[0.7rem] py-[0.3rem] rounded-lg">📖 12 lessons</span>
              <span className="text-[0.78rem] text-[#6b6490] font-semibold bg-[rgba(255,255,255,0.03)] border border-[rgba(139,92,246,0.1)] px-[0.7rem] py-[0.3rem] rounded-lg">⏱ 3h left</span>
            </div>
            <button className="px-6 py-3 bg-gradient-to-br from-[#7c3aed] to-[#4f46e5] text-white border-none rounded-xl text-[0.9rem] font-extrabold cursor-pointer tracking-[0.03em] shadow-[0_4px_20px_rgba(124,58,237,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_28px_rgba(124,58,237,0.5)] active:translate-y-0 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20V10q0-.825.588-1.412T6 8h1V6q0-2.075 1.463-3.537T12 1t3.538 1.463T17 6v2h1q.825 0 1.413.588T20 10v10q0 .825-.587 1.413T18 22zm0-2h12V10H6zm7.413-3.588Q14 15.826 14 15t-.587-1.412T12 13t-1.412.588T10 15t.588 1.413T12 17t1.413-.587M9 8h6V6q0-1.25-.875-2.125T12 3t-2.125.875T9 6zM6 20V10z"/></svg>
              Lock In
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}
