import heroBg from '../../assets/astronauts.mp4';

export default function Hero({ onSignup }) {
  return (
    <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden bg-[#050508]">
      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none scale-105 translate-x-[1.4%]"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroBg} type="video/mp4" />
      </video>

      {/* Dark gradient overlay so text stays readable */}
      <div className="absolute inset-0 bg-[rgba(5,0,20,0.60)] pointer-events-none md:bg-[rgba(5,0,20,0.65)]" />

      <div className="relative z-10 w-full max-w-[760px] mx-auto px-8 py-16 flex items-center justify-center md:px-6 md:py-12 sm:px-4 sm:py-10">
        {/* Text content */}
        <div className="flex flex-col items-center text-center gap-5 w-full">
          <span className="text-[0.85rem] font-semibold tracking-[0.08em] text-[#8b5cf6] uppercase">
            ✦ The Next-Gen Language Platform
          </span>
          <h1 className="text-[clamp(2rem,5vw,3.8rem)] font-black leading-[1.1] text-[#f5f5f5] m-0 -tracking-[1px]">
            Smart <span className="text-[#8b5cf6] [text-shadow:0_0_40px_rgba(139,92,246,0.5)]">Adaptive</span> Learning.<br /> Gen Alpha Slang.
          </h1>
          <p className="text-[1.05rem] leading-[1.7] text-[#c4c4d4] m-0 max-w-[520px] sm:text-base">
            Explore. Discover. Grow. Master the slangs, memes, and lingo
            that define the internet's next generation.
          </p>
          <a
            className="inline-flex items-center self-center gap-2 px-7 py-3 text-base font-bold text-white bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] rounded-xl no-underline transition-all shadow-[0_4px_24px_rgba(139,92,246,0.4)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(139,92,246,0.6)] cursor-pointer"
            onClick={onSignup}
          >
            Start Now →
          </a>
        </div>
      </div>
    </section>
  );
}
