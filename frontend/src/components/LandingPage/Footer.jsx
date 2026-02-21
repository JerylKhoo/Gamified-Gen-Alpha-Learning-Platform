import '../../styles/Footer.css';

const FOOTER_LINKS = {
  Platform: ['Learn', 'Dictionary', 'Leaderboard', 'Challenges'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Support: ['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'],
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <a href="#home" className="footer-logo">
            <span className="logo-purple">Alpha</span>Lingo
          </a>
          <p className="footer-tagline">
            The next-gen language platform. Learn the slangs, memes, and lingo
            that define the internet's next generation.
          </p>
        </div>

        {/* Link columns */}
        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <div className="footer-col" key={heading}>
            <h4 className="footer-heading">{heading}</h4>
            <ul className="footer-list">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="footer-link">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p className="footer-copy">
          © {new Date().getFullYear()} AlphaLingo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
