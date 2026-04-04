import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const API_URL = import.meta.env.VITE_API_URL;

const FALLBACK = [
  { question: 'What does "no cap" mean in Gen Alpha slang?', answer: '"No cap" means "no lie" — you\'re being completely honest.' },
  { question: 'If someone calls you "bussin", is that a compliment?', answer: 'Yes! "Bussin" means something is really good, usually food.' },
  { question: 'What does it mean when someone says "it\'s giving"?', answer: '"It\'s giving" means something has a certain vibe or energy.' },
  { question: 'What does "slay" mean in modern internet slang?', answer: '"Slay" means to do something exceptionally well or look amazing.' },
  { question: 'What is "rizz" and how do you use it?', answer: '"Rizz" is the ability to charm others. E.g. "He\'s got rizz."' },
];

const APP_LINKS = [
  { label: 'Home',        path: '/' },
  { label: 'Learn',       path: '/learn' },
  { label: 'Community',   path: '/home/community' },
  { label: 'Dashboard',   path: '/home/dashboard' },
  { label: 'Leaderboard', path: '/home/leaderboard' },
];

export default function Footer() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [card, setCard] = useState(FALLBACK[Math.floor(Math.random() * FALLBACK.length)]);
  const [flipped, setFlipped] = useState(false);
  const footerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/questions`)
      .then(r => r.ok ? r.json() : null)
      .then(json => {
        const data = json?.data ?? [];
        if (Array.isArray(data) && data.length > 0) {
          const q = data[Math.floor(Math.random() * data.length)];
          let answerText = q.explanation || q.answer || 'Think about it...';
          try {
            const opts = JSON.parse(q.options);
            const idx = parseInt(q.answer, 10);
            if (Array.isArray(opts) && !isNaN(idx) && idx >= 0 && idx < opts.length) {
              answerText = opts[idx];
            }
          } catch { /* keep answerText fallback */ }
          setCard({ question: q.question, answer: answerText });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(footerRef.current, { opacity: 0, y: 40 });
      gsap.fromTo(
        footerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 90%',
          },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  function goTo(path) {
    if (session) {
      navigate(path);
    } else {
      navigate(`/auth?mode=login&redirect=${encodeURIComponent(path)}`);
    }
  }

  return (
    <footer ref={footerRef} className="bg-[#0d0d0d] border-t border-[rgba(139,92,246,0.2)]" style={{ scrollSnapAlign: 'start' }}>
      <div className="max-w-[1200px] mx-auto px-8 py-12 flex flex-wrap items-start justify-between gap-10">

        {/* Left: Brand + Flip Card */}
        <div className="flex flex-col gap-5 w-70">
          <a href="#home" className="text-[1.4rem] font-extrabold text-[#f5f5f5] no-underline -tracking-[0.5px]">
            <span className="text-[#8b5cf6]">Alpha</span>Lingo
          </a>

          {/* Flip card */}
          <div
            className="cursor-pointer"
            style={{ perspective: '800px' }}
            onClick={() => setFlipped(f => !f)}
          >
            <div
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.55s ease',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                minHeight: '120px',
              }}
            >
              {/* Front — Question */}
              <div
                className="absolute inset-0 bg-white/4 border border-[rgba(139,92,246,0.25)] rounded-xl p-4 flex flex-col gap-2"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-[#8b5cf6]">
                  Question of the Day
                </span>
                <p className="text-[0.84rem] text-white/80 m-0 leading-[1.6] flex-1">
                  {card.question}
                </p>
                <span className="text-[0.7rem] text-[#6b7280]">Tap to reveal →</span>
              </div>

              {/* Back — Answer */}
              <div
                className="absolute inset-0 bg-[#1a0a2e] border border-[rgba(139,92,246,0.4)] rounded-xl p-4 flex flex-col gap-2"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-[#a78bfa]">
                  Answer
                </span>
                <p className="text-[0.84rem] text-white/80 m-0 leading-[1.6] flex-1">
                  {card.answer}
                </p>
                <span className="text-[0.7rem] text-[#6b7280]">← Tap to flip back</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Nav groups */}
        <div className="flex gap-14 flex-wrap items-start">

          {/* App pages */}
          <div className="flex flex-col gap-3">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#9ca3af]">App</span>
            <div className="flex flex-col gap-2.5">
              {APP_LINKS.map(({ label, path }) => (
                <button
                  key={label}
                  onClick={() => goTo(path)}
                  className="text-[0.88rem] text-[#6b7280] bg-transparent border-none p-0 cursor-pointer text-left hover:text-[#8b5cf6] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-3">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#9ca3af]">Company</span>
            <div className="flex flex-col gap-2.5">
              {['About', 'Blog'].map(link => (
                <a key={link} href="#" className="text-[0.88rem] text-[#6b7280] no-underline hover:text-[#8b5cf6] transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-3">
            <span className="text-[0.72rem] font-bold tracking-[0.12em] uppercase text-[#9ca3af]">Support</span>
            <div className="flex flex-col gap-2.5">
              <a href="#" className="text-[0.88rem] text-[#6b7280] no-underline hover:text-[#8b5cf6] transition-colors">
                Contact
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/6 py-5 px-8 max-w-300 mx-auto flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.82rem] text-[#4b5563] m-0">
          © {new Date().getFullYear()} AlphaLingo. All rights reserved.
        </p>
        <a href="#" className="text-[0.78rem] text-[#4b5563] no-underline hover:text-[#8b5cf6] transition-colors">
          Privacy & Terms
        </a>
      </div>
    </footer>
  );
}
