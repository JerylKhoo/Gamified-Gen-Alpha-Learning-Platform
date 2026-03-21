import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ACCENT = '#8b5cf6';
const ACCENT_GLOW = 'rgba(139,92,246,0.1)';
const ACCENT_BORDER = 'rgba(139,92,246,0.25)';

const FAQS = [
  {
    q: "What exactly is AlphaLingo?",
    a: "AlphaLingo is a gamified learning platform that teaches you Gen Alpha slang and internet culture through adaptive quizzes, XP rewards, and a live community feed. Think Duolingo, but make it no cap.",
  },
  {
    q: "Is AlphaLingo free to use?",
    a: "Yes — creating an account and accessing core courses is completely free. No credit card, no trial period, no hidden fees. Just sign up and start learning.",
  },
  {
    q: "How does the adaptive learning engine work?",
    a: "We use Item Response Theory (IRT) to model your skill level in real time. Every answer you give — right or wrong — updates our estimate of your ability, so the next question is always calibrated to be just challenging enough to keep you in the flow zone.",
  },
  {
    q: "What kind of slang will I learn?",
    a: "Everything from everyday Gen Alpha terms (slay, rizz, bussin) to TikTok-born phrases, meme vocabulary, and internet-culture references. Content is curated and updated regularly to stay current with what's actually trending.",
  },
  {
    q: "How do XP, badges, and the leaderboard work?",
    a: "You earn XP for completing lessons, maintaining daily streaks, and hitting accuracy milestones. XP fills your level bar and unlocks badge tiers. The global leaderboard resets weekly so there's always a fresh chance to claim the top spot.",
  },
  {
    q: "Can I track my progress over time?",
    a: "Absolutely. Your profile shows a full history of completed courses, earned badges, streak records, and accuracy trends. You can also see exactly which topic areas you're strongest — and weakest — in.",
  },
  {
    q: "Is there a community aspect to AlphaLingo?",
    a: "Yes! The community feed lets you post, react, and discuss with other learners. Share the wildest slang you've discovered, debate whether something is still lowkey or already mid, and stay plugged in to what language is genuinely being used.",
  },
];

function generateStars(count) {
  const stars = [];
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
  for (let i = 0; i < count; i++) {
    stars.push({ x: rand() * 100, y: rand() * 100, r: rand() * 1.4 + 0.2, o: rand() * 0.4 + 0.08 });
  }
  return stars;
}
const STARS = generateStars(120);

