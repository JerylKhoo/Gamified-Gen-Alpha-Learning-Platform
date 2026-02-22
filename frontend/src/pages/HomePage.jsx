import { useState } from 'react';
import Sidebar from '../components/HomePage/Sidebar';
import '../styles/HomePage.css';

const xpData = [20, 45, 30, 65, 50, 80, 60, 90, 72, 95, 68, 100];

function ActivityChart() {
  const w = 340, h = 130, px = 12, py = 16;
  const xs = xpData.map((_, i) => px + (i / (xpData.length - 1)) * (w - px * 2));
  const ys = xpData.map(v => py + (1 - v / 100) * (h - py * 2));
  const line = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x},${ys[i]}`).join(' ');
  const area = `${line} L${xs.at(-1)},${h} L${xs[0]},${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" preserveAspectRatio="none">
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

const dailyTasks = [
  { label: 'Complete Chapter 3', done: true },
  { label: 'Daily Quiz', done: false },
  { label: 'Post in Community', done: false },
];

export default function HomePage() {
  const [activePage, setActivePage] = useState('Home');

  return (
    <div className="home-page">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <main className="home-content">
        <div className="bento-grid">

          {/* ── Profile Card ── */}
          <div className="bento-card profile-card">
            <div className="profile-avatar-wrap">
              <div className="avatar-ring">
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="20" r="11" fill="#c4b5fd" />
                  <path d="M8 52c0-11 9-19 20-19s20 8 20 19" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <div className="avatar-level">Lv.9</div>
            </div>
            <div className="profile-info">
              <p className="profile-greeting">Welcome back,</p>
              <h2 className="profile-name">Jiahong</h2>
              <button className="btn-stats">View Stats →</button>
            </div>
            <div className="profile-stats">
              <span className="badge badge-xp">🔥 380 XP</span>
              <span className="badge badge-rank">🏆 GOAT</span>
              <span className="badge badge-streak">Day 5 🔥</span>
            </div>
          </div>

          {/* ── Daily Goals Card ── */}
          <div className="bento-card daily-card">
            <div className="daily-header">
              <h3 className="card-title">Start today in</h3>
            </div>
            <ul className="daily-list">
              {dailyTasks.map((t, i) => (
                <li key={i} className={`daily-item ${t.done ? 'done' : ''}`}>
                  <span className="daily-check">{t.done ? '✓' : ''}</span>
                  {t.label}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Activity + Course Card ── */}
          <div className="bento-card activity-card">
            <div className="activity-left">
              <div className="activity-header">
                <h3 className="card-title">XP Progress</h3>
                <span className="activity-range">Last 12 days</span>
              </div>
              <div className="chart-wrap">
                <ActivityChart />
              </div>
              <div className="streak-row">
                {days.map((d, i) => (
                  <div key={i} className="streak-day">
                    <div className={`streak-dot ${streakDays[i] ? 'active' : ''}`} />
                    <span className="streak-label">{d}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="activity-right">
              <div className="course-pill">
                <span className="course-pill-label">Current Course</span>
                <div className="course-stripe-wrap">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="course-stripe" />
                  ))}
                  <span className="course-name">MEME</span>
                </div>
              </div>
              <div className="course-meta">
                <span className="course-meta-item">📖 12 lessons</span>
                <span className="course-meta-item">⏱ 3h left</span>
              </div>
              <button className="btn-lockin">🔒 Lock In</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
