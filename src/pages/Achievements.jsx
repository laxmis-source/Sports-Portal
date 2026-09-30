import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FaTrophy, FaMedal, FaStar } from 'react-icons/fa';

const defaultAchievements = [
  { id: 1, title: 'South Zone Inter-University Champions', sport: 'Cricket', year: '2025', level: 'gold', type: 'championship' },
  { id: 2, title: 'Karnataka State Athletics Gold – 400m', sport: 'Athletics', year: '2025', level: 'gold', type: 'championship' },
  { id: 3, title: 'Inter-University Basketball Champions', sport: 'Basketball', year: '2024', level: 'gold', type: 'championship' },
  { id: 4, title: 'Football State Semi-Finals', sport: 'Football', year: '2024', level: 'silver', type: 'championship' },
  { id: 5, title: 'Badminton Mixed Doubles Silver', sport: 'Badminton', year: '2024', level: 'silver', type: 'championship' },
  { id: 6, title: 'Volleyball State League Runner-up', sport: 'Volleyball', year: '2023', level: 'silver', type: 'championship' },
  { id: 7, title: 'Best Batsman – South Zone 2025', sport: 'Cricket', year: '2025', level: 'gold', type: 'student', student_name: 'Arjun Rao', event_name: 'South Zone 2025' },
  { id: 8, title: 'State Gold – 100m Sprint', sport: 'Athletics', year: '2025', level: 'gold', type: 'student', student_name: 'Priya Sharma', event_name: 'State Athletics Meet' },
  { id: 9, title: 'Most Valuable Player – Inter-University', sport: 'Basketball', year: '2024', level: 'gold', type: 'student', student_name: 'Kiran Mehta', event_name: 'Inter-University Games' },
  { id: 10, title: 'State Singles Champion', sport: 'Badminton', year: '2025', level: 'gold', type: 'student', student_name: 'Divya Nair', event_name: 'State Badminton' },
  { id: 11, title: 'Top Scorer – Zonal Cup', sport: 'Football', year: '2024', level: 'silver', type: 'student', student_name: 'Rohan Singh', event_name: 'Zonal Cup 2024' },
  { id: 12, title: 'Sports Department awarded Best Department by CU', year: '2024', level: 'gold', type: 'milestone' },
  { id: 13, title: 'New state-of-the-art indoor sports complex inaugurated', year: '2023', level: 'gold', type: 'milestone' },
  { id: 14, title: 'First time CU qualified for National Inter-University Games', year: '2022', level: 'silver', type: 'milestone' },
];

export default function Achievements() {
  const [championships, setChampionships] = useState(defaultAchievements.filter(a => a.type === 'championship'));
  const [students, setStudents] = useState(defaultAchievements.filter(a => a.type === 'student'));
  const [milestones, setMilestones] = useState(defaultAchievements.filter(a => a.type === 'milestone'));
  const [stats, setStats] = useState({ total: '15+', athletes: '500+', medals: '30+', national: '5+' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase.from('achievements').select('*').order('year', { ascending: false });
        if (!error && data && data.length > 0) {
          setChampionships(data.filter(a => a.type === 'championship'));
          setStudents(data.filter(a => a.type === 'student'));
          setMilestones(data.filter(a => a.type === 'milestone'));
          setStats(s => ({
            ...s,
            total: data.filter(a => a.level === 'gold').length + '+',
            medals: data.filter(a => ['gold', 'silver', 'bronze'].includes(a.level)).length + '+',
          }));
        }
      } catch {
        // Fallback kept
      }
    };
    fetch();

    const channel = supabase.channel('achievements-ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'achievements' }, fetch)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);


  return (
    <main className="page achievements-page">
      <section className="page-hero">
        <h1>Achievements</h1>
        <p>Celebrating the excellence and dedication of Chanakya University athletes.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="stats-row">
            {[
              { num: stats.total, label: 'Trophies Won' },
              { num: stats.athletes, label: 'Student Athletes' },
              { num: stats.medals, label: 'State Medals' },
              { num: stats.national, label: 'National Appearances' },
            ].map(s => (
              <div key={s.label} className="big-stat">
                <span className="big-stat-num">{s.num}</span>
                <span className="big-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {championships.length > 0 && (
        <section className="section bg-dark">
          <div className="container">
            <h2 className="section-title">Championship Records</h2>
            <div className="achieve-list">
              {championships.map(c => (
                <div key={c.id} className={`achieve-row ${c.level}`}>
                  <FaTrophy className={`row-trophy ${c.level}`} />
                  <div>
                    <h4>{c.title}</h4>
                    <p>{c.sport}{c.sport && c.year ? ' · ' : ''}{c.year}</p>
                  </div>
                  <span className={`medal-badge ${c.level}`}>
                    {c.level === 'gold' ? '🥇 Gold' : c.level === 'silver' ? '🥈 Silver' : '🥉 Bronze'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {students.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">Student Stars</h2>
            <div className="students-grid">
              {students.map(s => (
                <div key={s.id} className="student-card">
                  <div className="student-avatar">{s.student_name?.split(' ').map(n => n[0]).join('') || '★'}</div>
                  <h4>{s.student_name}</h4>
                  <span className="student-sport">{s.sport}</span>
                  <p>{s.title}</p>
                  <span className="student-year">{s.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {milestones.length > 0 && (
        <section className="section bg-dark">
          <div className="container">
            <h2 className="section-title">Milestones</h2>
            <div className="timeline">
              {milestones.map((m, i) => (
                <div key={m.id} className="timeline-item">
                  <div className="timeline-icon">{i % 2 === 0 ? <FaStar /> : <FaMedal />}</div>
                  <div className="timeline-content">
                    <span className="timeline-year">{m.year}</span>
                    <p>{m.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
