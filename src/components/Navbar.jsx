import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoIcon from '../assets/logo-icon.jpg';
import { FaUserShield, FaSignOutAlt, FaUserGraduate } from 'react-icons/fa';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/sports', label: 'Sports' },
  { to: '/events', label: 'Events' },
  { to: '/registration', label: 'Registration' },
  { to: '/achievements', label: 'Achievements' },
  { to: '/gallery', label: 'Gallery' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logoIcon} alt="CU" className="navbar-logo" />
        <span className="navbar-title">UNI<span className="accent">-SPORTS</span></span>
      </Link>

      <ul className={`navbar-links ${open ? 'open' : ''}`}>
        {navLinks.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={location.pathname === to ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          </li>
        ))}

        <li className="nav-auth-item">
          {user ? (
            <div className="nav-user-ctrl">
              {isAdmin ? (
                <Link
                  to="/admin"
                  className="nav-admin-btn"
                  onClick={() => setOpen(false)}
                >
                  <FaUserShield /> Admin Panel
                </Link>
              ) : (
                <span className="nav-student-badge">
                  <FaUserGraduate /> {profile?.full_name || 'Student'}
                </span>
              )}
              <button
                className="nav-logout-btn"
                onClick={() => { signOut(); setOpen(false); }}
                title="Sign Out"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="nav-login-btn"
              onClick={() => setOpen(false)}
            >
              <FaUserShield /> Faculty / Admin
            </Link>
          )}
        </li>
      </ul>

      <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <span /><span /><span />
      </button>
    </nav>
  );
}

