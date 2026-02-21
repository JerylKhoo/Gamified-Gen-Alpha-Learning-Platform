import '../../styles/Hero.css';
import heroBg from '../../assets/astronauts.mp4';

export default function Hero() {
  return (
    <section className="hero">
      {/* Background video */}
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroBg} type="video/mp4" />
      </video>

      {/* Dark gradient overlay so text stays readable */}
      <div className="hero-overlay" />

      <div className="hero-inner">
        {/* Left: text content */}
        <div className="hero-content">
          <span className="hero-eyebrow">✦ The Next-Gen Language Platform</span>
          <h1 className="hero-title">
            Speak <span className="hero-accent">Gen Alpha</span>,<br />No Cap.
          </h1>
          <p className="hero-desc">
            Explore. Discover. Grow. Master the slangs, memes, and lingo
            that define the internet's next generation.
          </p>
          <a href="#start" className="hero-btn">Start Now →</a>
        </div>

      </div>
    </section>
  );
}
