import { HighwayScene, updateScroll } from "../components/three/HighwayScene";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const lastScroll = useRef(0);
  const [showIndicator, setShowIndicator] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    let rafId: number;
    let hidden = false;

    const onScroll = () => {
      cancelAnimationFrame(rafId);
      
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;

      if (!hidden && currentScroll > 20) {
        hidden = true;
        setShowIndicator(false);
      }
      
      if (currentScroll >= maxScroll - 50) {
        setAtBottom(true);
      } else {
        setAtBottom(false);
      }

      rafId = requestAnimationFrame(() => {
        const progress = maxScroll > 0 ? currentScroll / maxScroll : 0;
        const velocity = (currentScroll - lastScroll.current) / window.innerHeight;
        lastScroll.current = currentScroll;
        updateScroll(Math.min(progress, 1), velocity);
      });
    };

    onScroll();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const handleEnterShowroom = () => {
    navigate("/showroom");
  };

  return (
    <>
      {/* Fixed 3D background */}
      <HighwayScene />

      {/* Fixed UI overlay */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10, pointerEvents: 'none' }}>
        {/* CloudCar Logo */}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 24,
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: 20,
          letterSpacing: '0.12em',
          color: '#FFD700',
          textShadow: '0 0 15px rgba(255,215,0,0.3)',
        }}>
          ADYX
        </div>

        {/* Skip Intro Button */}
        <button
          onClick={handleEnterShowroom}
          style={{
            position: 'absolute',
            top: 24,
            right: 24,
            pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            padding: '8px 16px',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            borderRadius: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)'
          }}
        >
          Skip Intro
        </button>

        {/* Scroll to Start */}
        <div style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          opacity: (showIndicator && !atBottom) ? 1 : 0,
          transition: 'opacity 0.6s ease-out',
        }}>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 11,
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: '#FFD700',
            opacity: 0.6,
          }}>
            Scroll to Start
          </span>
          <div style={{
            width: 1,
            height: 30,
            background: 'linear-gradient(to bottom, rgba(255,215,0,0.5), transparent)',
          }} />
        </div>

        {/* Explore Showroom Button (Appears at bottom) */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: atBottom ? 1 : 0,
          transition: 'all 0.8s ease-out',
          pointerEvents: atBottom ? 'auto' : 'none',
          textAlign: 'center'
        }}>
          <h2 style={{
            color: 'white',
            fontSize: '2rem',
            fontWeight: 900,
            fontStyle: 'italic',
            textTransform: 'uppercase',
            marginBottom: '2rem',
            letterSpacing: '-0.05em'
          }}>
            The Journey Begins
          </h2>
          <button
            onClick={handleEnterShowroom}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '16px 48px',
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.4em',
              borderRadius: '99px',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
            }}
          >
            Explore Showroom
          </button>
        </div>
      </div>

      {/* Scroll spacer — must be above canvas to receive scroll */}
      <div style={{ height: '1000vh', position: 'relative', zIndex: 5 }} />
    </>
  );
};

export default Index;
