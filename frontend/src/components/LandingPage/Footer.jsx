export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-[rgba(139,92,246,0.2)]">
      <div className="max-w-[1200px] mx-auto px-8 py-10 flex flex-col gap-8">

        {/* Top: Brand + Nav */}
        <div className="flex flex-wrap items-start justify-between gap-8">

          {/* Brand */}
          <a href="#home" className="text-[1.4rem] font-extrabold text-[#f5f5f5] no-underline -tracking-[0.5px]">
            <span className="text-[#8b5cf6]">Alpha</span>Lingo
          </a>

          {/* Horizontal nav links */}
          <nav className="flex flex-wrap gap-10">

            {/* Product */}
            <div className="flex flex-col gap-2">
              <span className="text-[0.75rem] font-bold tracking-[0.1em] uppercase text-[#f5f5f5]">App</span>
              <div className="flex gap-6">
                {['Dictionary', 'Leaderboard', 'Challenges'].map((link) => (
                  <a key={link} href="#" className="text-[0.9rem] text-[#6b7280] no-underline hover:text-[#8b5cf6] transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-2">
              <span className="text-[0.75rem] font-bold tracking-[0.1em] uppercase text-[#f5f5f5]">Company</span>
              <div className="flex gap-6">
                {['About', 'Blog'].map((link) => (
                  <a key={link} href="#" className="text-[0.9rem] text-[#6b7280] no-underline hover:text-[#8b5cf6] transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Support */}
            <div className="flex flex-col gap-2">
              <span className="text-[0.75rem] font-bold tracking-[0.1em] uppercase text-[#f5f5f5]">Support</span>
              <div className="flex gap-6">
                {['Contact'].map((link) => (
                  <a key={link} href="#" className="text-[0.9rem] text-[#6b7280] no-underline hover:text-[#8b5cf6] transition-colors">
                    {link}
                  </a>
                ))}
              </div>
            </div>

          </nav>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.85rem] text-[#4b5563] m-0">
            © {new Date().getFullYear()} AlphaLingo. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#" className="text-[0.8rem] text-[#4b5563] no-underline hover:text-[#8b5cf6] transition-colors">Privacy & Terms</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
