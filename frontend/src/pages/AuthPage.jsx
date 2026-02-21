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
              <span className="auth-input-icon">&#128100;</span>
            </div>
            <div className="auth-input-group">
              <input type="email" placeholder="Email" className="auth-input" />
              <span className="auth-input-icon">&#9993;</span>
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" className="auth-input" />
              <span className="auth-input-icon">&#128274;</span>
            </div>
          </div>
          <button className="auth-submit">Register</button>
          <p className="auth-social-label">or register with social platforms</p>
          <div className="auth-social-btns">
            <button className="social-btn">G</button>
            <button className="social-btn">f</button>
            <button className="social-btn">&#9651;</button>
            <button className="social-btn">in</button>
          </div>
        </div>

        {/* ── Login Form ── */}
        <div className="auth-form-panel login-panel">
          <h2 className="auth-title">Login</h2>
          <div className="auth-fields">
            <div className="auth-input-group">
              <input type="text" placeholder="Username" className="auth-input" />
              <span className="auth-input-icon">&#128100;</span>
            </div>
            <div className="auth-input-group">
              <input type="password" placeholder="Password" className="auth-input" />
              <span className="auth-input-icon">&#128274;</span>
            </div>
          </div>
          <a href="#" className="auth-forgot">Forgot Password?</a>
          <button className="auth-submit">Login</button>
          <p className="auth-social-label">or login with social platforms</p>
          <div className="auth-social-btns">
            <button className="social-btn">G</button>
            <button className="social-btn">f</button>
            <button className="social-btn">&#9651;</button>
            <button className="social-btn">in</button>
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
