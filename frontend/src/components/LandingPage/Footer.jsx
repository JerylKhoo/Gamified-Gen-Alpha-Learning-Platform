const FOOTER_LINKS = {
  Platform: ['Learn', 'Dictionary', 'Leaderboard', 'Challenges'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-[rgba(139,92,246,0.2)]">
      <div className="max-w-[1200px] mx-auto px-8 py-14 flex gap-12 flex-wrap sm:flex-col sm:gap-8 sm:px-4">

        {/* Brand column */}
        <div className="flex-[2] min-w-[220px] flex flex-col gap-4 sm:min-w-full">
          <a href="#home" className="text-[1.4rem] font-extrabold text-[#f5f5f5] no-underline -tracking-[0.5px]">
            <span className="text-[#8b5cf6]">Alpha</span>Lingo
          </a>
          <p className="text-[0.9rem] leading-[1.7] text-[#6b7280] m-0 max-w-[280px] sm:max-w-full">
            The next-gen language platform. Learn the slangs, memes, and lingo
            that define the internet's next generation.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div className="flex-1 min-w-[130px] flex flex-col gap-3" key={heading}>
            <h4 className="text-[0.8rem] font-bold tracking-[0.1em] uppercase text-[#f5f5f5] m-0">
              {heading}
            </h4>
            <ul className="list-none m-0 p-0 flex flex-col gap-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-[0.9rem] text-[#6b7280] no-underline transition-colors hover:text-[#8b5cf6]">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06] py-5 px-8 max-w-[1200px] mx-auto sm:px-4">
        <p className="text-[0.85rem] text-[#4b5563] m-0">
          © {new Date().getFullYear()} AlphaLingo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
