import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle } from 'react-icons/fa';

const initialForm = {
  name: '', usn: '', email: '', phone: '', course: '', year: '', sport: '', message: '',
};

export default function Registration() {
  const { user, profile } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user || profile) {
      setForm(prev => ({
        ...prev,
        email: user?.email || prev.email,
        name: profile?.full_name || prev.name,
      }));
    }
  }, [user, profile]);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: err } = await supabase.from('registrations').insert([{
        name: form.name,
        usn: form.usn,
        email: form.email,
        phone: form.phone,
        course: form.course,
        year: form.year,
        sport: form.sport,
        message: form.message,
        user_id: user?.id || null,
        created_at: new Date().toISOString(),
      }]);
      if (err) throw err;
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (success) return (
    <main className="page registration-page">
      <section className="page-hero"><h1>Sports Registration</h1></section>
      <section className="section">
        <div className="container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h2>Registration Successful!</h2>
            <p>Thank you for registering! Our sports team will contact you within 48 hours with further details.</p>
            <button className="btn btn-primary" onClick={() => setSuccess(false)}>Register Another</button>
          </div>
        </div>
      </section>
    </main>
  );

  return (
    <main className="page registration-page">
      <section className="page-hero">
        <h1>Sports Registration</h1>
        <p>Register for your favourite sport and represent Chanakya University.</p>
      </section>

      <section className="section">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-info">
              <h3>Why Register?</h3>
              <ul>
                <li>🏅 Represent Chanakya University</li>
                <li>🎓 Extra credits & certificate</li>
                <li>🏆 Compete in state & national events</li>
                <li>🤝 Build teamwork & leadership skills</li>
                <li>🏋️ Access to professional coaching</li>
              </ul>
              <div className="form-note">
                <p><strong>Note:</strong> Registrations are reviewed within 48 hours. Shortlisted students will be invited for trials.</p>
              </div>
            </div>

            <form className="reg-form" onSubmit={handleSubmit}>
              <h3>Registration Form</h3>
              {error && <div className="form-error">{error}</div>}
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input id="name" name="name" type="text" required value={form.name} onChange={handleChange} placeholder="Your full name" />
                </div>
                <div className="form-group">
                  <label htmlFor="usn">Student ID / USN *</label>
                  <input id="usn" name="usn" type="text" required value={form.usn} onChange={handleChange} placeholder="e.g., CU2022CS001" />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} placeholder="your.email@chanakyauniversity.edu.in" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input id="phone" name="phone" type="tel" required value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label htmlFor="course">Course / Branch *</label>
                  <select id="course" name="course" required value={form.course} onChange={handleChange}>
                    <option value="">Select Course</option>
                    <option>B.Tech Computer Science</option>
                    <option>B.Tech Mechanical Engineering</option>
                    <option>B.Tech ECE</option>
                    <option>BCA</option>
                    <option>MBA</option>
                    <option>BBA</option>
                    <option>B.Sc</option>
                    <option>BA</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <select id="year" name="year" required value={form.year} onChange={handleChange}>
                    <option value="">Select Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                    <option>PG 1st Year</option>
                    <option>PG 2nd Year</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="sport">Sport of Interest *</label>
                  <select id="sport" name="sport" required value={form.sport} onChange={handleChange}>
                    <option value="">Select Sport</option>
                    <option>Cricket</option>
                    <option>Football</option>
                    <option>Basketball</option>
                    <option>Volleyball</option>
                    <option>Badminton</option>
                    <option>Athletics</option>
                  </select>
                </div>
                <div className="form-group full">
                  <label htmlFor="message">Additional Information</label>
                  <textarea id="message" name="message" rows="3" value={form.message} onChange={handleChange} placeholder="Previous experience, achievements, etc." />
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Registration'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
