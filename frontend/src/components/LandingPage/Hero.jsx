import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroBg from '../../assets/Brainrot & Internet Humour.mp4';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ onSignup }) {
  const sectionRef = useRef(null);
  const videoRef   = useRef(null);
  const badgeRef   = useRef(null);
  const headingRef = useRef(null);
  const subRef     = useRef(null);
  const btnRef     = useRef(null);
  const scrollRef  = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const contentEls = [badgeRef.current, headingRef.current, subRef.current, btnRef.current];

      // Set initial state via GSAP (not className) so content is visible if JS fails
      gsap.set(contentEls, { opacity: 0, y: 30 });
      gsap.set(scrollRef.current, { opacity: 0 });

      // ── Entrance timeline ──────────────────────────────────────────────────
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(badgeRef.current,  { opacity: 1, y: 0, duration: 0.7 })
        .to(headingRef.current, { opacity: 1, y: 0, skewY: 0, duration: 0.9 }, '-=0.35')
        .to(subRef.current,     { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
        .to(btnRef.current,     { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.4')
        .to(scrollRef.current,  { opacity: 1, duration: 0.6 }, '-=0.2');

      // ── Scroll parallax on video ────────────────────────────────────────────
      gsap.to(videoRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // ── Animate back in when snapping back to hero ──────────────────────────
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        onEnterBack: () => {
          gsap.fromTo(contentEls,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1 }
          );
        },
      });

      // ── Bouncing scroll indicator ───────────────────────────────────────────
      gsap.to(scrollRef.current, {
        y: 10,
        repeat: -1,
        yoyo: true,
        duration: 1.1,
        ease: 'sine.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex items-center overflow-hidden bg-[#050508]"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Background video */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        autoPlay muted loop playsInline
      >
        <source src={heroBg} type="video/mp4" />
      </video>

      {/* Overlays */}
      <div className="absolute inset-0 bg-[rgba(5,0,20,0.62)] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #050508)' }} />

      <div className="relative z-10 w-full max-w-[760px] mx-auto px-8 py-16 flex items-center justify-center">
        <div className="flex flex-col items-center text-center gap-5 w-full">

          <span ref={badgeRef} className="text-[0.85rem] font-semibold tracking-[0.08em] text-[#8b5cf6] uppercase">
            ✦ The Next-Gen Language Platform
          </span>

          <h1 ref={headingRef} className="text-[clamp(2rem,5vw,3.8rem)] font-black leading-[1.1] text-[#f5f5f5] m-0 -tracking-[1px]">
            Smart <span className="text-[#8b5cf6] [text-shadow:0_0_40px_rgba(139,92,246,0.5)]">Adaptive</span> Learning.<br />
            Gen Alpha Slang.
          </h1>

          <p ref={subRef} className="text-[1.05rem] leading-[1.7] text-[#c4c4d4] m-0 max-w-[520px]">
            Explore. Discover. Grow. Master the slangs, memes, and lingo
            that define the internet's next generation.
          </p>

          <a
            ref={btnRef}
            className="inline-flex items-center self-center gap-2 px-7 py-3 text-base font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-xl no-underline transition-all shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(139,92,246,0.6)] cursor-pointer"
            onClick={onSignup}
          >
            Start Now →
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div ref={scrollRef} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <span className="text-[0.65rem] tracking-[0.15em] uppercase text-[#6b6490]">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6490" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </div>
    </section>
  );
}
