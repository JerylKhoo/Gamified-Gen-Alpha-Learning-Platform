import { useNavigate } from 'react-router-dom';
import Navbar from '../components/LandingPage/Navbar';
import Hero from '../components/LandingPage/Hero';
import Footer from '../components/LandingPage/Footer';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar
        onLogin={() => navigate('/auth?mode=login')}
        onSignup={() => navigate('/auth?mode=signup')}
      />
      <main>
        <Hero onSignup={() => navigate('/auth?mode=signup')} />
      </main>
      <Footer />
    </>
  );
}
