import Navbar from '../components/LandingPage/Navbar';
import Hero from '../components/LandingPage/Hero';
import Footer from '../components/LandingPage/Footer';

export default function LandingPage({ onLogin, onSignup }) {
  return (
    <>
      <Navbar onLogin={onLogin} onSignup={onSignup} />
      <main>
        <Hero />
      </main>
      <Footer />
    </>
  );
}
