import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
        <path d="m15 5 3 3"/>
      </svg>
    ),
    label: 'Adaptive Learning',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.3)',
    description:
      'Our IRT-powered engine adjusts difficulty in real time based on your performance — every question perfectly calibrated to push you forward.',
    pills: ['Personalised', 'IRT Engine', 'Real-time'],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    label: 'Community',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.3)',
    description:
      'Post, react, and discuss with fellow learners. Share discoveries, debate meanings, and keep up with the slang that\'s actually trending.',
    pills: ['Posts & Reactions', 'Discussions', 'Trending'],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    ),
    label: 'Gamification',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.3)',
    description:
      'Earn XP for every lesson completed, level up your profile, and unlock badges that flex your mastery. Learning feels like a game because it is one.',
    pills: ['XP & Levels', 'Badges', 'Streaks'],
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="13" width="6" height="9" rx="1"/>
        <rect x="9" y="1" width="6" height="21" rx="1"/>
        <rect x="17" y="9" width="6" height="13" rx="1"/>
      </svg>
    ),
    label: 'Leaderboard',
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.1)',
    border: 'rgba(236,72,153,0.3)',
    description:
      'See how you stack up against every learner on the platform. Climb global rankings, defend your rank, and prove you\'re the most Gen Alpha in the room.',
    pills: ['Global Rankings', 'Weekly Reset', 'Top 100'],
  },
];

export default function Features() {
  const sectionRef = useRef(null);
  const headerRef  = useRef(null);
  const cardsRef   = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(headerRef.current, { opacity: 0, y: 50 });
      gsap.set(cardsRef.current, { opacity: 0, y: 60, scale: 0.95 });

      // Header reveal
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
          },
        }
      );

      // Cards stagger
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 60, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger: 0.15,
          scrollTrigger: {
            trigger: cardsRef.current[0],
            start: 'top 82%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-[#050508] py-24 px-6 overflow-hidden" style={{ minHeight: '100dvh', scrollSnapAlign: 'start' }}>
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(139,92,246,0.07) 0%, transparent 70%)',
      }} />

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className="text-[0.8rem] font-bold tracking-[0.12em] text-[#8b5cf6] uppercase">
            ✦ Everything you need
          </span>
          <h2 className="mt-3 text-[clamp(1.8rem,4vw,3rem)] font-black text-[#f0eeff] leading-tight -tracking-[0.5px]">
            Built different. For a{' '}
            <span className="text-[#8b5cf6] [text-shadow:0_0_30px_rgba(139,92,246,0.4)]">different</span>{' '}
            generation.
          </h2>
          <p className="mt-4 text-[1rem] text-[#7c6ea8] max-w-[480px] mx-auto leading-relaxed">
            Four core pillars that make AlphaLingo the most engaging way to learn Gen Alpha slang.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {features.map(({ icon, label, color, bg, border, description, pills }, i) => (
            <div
              key={label}
              ref={el => cardsRef.current[i] = el}
              className="group relative rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Hover border glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ border: `1px solid ${border}`, boxShadow: `0 0 28px ${bg}` }}
              />

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg, color, border: `1px solid ${border}` }}
              >
                {icon}
              </div>

              {/* Text */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[1.15rem] font-extrabold text-[#f0eeff] m-0">{label}</h3>
                <p className="text-[0.9rem] text-[#8a82a8] leading-relaxed m-0">{description}</p>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {pills.map(pill => (
                  <span
                    key={pill}
                    className="text-[0.72rem] font-bold px-3 py-1 rounded-full"
                    style={{ background: bg, color, border: `1px solid ${border}` }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
