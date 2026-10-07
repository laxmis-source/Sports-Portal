import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import logoFull from '../assets/logo-full.jpg';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'student' });
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: err } = await signIn(form.email, form.password);
    setLoading(false);
    if (err) {
      return setError(err.message);
    }
    // Use role from user_metadata (set during registration)
    const role = data?.user?.user_metadata?.role;
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Students always register with 'student' role
    const { data, error: err } = await signUp(form.email, form.password, form.full_name, 'student');
    if (err) {
      setLoading(false);
      return setError(err.message);
    }

    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: form.email,
          full_name: form.full_name,
          role: 'student',
        });
      } catch {
        // Trigger already handles it
      }
    }

    setLoading(false);
    setMsg('Account created successfully! You can now log in.');
    setTab('login');
  };


  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <img src={logoFull} alt="Chanakya University" className="auth-logo" />
          <h1>UNI-SPORTS</h1>
          <p>Chanakya University</p>
        </div>

        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>Login</button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>Register</button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {msg && <div className="form-success">{msg}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" required value={form.password} onChange={handleChange} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-group">
              <label>Full Name</label>
              <input name="full_name" type="text" required value={form.full_name} onChange={handleChange} placeholder="Your full name" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" required minLength={6} value={form.password} onChange={handleChange} placeholder="Min 6 characters" />
            </div>

            <button type="submit" className="btn btn-primary btn-lg auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}
        <Link to="/" className="auth-back">← Back to Home</Link>
      </div>
    </div>
  );
}
