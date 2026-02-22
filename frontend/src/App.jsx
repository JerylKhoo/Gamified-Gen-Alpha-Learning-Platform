import { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import HomePage from './pages/HomePage.jsx';

export default function App() {
  const [page, setPage] = useState('landing');
  const [authMode, setAuthMode] = useState('signup');

  const goToAuth = (mode = 'signup') => {
    setAuthMode(mode);
    setPage('auth');
  };

  if (page === 'auth') {
    return <AuthPage initialMode={authMode} onBack={() => setPage('landing')} onLogin={() => setPage('home')} />;
  }

  if (page === 'home') {
    return <HomePage />;
  }

  return <LandingPage onLogin={() => goToAuth('login')} onSignup={() => goToAuth('signup')} />;
}
