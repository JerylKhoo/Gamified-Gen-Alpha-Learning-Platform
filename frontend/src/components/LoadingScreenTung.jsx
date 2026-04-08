import tungTung from '../assets/tungTung.png';

export default function LoadingScreenTung() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'radial-gradient(ellipse at center, #0d0b1e 0%, #050508 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <img
        src={tungTung}
        alt="Loading..."
        style={{
          width: 180,
          height: 180,
          objectFit: 'contain',
          animation: 'tungPulse 1s ease-in-out infinite',
        }}
      />
      <p style={{
        marginTop: 24,
        color: '#a78bfa',
        fontSize: '1rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        animation: 'tungFade 1s ease-in-out infinite',
      }}>
        Loading...
      </p>

      <style>{`
        @keyframes tungPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.25); }
        }
        @keyframes tungFade {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
