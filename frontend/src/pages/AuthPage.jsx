import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/LandingPage/Navbar';
import { supabase } from '../lib/supabaseClient';

const inputCls =
  'w-full py-[0.7rem] pl-[0.9rem] pr-10 bg-[#1a1530] border border-[rgba(139,92,246,0.2)] rounded-lg text-[0.95rem] text-[#f0eeff] outline-none transition-all placeholder:text-[#6060a0] focus:bg-[#201a40] focus:border-[rgba(139,92,246,0.6)] focus:ring-2 focus:ring-[rgba(139,92,246,0.2)]';

const submitBtnCls =
  'w-full py-3 bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white text-[0.95rem] font-bold border-none rounded-xl cursor-pointer transition-all shadow-[0_4px_18px_rgba(139,92,246,0.35)] hover:opacity-90 hover:shadow-[0_6px_24px_rgba(139,92,246,0.5)]';

const googleBtnCls =
  'w-full py-3 px-5 rounded-xl border-none bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-[0.95rem] font-bold text-white cursor-pointer flex items-center justify-center gap-3 shadow-[0_4px_18px_rgba(139,92,246,0.35)] transition-all hover:opacity-90';

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
);
const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#fff"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#fff"/>
    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#fff"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#fff"/>
  </svg>
);

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');

  async function handleGoogleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_center,#0d0b1e_0%,#050508_100%)] flex flex-col">
      <Navbar
        onLogoClick={() => navigate('/')}
        onLogin={() => setIsLogin(true)}
        onSignup={() => setIsLogin(false)}
      />

      <div className="flex-1 flex items-center justify-center p-8 max-sm:p-4">
        {/* Auth card */}
        <div className="relative w-full max-w-[860px] h-[520px] max-sm:h-auto max-sm:max-w-[400px] bg-[#0d0b1e] rounded-2xl overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.7),0_0_0_1px_rgba(139,92,246,0.2)]">

          {/* ── Sign Up Panel ── */}
          <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col items-center justify-center px-12 py-10 bg-[#0d0b1e] gap-4 transition-opacity duration-[400ms] max-sm:static max-sm:w-full max-sm:px-6 ${isLogin ? 'opacity-0 pointer-events-none max-sm:hidden' : 'opacity-100'}`}>
            <h2 className="text-[1.6rem] font-extrabold text-[#f0eeff] m-0 mb-2">Registration</h2>

            <div className="w-full flex flex-col gap-3">
              <div className="relative">
                <input type="text" placeholder="Username" className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060a0] pointer-events-none"><IconUser /></span>
              </div>
              <div className="relative">
                <input type="email" placeholder="Email" className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060a0] pointer-events-none"><IconEmail /></span>
              </div>
              <div className="relative">
                <input type="password" placeholder="Password" className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060a0] pointer-events-none"><IconLock /></span>
              </div>
            </div>

            <button className={submitBtnCls}>Register</button>
            <p className="text-[0.82rem] text-[#6060a0] m-0">or register with social platforms</p>
            <div className="w-full">
              <button className={googleBtnCls} onClick={handleGoogleSignIn}><GoogleIcon /> Sign up with Google</button>
            </div>
          </div>

          {/* ── Login Panel ── */}
          <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col items-center justify-center px-12 py-10 bg-[#0d0b1e] gap-4 transition-opacity duration-[400ms] max-sm:static max-sm:w-full max-sm:px-6 ${isLogin ? 'opacity-100' : 'opacity-0 pointer-events-none max-sm:hidden'}`}>
            <h2 className="text-[1.6rem] font-extrabold text-[#f0eeff] m-0 mb-2">Login</h2>

            <div className="w-full flex flex-col gap-3">
              <div className="relative">
                <input type="text" placeholder="Username" className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060a0] pointer-events-none"><IconUser /></span>
              </div>
              <div className="relative">
                <input type="password" placeholder="Password" className={inputCls} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6060a0] pointer-events-none"><IconLock /></span>
              </div>
            </div>

            <a href="#" className="self-end text-[0.82rem] text-[#8b5cf6] no-underline -mt-1 hover:underline">Forgot Password?</a>
            <button className={submitBtnCls} onClick={() => navigate('/home')}>Login</button>
            <p className="text-[0.82rem] text-[#6060a0] m-0">or login with social platforms</p>
            <div className="w-full">
              <button className={googleBtnCls} onClick={handleGoogleSignIn}><GoogleIcon /> Sign in with Google</button>
            </div>
          </div>

          {/* ── Sliding Overlay ── */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full bg-gradient-to-br from-[#6d28d9] to-[#8b5cf6] z-10 overflow-hidden transition-transform duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)] max-sm:hidden ${isLogin ? '-translate-x-full' : ''}`}>

            {/* Signup side content */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center px-10 py-12 gap-4 text-center transition-all duration-300 delay-150 ${isLogin ? 'opacity-0 translate-x-8 pointer-events-none' : 'opacity-100 translate-x-0'}`}>
              <h2 className="text-[1.7rem] font-extrabold text-white m-0">Welcome Back!</h2>
              <p className="text-[0.9rem] text-white/75 m-0">Already have an account?</p>
              <button
                className="mt-2 px-8 py-[0.6rem] border-2 border-white rounded-full bg-transparent text-white text-[0.9rem] font-bold tracking-[0.05em] cursor-pointer transition-all hover:bg-white/15"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </div>

            {/* Login side content */}
            <div className={`absolute inset-0 flex flex-col items-center justify-center px-10 py-12 gap-4 text-center transition-all duration-300 delay-150 ${isLogin ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
              <h2 className="text-[1.7rem] font-extrabold text-white m-0">Hello, Welcome!</h2>
              <p className="text-[0.9rem] text-white/75 m-0">Don't have an account?</p>
              <button
                className="mt-2 px-8 py-[0.6rem] border-2 border-white rounded-full bg-transparent text-white text-[0.9rem] font-bold tracking-[0.05em] cursor-pointer transition-all hover:bg-white/15"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
