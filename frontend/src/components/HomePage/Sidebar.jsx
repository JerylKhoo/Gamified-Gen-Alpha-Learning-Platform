import { useState, useRef, useEffect } from 'react';
import '../../styles/Sidebar.css';

const navItems = [
  {
    label: 'Home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M20.25 10a1.25 1.25 0 1 0-2.5 0zm-14 0a1.25 1.25 0 1 0-2.5 0zm13.866 2.884a1.25 1.25 0 0 0 1.768-1.768zM12 3l.884-.884a1.25 1.25 0 0 0-1.768 0zm-9.884 8.116a1.25 1.25 0 0 0 1.768 1.768zM7 22.25h10v-2.5H7zM20.25 19v-9h-2.5v9zm-14 0v-9h-2.5v9zm15.634-7.884l-9-9l-1.768 1.768l9 9zm-10.768-9l-9 9l1.768 1.768l9-9zM17 22.25A3.25 3.25 0 0 0 20.25 19h-2.5a.75.75 0 0 1-.75.75zm-10-2.5a.75.75 0 0 1-.75-.75h-2.5A3.25 3.25 0 0 0 7 22.25z"/></svg>
    ),
  },
  {
    label: 'Learn',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    label: 'Community',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Dashboard',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="13" width="6" height="9" rx="1"/><rect x="9" y="1" width="6" height="21" rx="1"/><rect x="17" y="9" width="6" height="13" rx="1"/></svg>
    ),
  },
];

export default function Sidebar({ activePage, onNavigate, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-logo">
            <span className="logo-purple">Alpha</span>Lingo
          </div>
        )}
        <button className="sidebar-toggle" onClick={() => setCollapsed(c => !c)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14"><path fill="currentColor" fillRule="evenodd" d="M7.49 1.507A19 19 0 0 0 7 1.5c-1.045 0-2.076.094-3.103.208a2.505 2.505 0 0 0-2.2 2.205C1.588 4.933 1.5 5.96 1.5 7s.088 2.067.197 3.087a2.505 2.505 0 0 0 2.2 2.205c1.027.114 2.058.208 3.103.208q.246 0 .49-.007zM7 .25c1.115 0 2.202.1 3.24.215a3.755 3.755 0 0 1 3.306 3.315c.11 1.033.204 2.113.204 3.22s-.094 2.187-.204 3.22a3.755 3.755 0 0 1-3.305 3.314c-1.039.116-2.126.216-3.241.216s-2.202-.1-3.24-.215a3.755 3.755 0 0 1-3.306-3.316C.344 9.188.25 8.108.25 7s.094-2.187.204-3.22A3.755 3.755 0 0 1 3.759.465C4.798.35 5.885.25 7 .25m2.45 3.31h1.8a.5.5 0 0 1 0 1h-1.8a.5.5 0 0 1 0-1m1.8 2.45h-1.8a.5.5 0 0 0 0 1h1.8a.5.5 0 0 0 0-1" clipRule="evenodd"/></svg>
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ label, icon }) => (
          <button
            key={label}
            className={`sidebar-item ${activePage === label ? 'active' : ''}`}
            onClick={() => onNavigate?.(label)}
            title={collapsed ? label : undefined}
          >
            <span className="sidebar-icon">{icon}</span>
            {!collapsed && <span className="sidebar-label">{label}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom" ref={profileRef}>
        {profileOpen && (
          <div className="profile-menu">
            <button className="profile-menu-item" onClick={() => { onNavigate?.('Profile'); setProfileOpen(false); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20"/></svg>
              View Profile
            </button>
            <button className="profile-menu-item profile-menu-logout" onClick={() => { onLogout?.(); setProfileOpen(false); }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h7v2H5v14h7v2zm11-4l-1.375-1.45l2.55-2.55H9v-2h8.175l-2.55-2.55L16 7l5 5z"/></svg>
              Log Out
            </button>
          </div>
        )}
        <button
          className="sidebar-item"
          onClick={() => setProfileOpen(o => !o)}
          title={collapsed ? 'Profile' : undefined}
        >
          <span className="sidebar-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20"/></svg>
          </span>
          {!collapsed && <span className="sidebar-label">Profile</span>}
        </button>
      </div>
    </aside>
  );
}
