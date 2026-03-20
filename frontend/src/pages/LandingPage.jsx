import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/LandingPage/Navbar';
import Hero from '../components/LandingPage/Hero';
import Features from '../components/LandingPage/Features';
import HowItWorks from '../components/LandingPage/HowItWorks';
import Footer from '../components/LandingPage/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('snap-landing');
    return () => document.documentElement.classList.remove('snap-landing');
  }, []);

  return (
    <>
      <Navbar
        onLogin={() => navigate('/auth?mode=login')}
        onSignup={() => navigate('/auth?mode=signup')}
      />
      <main>
        <Hero onSignup={() => navigate('/auth?mode=signup')} />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
