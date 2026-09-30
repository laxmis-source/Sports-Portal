import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const defaultSports = [
  {
    id: 'cricket',
    name: 'Cricket',
    color: '#c9a227',
    description: 'Cricket is one of the most popular sports at Chanakya University. Our team competes in inter-college and university-level tournaments across Karnataka.',
    team_info: 'CU Cricket XI – 15 players, coached by Mr. Rajan Kumar.',
    schedule: 'Practice: Mon, Wed, Fri – 5AM to 7AM at CU Cricket Ground',
    how_to_join: 'Attend trials every semester. Register online and appear for selection rounds.',
    order_index: 1,
  },
  {
    id: 'football',
    name: 'Football',
    color: '#1a6b3f',
    description: 'CU Football team is renowned for its energetic gameplay. Participate in intra-college leagues and represent the university at state-level competitions.',
    team_info: 'CU United FC – 22 players, coached by Mr. Suresh Nair.',
    schedule: 'Practice: Tue, Thu, Sat – 6AM to 8AM at CU Football Ground',
    how_to_join: 'Open trials held at the start of each academic year. All courses eligible.',
    order_index: 2,
  },
  {
    id: 'basketball',
    name: 'Basketball',
    color: '#c95b27',
    description: 'CU Basketball offers both men\'s and women\'s teams focusing on teamwork, strategy, and high-energy competitive play.',
    team_info: 'CU Hoops (Men & Women) – 24 players total, coached by Ms. Priya Shetty.',
    schedule: 'Practice: Daily 6PM–8PM at CU Sports Complex Court',
    how_to_join: 'Register online, attend walk-in trials on the first weekend of each semester.',
    order_index: 3,
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    color: '#27a2c9',
    description: 'Volleyball is a team sport where coordination and endurance are key. CU fields both indoor and beach volleyball teams.',
    team_info: 'CU Spikes – 18 players, coached by Mr. Anil Rao.',
    schedule: 'Practice: Mon, Wed, Fri – 4PM–6PM at CU Volleyball Court',
    how_to_join: 'Open to all students. Trials held in August and January.',
    order_index: 4,
  },
  {
    id: 'badminton',
    name: 'Badminton',
    color: '#8b27c9',
    description: 'CU Badminton caters to singles, doubles, and mixed doubles. Regular intra-college and inter-university tournaments.',
    team_info: 'CU Shuttlers – 12 players, coached by Ms. Divya Menon.',
    schedule: 'Practice: Tue, Thu – 5PM–7PM at CU Indoor Badminton Hall',
    how_to_join: 'Trials conducted at start of semester. Racket provided to selected players.',
    order_index: 5,
  },
  {
    id: 'athletics',
    name: 'Athletics',
    color: '#c92747',
    description: 'CU Athletics covers track events (100m, 200m, 400m, relays) and field events (long jump, high jump, shot put, discus).',
    team_info: 'CU Track & Field – 30+ athletes, coached by Mr. Vijay Thakur.',
    schedule: 'Training: Daily 5AM–7AM at CU Athletic Track',
    how_to_join: 'Performance-based selection. Participate in qualifying rounds every August.',
    order_index: 6,
  },
];

const defaultSportAchievements = {
  cricket: ['South Zone Champions 2025', 'State Runner-up 2024', 'Best Batting Average 2023'],
  football: ['Karnataka Inter-University Semifinal 2024', 'Intra-College Champions 2025'],
  basketball: ['Inter-University Champions 2024', 'Women\'s State Bronze 2025'],
  volleyball: ['State League Runner-up 2024', 'CU Sports Day Champions 2025'],
  badminton: ['Karnataka State Gold – Singles 2025', 'Mixed Doubles State Silver 2024'],
  athletics: ['Karnataka State Gold – 400m 2025', '4×100 Relay Silver 2024', 'Best Sports Department Award 2025'],
};

export default function Sports() {
  const [sportsData, setSportsData] = useState(defaultSports);
  const [active, setActive] = useState(defaultSports[0]);
  const [sportAchievements, setSportAchievements] = useState(defaultSportAchievements.cricket);

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const { data, error } = await supabase.from('sports').select('*').order('order_index');
        if (!error && data && data.length > 0) {
          setSportsData(data);
          setActive(data[0]);
        }
      } catch {
        // Fallback kept
      }
    };
    fetchSports();
  }, []);

  useEffect(() => {
    if (!active) return;
    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase.from('sport_achievements').select('*').eq('sport_id', active.id);
        if (!error && data && data.length > 0) {
          setSportAchievements(data.map(d => d.title));
        } else if (defaultSportAchievements[active.id]) {
          setSportAchievements(defaultSportAchievements[active.id]);
        }
      } catch {
        if (defaultSportAchievements[active.id]) {
          setSportAchievements(defaultSportAchievements[active.id]);
        }
      }
    };
    fetchAchievements();
  }, [active]);


  const sportIcons = {
    Cricket: '🏏', Football: '⚽', Basketball: '🏀',
    Volleyball: '🏐', Badminton: '🏸', Athletics: '🏃',
  };

  return (
    <main className="page sports-page">
      <section className="page-hero">
        <h1>Our Sports</h1>
        <p>Explore the sports offered at Chanakya University and join your passion.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="sports-tabs">
            {sportsData.map(s => (
              <button
                key={s.id}
                className={`sport-tab ${active?.id === s.id ? 'active' : ''}`}
                onClick={() => setActive(s)}
                style={{ '--tab-color': s.color }}
              >
                <span className="tab-icon">{sportIcons[s.name] || '🏅'}</span>
                {s.name}
              </button>
            ))}
          </div>

          {active && (
            <div className="sport-detail" style={{ '--sport-color': active.color }}>
              <div className="sport-detail-header">
                <span className="sport-detail-icon" style={{ fontSize: '3.5rem' }}>{sportIcons[active.name] || '🏅'}</span>
                <div>
                  <h2>{active.name}</h2>
                  <span className="sport-badge" style={{ background: active.color }}>{active.name}</span>
                </div>
              </div>
              <p className="sport-detail-desc">{active.description}</p>
              <div className="sport-info-grid">
                <div className="info-card">
                  <h4>🏅 Team</h4>
                  <p>{active.team_info}</p>
                </div>
                <div className="info-card">
                  <h4>📅 Practice Schedule</h4>
                  <p>{active.schedule}</p>
                </div>
                <div className="info-card">
                  <h4>🎯 How to Join</h4>
                  <p>{active.how_to_join}</p>
                </div>
                <div className="info-card">
                  <h4>🏆 Achievements</h4>
                  {sportAchievements.length > 0 ? (
                    <ul>{sportAchievements.map((a, i) => <li key={i}>• {typeof a === 'string' ? a : a.title}</li>)}</ul>
                  ) : <p>No achievements listed yet.</p>}
                </div>
              </div>
              <a href="/registration" className="btn btn-primary mt">Register for {active.name}</a>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