export default function FAQ() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const itemRefs   = useRef([]);
  const bodyRefs   = useRef([]);
  const arrowRefs  = useRef([]);
  const glowRefs   = useRef([]);
  const [open, setOpen]   = useState(null);
  const tweenRef   = useRef({});   // tracks active body tween per index

  // ── Scroll-triggered entrance ─────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading fade + slide up
      gsap.fromTo(
        [headingRef.current, subRef.current],
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.14,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 78%', once: true },
        }
      );

      // Cards stagger in
      gsap.fromTo(
        itemRefs.current,
        { opacity: 0, y: 48, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.09,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // ── Accordion toggle ──────────────────────────────────────────────────────
  const toggle = (i) => {
    const isOpening = open !== i;
    const prevOpen  = open;
    setOpen(isOpening ? i : null);

    // Close previously open item
    if (prevOpen !== null && prevOpen !== i) {
      animateClose(prevOpen);
    }
    if (isOpening) {
      animateOpen(i);
    } else {
      animateClose(i);
    }
  };

  const animateOpen = (i) => {
    const body  = bodyRefs.current[i];
    const arrow = arrowRefs.current[i];
    const glow  = glowRefs.current[i];
    const item  = itemRefs.current[i];

    if (tweenRef.current[i]) tweenRef.current[i].kill();

    // Measure natural height
    body.style.height    = 'auto';
    body.style.opacity   = '1';
    const fullH = body.scrollHeight;
    body.style.height    = '0px';
    body.style.opacity   = '0';

    const tl = gsap.timeline();
    tl.to(body, { height: fullH, opacity: 1, duration: 0.42, ease: 'power3.out' })
      .to(body, { height: 'auto', duration: 0 }); // let content reflow naturally after

    gsap.to(arrow, { rotation: 45, duration: 0.35, ease: 'power2.out' });
    gsap.to(glow,  { opacity: 1,  duration: 0.4,  ease: 'power2.out' });
    gsap.to(item,  { borderColor: ACCENT_BORDER, duration: 0.3 });

    tweenRef.current[i] = tl;
  };

  const animateClose = (i) => {
    const body  = bodyRefs.current[i];
    const arrow = arrowRefs.current[i];
    const glow  = glowRefs.current[i];
    const item  = itemRefs.current[i];

    if (tweenRef.current[i]) tweenRef.current[i].kill();

    // Snap height from auto to px before animating to 0
    body.style.height = body.scrollHeight + 'px';

    const tl = gsap.timeline();
    tl.to(body, { height: 0, opacity: 0, duration: 0.35, ease: 'power3.in' });

    gsap.to(arrow, { rotation: 0,  duration: 0.32, ease: 'power2.in' });
    gsap.to(glow,  { opacity: 0,   duration: 0.3,  ease: 'power2.in' });
    gsap.to(item,  { borderColor: 'rgba(255,255,255,0.07)', duration: 0.3 });

    tweenRef.current[i] = tl;
  };

  return (
    <section
      ref={sectionRef}
      style={{ background: '#02010a', padding: '96px 0 112px', position: 'relative', overflow: 'hidden' }}
    >
      {/* Starfield */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.o} />
        ))}
      </svg>

      {/* Nebula blobs */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '-5%',  width: 480, height: 320, background: 'radial-gradient(ellipse, rgba(139,92,246,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '8%', right: '-4%', width: 440, height: 300, background: 'radial-gradient(ellipse, rgba(34,211,238,0.05) 0%, transparent 70%)',  filter: 'blur(60px)' }} />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span ref={headingRef} style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: ACCENT, marginBottom: 12 }}>
            ✦ FAQ
          </span>
          <h2
            ref={subRef}
            style={{ margin: 0, fontSize: 'clamp(1.6rem, 3.5vw, 2.6rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15 }}
          >
            Got questions?<br />
            <span style={{ color: 'rgba(255,255,255,0.38)' }}>We got answers, no cap.</span>
          </h2>
        </div>

        {/* Accordion items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                ref={el => itemRefs.current[i] = el}
                onClick={() => toggle(i)}
                style={{
                  position: 'relative',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.03)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  transition: 'background 0.2s',
                  userSelect: 'none',
                }}
                onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.055)'; }}
                onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                {/* Glow overlay (fades in on open) */}
                <div
                  ref={el => glowRefs.current[i] = el}
                  style={{
                    position: 'absolute', inset: 0, borderRadius: 16,
                    background: ACCENT_GLOW,
                    opacity: 0, pointerEvents: 'none',
                  }}
                />

                {/* Question row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', position: 'relative', zIndex: 1 }}>
                  {/* Dot */}
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                  <span style={{ flex: 1, fontSize: 'clamp(0.88rem, 1.8vw, 1rem)', fontWeight: 700, color: '#fff', lineHeight: 1.45 }}>
                    {q}
                  </span>

                  {/* Plus/cross arrow */}
                  <div
                    ref={el => arrowRefs.current[i] = el}
                    style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
                      border: `1px solid ${ACCENT_BORDER}`,
                      background: isOpen ? `rgba(139,92,246,0.12)` : 'rgba(255,255,255,0.04)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: ACCENT,
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>

                {/* Answer body (GSAP controls height/opacity) */}
                <div
                  ref={el => bodyRefs.current[i] = el}
                  style={{ height: 0, opacity: 0, overflow: 'hidden', position: 'relative', zIndex: 1 }}
                >
                  <p style={{
                    margin: 0,
                    padding: '0 24px 20px 48px',
                    fontSize: 'clamp(0.82rem, 1.6vw, 0.93rem)',
                    color: 'rgba(255,255,255,0.55)',
                    lineHeight: 1.8,
                  }}>
                    {a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
