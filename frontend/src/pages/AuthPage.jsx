import { useState } from 'react';
import '../styles/AuthPage.css';
import Navbar from '../components/LandingPage/Navbar';

export default function AuthPage({ initialMode = 'signup', onBack }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');

  return (
    <div className="auth-page">
      <Navbar onLogoClick={onBack} onLogin={() => setIsLogin(true)} onSignup={() => setIsLogin(false)} />

      <div className="auth-content">
      <div className={`auth-box ${isLogin ? 'is-login' : ''}`}>

        {/* ── Sign Up Form ── */}
        <div className="auth-form-panel signup-panel">
          <h2 className="auth-title">Registration</h2>
          <div className="auth-fields">
            <div className="auth-input-group">
              <input type="text" placeholder="Username" className="auth-input" />
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
            </div>
            <div className="auth-input-group">
              <input type="email" placeholder="Email" className="auth-input" />
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" className="auth-input" />
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
            </div>
          </div>
          <button className="auth-submit">Register</button>
          <p className="auth-social-label">or register with social platforms</p>
          <div className="auth-social-btns">
            <button className="social-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#fff"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#fff"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#fff"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff"/>
              </svg>
              Sign up with Google
            </button>
          </div>
        </div>

        {/* ── Login Form ── */}
        <div className="auth-form-panel login-panel">
          <h2 className="auth-title">Login</h2>
          <div className="auth-fields">
            <div className="auth-input-group">
              <input type="text" placeholder="Username" className="auth-input" />
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
              </span>
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" className="auth-input" />
              <span className="auth-input-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
            </div>
          </div>
          <a href="#" className="auth-forgot">Forgot Password?</a>
          <button className="auth-submit">Login</button>
          <p className="auth-social-label">or login with social platforms</p>
          <div className="auth-social-btns">
            <button className="social-btn">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#fff"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#fff"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#fff"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        {/* ── Sliding Overlay ── */}
        <div className="auth-overlay">
          {/* Shown in signup mode (overlay on right) */}
          <div className="overlay-content overlay-signup">
            <h2 className="overlay-title">Welcome Back!</h2>
            <p className="overlay-sub">Already have an account?</p>
            <button className="overlay-btn" onClick={() => setIsLogin(true)}>
              Login
            </button>
          </div>

          {/* Shown in login mode (overlay on left) */}
          <div className="overlay-content overlay-login">
            <h2 className="overlay-title">Hello, Welcome!</h2>
            <p className="overlay-sub">Don't have an account?</p>
            <button className="overlay-btn" onClick={() => setIsLogin(false)}>
              Register
            </button>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
