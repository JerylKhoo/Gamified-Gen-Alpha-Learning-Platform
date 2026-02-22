export default function Navbar({ onLogin, onSignup, onLogoClick }) {
  return (
    <nav className="sticky top-0 z-[1000] w-full bg-[rgba(13,13,13,0.92)] backdrop-blur-md border-b border-[rgba(139,92,246,0.2)]">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between sm:px-4">
        {/* Logo */}
        <a
          href={onLogoClick ? undefined : '#home'}
          className="text-2xl font-extrabold text-[#f5f5f5] no-underline tracking-tight transition-opacity hover:opacity-80"
          onClick={onLogoClick ?? undefined}
          style={onLogoClick ? { cursor: 'pointer' } : undefined}
        >
          <span className="text-[#8b5cf6]">Alpha</span>Lingo
        </a>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <button
            className="font-[inherit] cursor-pointer text-[#8b5cf6] bg-transparent text-[0.88rem] font-semibold px-5 py-2 border border-[rgba(139,92,246,0.5)] rounded-full tracking-wide transition-all hover:bg-[rgba(139,92,246,0.12)] hover:border-[#8b5cf6] hover:text-[#f5f5f5] hover:-translate-y-px sm:px-3 sm:text-xs"
            onClick={onLogin}
          >
            Log In
          </button>
          <button
            className="font-[inherit] cursor-pointer text-[#f5f5f5] text-[0.88rem] font-bold px-5 py-2 bg-[#8b5cf6] border border-[#8b5cf6] rounded-full tracking-wide transition-all hover:bg-[#6d28d9] hover:border-[#6d28d9] hover:-translate-y-px sm:px-3 sm:text-xs"
            onClick={onSignup}
          >
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
}
