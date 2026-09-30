import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const initialGalleryItems = [
  { id: 1, category: 'Sports Day', title: 'Annual Sports Day Opening Ceremony', src: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=80', sport: 'General' },
  { id: 2, category: 'Tournament', title: 'Cricket Tournament Finals', src: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80', sport: 'Cricket' },
  { id: 3, category: 'Team', title: 'CU Football Team 2025', src: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80', sport: 'Football' },
  { id: 4, category: 'Tournament', title: 'Basketball Championship Game', src: 'https://images.unsplash.com/photo-1546519638405-a4e668020bdc?w=600&q=80', sport: 'Basketball' },
  { id: 5, category: 'Sports Day', title: 'Track Events – Athletics Meet', src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80', sport: 'Athletics' },
  { id: 6, category: 'Team', title: 'CU Badminton Squad', src: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80', sport: 'Badminton' },
  { id: 7, category: 'Tournament', title: 'Volleyball League Match', src: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80', sport: 'Volleyball' },
  { id: 8, category: 'Sports Day', title: 'Award Ceremony Highlights', src: 'https://images.unsplash.com/photo-1567958451986-2de427a4a0be?w=600&q=80', sport: 'General' },
  { id: 9, category: 'Team', title: 'CU Cricket Team Group Photo', src: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80', sport: 'Cricket' },
  { id: 10, category: 'Tournament', title: 'Football Quarter-Finals', src: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=600&q=80', sport: 'Football' },
  { id: 11, category: 'Sports Day', title: 'Long Jump Competition', src: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=600&q=80', sport: 'Athletics' },
  { id: 12, category: 'Team', title: 'CU Basketball Team 2025', src: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&q=80', sport: 'Basketball' },
];

const categories = ['All', 'Sports Day', 'Tournament', 'Team'];

export default function Gallery() {
  const [items, setItems] = useState(initialGalleryItems);
  const [filter, setFilter] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const fetchGallery = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setItems(data.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category,
          sport: d.sport,
          src: d.image_url,
        })));
      }
    } catch {
      // Fallback kept
    }
  };

  useEffect(() => {
    fetchGallery();
    const channel = supabase
      .channel('public:gallery')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, () => {
        fetchGallery();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = filter === 'All' ? items : items.filter(g => g.category === filter);

  return (
    <main className="page gallery-page">
      <section className="page-hero">
        <h1>Gallery</h1>
        <p>Relive the best moments from CU Sports events, tournaments, and celebrations.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            {categories.map(c => (
              <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>

          <div className="gallery-grid">
            {filtered.map(item => (
              <div key={item.id} className="gallery-item" onClick={() => setLightbox(item)}>
                <img src={item.src} alt={item.title} loading="lazy" />
                <div className="gallery-overlay">
                  <span className="gallery-cat">{item.category}</span>
                  <p>{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
            <img src={lightbox.src} alt={lightbox.title} />
            <div className="lightbox-info">
              <span>{lightbox.category}</span>
              <h3>{lightbox.title}</h3>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

