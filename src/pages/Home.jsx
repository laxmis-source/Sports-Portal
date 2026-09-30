import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FaRunning, FaTrophy, FaCalendarAlt, FaUserPlus } from 'react-icons/fa';
import { GiCricketBat, GiSoccerBall, GiBasketballBall, GiShuttlecock } from 'react-icons/gi';

const defaultEvents = [
  { id: 1, title: 'Inter-College Cricket Tournament', event_date: '2026-10-15', venue: 'CU Cricket Ground', sport: 'Cricket' },
  { id: 2, title: 'Basketball Championship', event_date: '2026-10-22', venue: 'CU Sports Complex', sport: 'Basketball' },
  { id: 3, title: 'Athletics Meet 2026', event_date: '2026-11-05', venue: 'CU Track & Field', sport: 'Athletics' },
];

const defaultSports = [
  { icon: <GiCricketBat />, name: 'Cricket', desc: 'Premier university cricket with inter-college tournaments.' },
  { icon: <GiSoccerBall />, name: 'Football', desc: 'Passionate football teams competing across Karnataka.' },
  { icon: <GiBasketballBall />, name: 'Basketball', desc: 'High-energy basketball tournaments & campus leagues.' },
  { icon: <GiShuttlecock />, name: 'Badminton', desc: 'Singles and doubles competitions for all skill levels.' },
];

const defaultAchievements = [
  { year: '2025', title: 'South Zone Champions', sport: 'Cricket' },
  { year: '2025', title: 'Karnataka State Gold', sport: 'Athletics' },
  { year: '2024', title: 'Inter-University Champions', sport: 'Basketball' },
];

const sportIcons = {
  Cricket: <GiCricketBat />,
  Football: <GiSoccerBall />,
  Basketball: <GiBasketballBall />,
  Badminton: <GiShuttlecock />,
  Volleyball: <FaRunning />,
  Athletics: <FaRunning />,
};

export default function Home() {
  const [events, setEvents] = useState(defaultEvents);
  const [sports, setSports] = useState(defaultSports);
  const [achievements, setAchievements] = useState(defaultAchievements);

  useEffect(() => {
    async function loadData() {
      try {
        const [evRes, spRes, acRes] = await Promise.all([
          supabase.from('events').select('*').order('event_date').limit(3),
          supabase.from('sports').select('*').order('order_index').limit(4),
          supabase.from('achievements').select('*').order('created_at', { ascending: false }).limit(3),
        ]);

        if (evRes.data && evRes.data.length > 0) setEvents(evRes.data);
        if (spRes.data && spRes.data.length > 0) {
          setSports(spRes.data.map(s => ({
            name: s.name,
            desc: s.description?.slice(0, 80) + '...',
            icon: sportIcons[s.name] || <FaRunning />,
          })));
        }
        if (acRes.data && acRes.data.length > 0) setAchievements(acRes.data);
      } catch {
        // Fallback kept
      }
    }
    loadData();
  }, []);

  return (
    <main className="page home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="hero-badge">🏆 Chanakya University</span>
          <h1 className="hero-title">UNI-SPORTS</h1>
          <p className="hero-tagline">Discover. Participate. Compete.</p>
          <p className="hero-desc">Your one-stop digital hub for university sports — events, registrations, achievements & more.</p>
          <div className="hero-btns">
            <Link to="/sports" className="btn btn-primary">Explore Sports</Link>
            <Link to="/events" className="btn btn-outline">Upcoming Events</Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat"><span className="stat-num">6+</span><span>Sports</span></div>
          <div className="stat"><span className="stat-num">500+</span><span>Athletes</span></div>
          <div className="stat"><span className="stat-num">30+</span><span>Trophies</span></div>
          <div className="stat"><span className="stat-num">12+</span><span>Events/yr</span></div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="section quick-links-section">
        <div className="container">
          <div className="quick-grid">
            {[
              { icon: <FaRunning />, label: 'Explore Sports', to: '/sports', color: '#c9a227' },
              { icon: <FaCalendarAlt />, label: 'View Events', to: '/events', color: '#1a3a5c' },
              { icon: <FaUserPlus />, label: 'Register Now', to: '/registration', color: '#c9a227' },
              { icon: <FaTrophy />, label: 'Achievements', to: '/achievements', color: '#1a3a5c' },
            ].map(({ icon, label, to, color }) => (
              <Link key={to} to={to} className="quick-card" style={{ '--accent': color }}>
                <span className="quick-icon">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section bg-dark">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <Link to="/events" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="events-grid">
            {events.map(ev => (
              <div key={ev.id} className="event-card">
                <span className="event-tag">{ev.sport || ev.category || 'Sports'}</span>
                <h3>{ev.title}</h3>
                <p className="event-meta">📅 {ev.event_date}</p>
                <p className="event-meta">📍 {ev.venue}</p>
                <Link to="/registration" className="btn btn-sm btn-primary mt">Register</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Sports */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Sports</h2>
            <Link to="/sports" className="btn btn-sm btn-outline">All Sports</Link>
          </div>
          <div className="sports-grid">
            {sports.map(s => (
              <div key={s.name} className="sport-card">
                <div className="sport-icon">{s.icon}</div>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
                <Link to="/sports" className="sport-link">Learn More →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Register CTA */}
      <section className="section cta-section">
        <div className="container cta-inner">
          <div>
            <h2>Ready to Play?</h2>
            <p>Register for your sport today and represent Chanakya University!</p>
          </div>
          <Link to="/registration" className="btn btn-primary btn-lg">Register Now</Link>
        </div>
      </section>

      {/* Recent Achievements */}
      <section className="section bg-dark">
        <div className="container">
          <div className="section-header">
            <h2>Recent Achievements</h2>
            <Link to="/achievements" className="btn btn-sm btn-outline">View All</Link>
          </div>
          <div className="achieve-grid">
            {achievements.map((a, i) => (
              <div key={a.id || i} className="achieve-card">
                <FaTrophy className="achieve-icon" />
                <div>
                  <h4>{a.title}</h4>
                  <p>{a.sport ? `${a.sport} · ` : ''}{a.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

