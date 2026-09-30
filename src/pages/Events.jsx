import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const categories = ['All', 'Tournament', 'Championship', 'Meet', 'Trials'];

const defaultEvents = [
  { id: 1, title: 'Inter-College Cricket Tournament', category: 'Tournament', sport: 'Cricket', event_date: '2026-10-15', event_time: '8:00 AM', venue: 'CU Cricket Ground', description: 'Annual inter-college cricket championship. Teams from 10+ colleges participating.', status: 'open' },
  { id: 2, title: 'CU Basketball Championship', category: 'Championship', sport: 'Basketball', event_date: '2026-10-22', event_time: '9:00 AM', venue: 'CU Sports Complex', description: 'Men\'s & Women\'s basketball championship for university teams.', status: 'open' },
  { id: 3, title: 'Athletics Meet 2026', category: 'Meet', sport: 'Athletics', event_date: '2026-11-05', event_time: '6:00 AM', venue: 'CU Track & Field', description: 'Annual athletics meet covering track and field events for all students.', status: 'open' },
  { id: 4, title: 'Football Team Trials', category: 'Trials', sport: 'Football', event_date: '2026-10-10', event_time: '7:00 AM', venue: 'CU Football Ground', description: 'Selection trials for the university football team 2026-27.', status: 'open' },
  { id: 5, title: 'Badminton Inter-Department Cup', category: 'Tournament', sport: 'Badminton', event_date: '2026-11-20', event_time: '10:00 AM', venue: 'CU Indoor Hall', description: 'Department-level badminton tournament open to all students.', status: 'upcoming' },
  { id: 6, title: 'Volleyball State Qualifier', category: 'Championship', sport: 'Volleyball', event_date: '2026-12-03', event_time: '8:30 AM', venue: 'CU Volleyball Court', description: 'Qualifier round for the state-level volleyball championship.', status: 'upcoming' },
];

export default function Events() {
  const [events, setEvents] = useState(defaultEvents);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase.from('events').select('*').order('event_date');
        if (!error && data && data.length > 0) {
          setEvents(data);
        }
      } catch {
        // Fallback kept
      }
    };
    fetchEvents();

    // Real-time subscription
    const channel = supabase.channel('events-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => fetchEvents())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = filter === 'All' ? events : events.filter(e => e.category === filter);

  const formatDate = (dateStr) => {
    if (!dateStr) return { month: '', day: '', year: '' };
    const d = new Date(dateStr);
    return {
      month: d.toLocaleString('en', { month: 'short' }),
      day: d.getDate(),
      year: d.getFullYear(),
    };
  };

  return (

    <main className="page events-page">
      <section className="page-hero">
        <h1>Events & Tournaments</h1>
        <p>Stay updated on all upcoming sports events, trials, and championships.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            {categories.map(c => (
              <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">No events found.</div>
          ) : (
            <div className="events-list">
              {filtered.map(ev => {
                const { month, day, year } = formatDate(ev.event_date);
                return (
                  <div key={ev.id} className="event-detail-card">
                    <div className="event-date-box">
                      <span className="event-month">{month}</span>
                      <span className="event-day">{day}</span>
                      <span className="event-year">{year}</span>
                    </div>
                    <div className="event-info">
                      <div className="event-tags">
                        <span className="event-tag">{ev.category}</span>
                        <span className="event-sport-tag">{ev.sport}</span>
                        <span className={`event-status ${ev.status}`}>{ev.status === 'open' ? '🟢 Open' : ev.status === 'upcoming' ? '🟡 Upcoming' : '⚫ Completed'}</span>
                      </div>
                      <h3>{ev.title}</h3>
                      <p>{ev.description}</p>
                      <div className="event-meta-row">
                        {ev.event_time && <span>🕐 {ev.event_time}</span>}
                        {ev.venue && <span>📍 {ev.venue}</span>}
                      </div>
                    </div>
                    <div className="event-action">
                      <Link to="/registration" className="btn btn-primary">Register</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
