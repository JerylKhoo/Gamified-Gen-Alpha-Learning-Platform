import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    number: '01',
    label: 'Sign Up',
    description: "Create your free account in seconds. No credit card, no hassle — just an email and you're in.",
    planetColor: '#8b5cf6',
    glow: 'rgba(139,92,246,0.7)',
    ring: 'rgba(139,92,246,0.3)',
    surface: ['#3b0764', '#6d28d9', '#8b5cf6', '#c4b5fd'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    number: '02',
    label: 'Pick a Course',
    description: 'Browse our library of Gen Alpha slang topics. Find exactly what you want to master and dive straight in.',
    planetColor: '#22d3ee',
    glow: 'rgba(34,211,238,0.65)',
    ring: 'rgba(34,211,238,0.28)',
    surface: ['#083344', '#0e7490', '#22d3ee', '#a5f3fc'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    number: '03',
    label: 'Learn & Quiz',
    description: 'Our adaptive engine serves questions calibrated to your exact level. The better you get, the harder it pushes.',
    planetColor: '#f59e0b',
    glow: 'rgba(245,158,11,0.65)',
    ring: 'rgba(245,158,11,0.28)',
    surface: ['#451a03', '#b45309', '#f59e0b', '#fde68a'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/>
      </svg>
    ),
  },
  {
    number: '04',
    label: 'Earn Badges',
    description: 'Complete courses, hit milestones, collect badges. Climb the leaderboard and flex your Gen Alpha fluency.',
    planetColor: '#f472b6',
    glow: 'rgba(244,114,182,0.65)',
    ring: 'rgba(244,114,182,0.28)',
    surface: ['#500724', '#be185d', '#f472b6', '#fbcfe8'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
  },
];

function generateStars(count) {
  const stars = [];
  let seed = 99;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  for (let i = 0; i < count; i++) {
    stars.push({ x: rand() * 100, y: rand() * 100, r: rand() * 1.6 + 0.3, o: rand() * 0.55 + 0.15 });
  }
  return stars;
}
const STARS = generateStars(200);

function Planet({ surface, glow, ring, size = 140 }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full" style={{ background: glow, filter: 'blur(28px)', transform: 'scale(1.5)', opacity: 0.6 }} />
      <div className="absolute rounded-full border" style={{ inset: -16, borderColor: ring, transform: 'rotateX(68deg)', boxShadow: `0 0 10px ${ring}` }} />
      <div className="absolute inset-0 rounded-full overflow-hidden" style={{
        background: `radial-gradient(circle at 32% 30%, ${surface[3]}, ${surface[2]} 35%, ${surface[1]} 65%, ${surface[0]} 100%)`,
        boxShadow: `0 0 36px ${glow}, inset -16px -16px 32px rgba(0,0,0,0.55)`,
      }}>
        <div className="absolute rounded-full" style={{ top: '10%', left: '16%', width: '32%', height: '22%', background: 'rgba(255,255,255,0.2)', filter: 'blur(5px)' }} />
        <div className="absolute" style={{ top: '56%', left: 0, right: 0, height: '16%', background: 'rgba(0,0,0,0.18)', filter: 'blur(4px)' }} />
      </div>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef  = useRef(null);
  const trackRef    = useRef(null);
  const itemRefs    = useRef([]);
  const planetRefs  = useRef([]);

  useEffect(() => {
    const track   = trackRef.current;
    const section = sectionRef.current;
    const items   = itemRefs.current;

    // Total horizontal distance = sum of item widths minus one viewport
    const getScrollDist = () => track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {

      // ── Main pin + horizontal scrub ─────────────────────────────────────────
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getScrollDist()}`,
          pin: true,
          scrub: 2,           // higher = more inertia / lag = smooth feel
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, { x: () => -getScrollDist(), ease: 'none', duration: 1 });

      // ── Per-item: scale + opacity based on how centred they are ────────────
      items.forEach((item, i) => {
        // Each item animates from dim/small → bright/big → dim/small
        // as it travels from off-right → centre → off-left
        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${getScrollDist()}`,
            scrub: 2,
            invalidateOnRefresh: true,
            containerAnimation: tl,
          },
        })
        .fromTo(item,
          { opacity: 0.6,  scale: 0.88 },
          { opacity: 1,    scale: 1,    ease: 'power1.inOut', duration: 0.5 / steps.length },
          i / steps.length
        )
        .to(item,
          { opacity: 0.6,  scale: 0.88, ease: 'power1.inOut', duration: 0.5 / steps.length },
          (i + 0.5) / steps.length
        );
      });

      // ── Slow planet wobble ──────────────────────────────────────────────────
      planetRefs.current.forEach((p, i) => {
        gsap.to(p, { y: i % 2 === 0 ? -12 : 12, duration: 3 + i * 0.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ height: '100dvh', background: '#02010a', scrollSnapAlign: 'none' }}
    >
      {/* Starfield */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {STARS.map((s, i) => <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />)}
      </svg>

      {/* Nebula blobs */}
      <div className="absolute pointer-events-none" style={{ top: '15%', left: '8%',  width: 500, height: 350, background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute pointer-events-none" style={{ top: '45%', left: '45%', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 70%)',  filter: 'blur(60px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '10%', right: '5%', width: 450, height: 350, background: 'radial-gradient(ellipse, rgba(244,114,182,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Header + track wrapper — column layout so gap is natural */}
      <div className="absolute inset-0 flex flex-col z-10" style={{ paddingTop: '32px' }}>

        {/* Header row */}
        <div className="flex items-start justify-between px-12 max-sm:px-6 flex-shrink-0">
          <div>
            <span className="text-[0.72rem] font-bold tracking-[0.14em] text-[#8b5cf6] uppercase">✦ How it works</span>
            <h2 className="mt-1.5 text-[clamp(1.1rem,2.2vw,1.75rem)] font-black text-white leading-tight -tracking-[0.5px]">
              Four steps to fluent.
            </h2>
          </div>
          <div className="flex gap-2.5 items-center mt-1">
            {steps.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        {/* Gap between header and track */}
        <div style={{ height: '8px', flexShrink: 0 }} />

        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex-1 flex overflow-visible"
          style={{ paddingLeft: '10vw', alignItems: 'center' }}
        >
        {steps.map(({ number, label, description, glow, ring, surface, planetColor }, i) => (
          <div
            key={label}
            ref={el => itemRefs.current[i] = el}
            className="flex-shrink-0 flex items-center gap-16 max-sm:gap-8"
            style={{ width: '70vw', marginRight: '5vw', willChange: 'transform, opacity' }}
          >
            {/* Planet */}
            <div ref={el => planetRefs.current[i] = el} className="flex-shrink-0">
              <Planet surface={surface} glow={glow} ring={ring} size={220} />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-5 min-w-0">
              <span
                className="text-[0.68rem] font-black tracking-[0.18em] uppercase px-3 py-1 rounded-full self-start"
                style={{ background: `rgba(255,255,255,0.06)`, color: planetColor, border: `1px solid ${ring}` }}
              >
                {number} / 04
              </span>
              <h3 className="text-[clamp(2rem,4vw,3.2rem)] font-black text-white m-0 -tracking-[0.5px] leading-tight">
                {label}
              </h3>
              <p className="text-[1rem] leading-[1.8] m-0 max-w-[380px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {description}
              </p>

              {/* Progress bar */}
              <div className="flex gap-2 mt-1">
                {steps.map((_, j) => (
                  <div key={j} className="h-[3px] rounded-full" style={{ width: 32, background: j <= i ? planetColor : 'rgba(255,255,255,0.1)' }} />
                ))}
              </div>
            </div>
          </div>
        ))}
        {/* Trailing space so last card centres properly */}
        <div style={{ flexShrink: 0, width: '5vw' }} />
      </div>
      </div>{/* end header+track wrapper */}

      {/* Scroll hint */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <span className="text-[0.6rem] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
          scroll to explore
        </span>
      </div>
    </section>
  );
}
