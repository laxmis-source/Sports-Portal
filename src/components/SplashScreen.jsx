import { useEffect, useState } from 'react';
import logoFull from '../assets/logo-full.jpg';

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFade(true), 2200);
    const doneTimer = setTimeout(() => onFinish(), 2900);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onFinish]);

  return (
    <div className={`splash-screen ${fade ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrapper">
          <img src={logoFull} alt="Chanakya University" className="splash-logo" />
        </div>
        <div className="splash-text">
          <h1 className="splash-title">UNI-SPORTS</h1>
          <p className="splash-tagline">Discover. Participate. Compete.</p>
        </div>
        <div className="splash-loader">
          <div className="splash-bar"></div>
        </div>
      </div>
    </div>
  );
}
