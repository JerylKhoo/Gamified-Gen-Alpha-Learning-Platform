import '../../styles/Navbar.css';

export default function Navbar({ onLogin, onSignup, onLogoClick }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <a
          href={onLogoClick ? undefined : '#home'}
          className="navbar-logo"
          onClick={onLogoClick ?? undefined}
          style={onLogoClick ? { cursor: 'pointer' } : undefined}
        >
          <span className="logo-purple">Alpha</span>Lingo
        </a>

        {/* CTA buttons */}
        <div className="nav-cta">
          <button className="btn-outline" onClick={onLogin}>Log In</button>
          <button className="btn-primary" onClick={onSignup}>Get Started</button>
        </div>
      </div>
    </nav>
  );
}
