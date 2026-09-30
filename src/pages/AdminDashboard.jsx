import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { FaSignOutAlt, FaPlus, FaEdit, FaTrash, FaUpload, FaCheck, FaTimes, FaUsers, FaTrophy, FaCalendarAlt, FaImages, FaRunning } from 'react-icons/fa';

const TABS = ['registrations', 'events', 'achievements', 'gallery', 'sports'];

export default function AdminDashboard() {
  const { user, profile, isAdmin, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('registrations');
  const [data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'add'|'edit', item: {} }

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login');
  }, [user, isAdmin, loading, navigate]);

  const load = useCallback(async () => {
    setFetching(true);
    let q;
    if (tab === 'registrations') q = supabase.from('registrations').select('*').order('created_at', { ascending: false });
    else if (tab === 'events') q = supabase.from('events').select('*').order('event_date');
    else if (tab === 'achievements') q = supabase.from('achievements').select('*').order('created_at', { ascending: false });
    else if (tab === 'gallery') q = supabase.from('gallery').select('*').order('created_at', { ascending: false });
    else if (tab === 'sports') q = supabase.from('sports').select('*').order('order_index');
    const { data: rows } = await q;
    setData(rows || []);
    setFetching(false);
  }, [tab]);

  useEffect(() => { if (isAdmin) load(); }, [tab, isAdmin, load]);

  const del = async (table, id) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from(table).delete().eq('id', id);
    load();
  };

  const updateRegStatus = async (id, status) => {
    await supabase.from('registrations').update({ status }).eq('id', id);
    load();
  };

  const handleLogout = async () => { await signOut(); navigate('/'); };

  if (loading) return <div className="admin-loading">Loading...</div>;

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>UNI-SPORTS</h2>
          <span>Admin Panel</span>
        </div>
        <nav className="admin-nav">
          {[
            { id: 'registrations', label: 'Registrations', icon: <FaUsers /> },
            { id: 'events', label: 'Events', icon: <FaCalendarAlt /> },
            { id: 'achievements', label: 'Achievements', icon: <FaTrophy /> },
            { id: 'gallery', label: 'Gallery', icon: <FaImages /> },
            { id: 'sports', label: 'Sports', icon: <FaRunning /> },
          ].map(t => (
            <button key={t.id} className={`admin-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </nav>
        <div className="admin-user">
          <p>{profile?.full_name || user?.email}</p>
          <button onClick={handleLogout} className="btn btn-sm btn-outline"><FaSignOutAlt /> Logout</button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <div className="admin-header">
          <h1>{tab.charAt(0).toUpperCase() + tab.slice(1)}</h1>
          {tab !== 'registrations' && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'add', item: {} })}>
              <FaPlus /> Add New
            </button>
          )}
        </div>

        {fetching ? <div className="admin-loading">Loading...</div> : (
          <>
            {/* Registrations Table */}
            {tab === 'registrations' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>USN</th><th>Sport</th><th>Course</th><th>Year</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(r => (
                      <tr key={r.id}>
                        <td>{r.name}</td><td>{r.usn}</td><td>{r.sport}</td><td>{r.course}</td><td>{r.year}</td><td>{r.email}</td>
                        <td><span className={`status-badge ${r.status}`}>{r.status}</span></td>
                        <td className="td-actions">
                          <button className="icon-btn green" title="Approve" onClick={() => updateRegStatus(r.id, 'approved')}><FaCheck /></button>
                          <button className="icon-btn gold" title="Trials" onClick={() => updateRegStatus(r.id, 'trials')}>T</button>
                          <button className="icon-btn red" title="Reject" onClick={() => updateRegStatus(r.id, 'rejected')}><FaTimes /></button>
                          <button className="icon-btn red" title="Delete" onClick={() => del('registrations', r.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Events Table */}
            {tab === 'events' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Category</th><th>Sport</th><th>Date</th><th>Venue</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(e => (
                      <tr key={e.id}>
                        <td>{e.title}</td><td>{e.category}</td><td>{e.sport}</td>
                        <td>{e.event_date}</td><td>{e.venue}</td>
                        <td><span className={`status-badge ${e.status}`}>{e.status}</span></td>
                        <td className="td-actions">
                          <button className="icon-btn gold" onClick={() => setModal({ type: 'edit', item: e })}><FaEdit /></button>
                          <button className="icon-btn red" onClick={() => del('events', e.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Achievements Table */}
            {tab === 'achievements' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Title</th><th>Sport</th><th>Year</th><th>Level</th><th>Type</th><th>Student</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(a => (
                      <tr key={a.id}>
                        <td>{a.title}</td><td>{a.sport}</td><td>{a.year}</td>
                        <td><span className={`medal-badge ${a.level}`}>{a.level}</span></td>
                        <td>{a.type}</td><td>{a.student_name || '—'}</td>
                        <td className="td-actions">
                          <button className="icon-btn gold" onClick={() => setModal({ type: 'edit', item: a })}><FaEdit /></button>
                          <button className="icon-btn red" onClick={() => del('achievements', a.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Gallery */}
            {tab === 'gallery' && <GalleryAdmin data={data} onRefresh={load} onDelete={(id) => del('gallery', id)} />}

            {/* Sports Table */}
            {tab === 'sports' && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Name</th><th>Team Info</th><th>Schedule</th><th>Actions</th></tr></thead>
                  <tbody>
                    {data.map(s => (
                      <tr key={s.id}>
                        <td><strong>{s.name}</strong></td>
                        <td>{s.team_info?.slice(0, 50)}...</td>
                        <td>{s.schedule?.slice(0, 40)}...</td>
                        <td className="td-actions">
                          <button className="icon-btn gold" onClick={() => setModal({ type: 'edit', item: s })}><FaEdit /></button>
                          <button className="icon-btn red" onClick={() => del('sports', s.id)}><FaTrash /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal */}
      {modal && <AdminModal tab={tab} modal={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </div>
  );
}

/* ── Gallery Admin Sub-Component ── */
function GalleryAdmin({ data, onRefresh, onDelete }) {
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Sports Day', sport: 'General', file: null });

  const handleUpload = async e => {
    e.preventDefault();
    if (!form.file || !form.title) return;
    setUploading(true);
    const ext = form.file.name.split('.').pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('gallery').upload(path, form.file);
    if (upErr) { alert(upErr.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('gallery').getPublicUrl(path);
    await supabase.from('gallery').insert([{ title: form.title, category: form.category, sport: form.sport, image_url: publicUrl }]);
    setForm({ title: '', category: 'Sports Day', sport: 'General', file: null });
    setUploading(false);
    onRefresh();
  };

  return (
    <div>
      <form className="gallery-upload-form" onSubmit={handleUpload}>
        <h3>Upload New Photo</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Title</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="Photo title" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {['Sports Day', 'Tournament', 'Team'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Sport</label>
            <select value={form.sport} onChange={e => setForm(p => ({ ...p, sport: e.target.value }))}>
              {['General', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Image File</label>
            <input type="file" accept="image/*" required onChange={e => setForm(p => ({ ...p, file: e.target.files[0] }))} />
          </div>
        </div>
        <button type="submit" className="btn btn-primary" disabled={uploading}><FaUpload /> {uploading ? 'Uploading...' : 'Upload'}</button>
      </form>
      <div className="gallery-admin-grid">
        {data.map(g => (
          <div key={g.id} className="gallery-admin-item">
            <img src={g.image_url} alt={g.title} />
            <div className="gallery-admin-info">
              <p>{g.title}</p>
              <span>{g.category}</span>
            </div>
            <button className="icon-btn red gallery-del" onClick={() => onDelete(g.id)}><FaTrash /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Generic Modal for Add/Edit ── */
function AdminModal({ tab, modal, onClose, onSave }) {
  const [form, setForm] = useState(modal.item || {});
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const save = async e => {
    e.preventDefault(); setSaving(true);
    const table = tab;
    const { id, created_at, ...rest } = form;
    if (modal.type === 'edit') {
      await supabase.from(table).update(rest).eq('id', id);
    } else {
      await supabase.from(table).insert([rest]);
    }
    setSaving(false); onSave();
  };

  const eventFields = [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', opts: ['Tournament', 'Championship', 'Meet', 'Trials'] },
    { name: 'sport', label: 'Sport', type: 'select', opts: ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics'] },
    { name: 'event_date', label: 'Date', type: 'date' },
    { name: 'event_time', label: 'Time', type: 'text' },
    { name: 'venue', label: 'Venue', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'status', label: 'Status', type: 'select', opts: ['open', 'upcoming', 'completed'] },
  ];
  const achievementFields = [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'sport', label: 'Sport', type: 'select', opts: ['Cricket', 'Football', 'Basketball', 'Volleyball', 'Badminton', 'Athletics', ''] },
    { name: 'year', label: 'Year', type: 'text' },
    { name: 'level', label: 'Level', type: 'select', opts: ['gold', 'silver', 'bronze'] },
    { name: 'type', label: 'Type', type: 'select', opts: ['championship', 'student', 'milestone'] },
    { name: 'student_name', label: 'Student Name (optional)', type: 'text' },
    { name: 'event_name', label: 'Event Name', type: 'text' },
  ];
  const sportsFields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'color', label: 'Color (hex)', type: 'text' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'team_info', label: 'Team Info', type: 'textarea' },
    { name: 'schedule', label: 'Schedule', type: 'text' },
    { name: 'how_to_join', label: 'How to Join', type: 'textarea' },
  ];

  const fields = tab === 'events' ? eventFields : tab === 'achievements' ? achievementFields : sportsFields;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{modal.type === 'edit' ? 'Edit' : 'Add'} {tab.slice(0, -1)}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={save} className="modal-form">
          <div className="form-grid">
            {fields.map(f => (
              <div key={f.name} className={`form-group ${f.type === 'textarea' ? 'full' : ''}`}>
                <label>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea name={f.name} value={form[f.name] || ''} onChange={handleChange} rows={3} />
                ) : f.type === 'select' ? (
                  <select name={f.name} value={form[f.name] || ''} onChange={handleChange}>
                    {f.opts.map(o => <option key={o} value={o}>{o || '— None —'}</option>)}
                  </select>
                ) : (
                  <input name={f.name} type={f.type} value={form[f.name] || ''} onChange={handleChange} />
                )}
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
