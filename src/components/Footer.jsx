import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import logoIcon from '../assets/logo-icon.jpg';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <img src={logoIcon} alt="CU" className="footer-logo" />
          <p><strong>UNI-SPORTS</strong></p>
          <p>Chanakya University</p>
          <p>Bengaluru, Karnataka, India</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            {['/', '/sports', '/events', '/registration', '/achievements', '/gallery'].map((path, i) => (
              <li key={path}><Link to={path}>{['Home','Sports','Events','Registration','Achievements','Gallery'][i]}</Link></li>
            ))}
          </ul>
        </div>
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📧 sports@chanakyauniversity.edu.in</p>
          <p>📞 +91 80 1234 5678</p>
          <p>🕐 Mon – Sat: 9AM – 6PM</p>
        </div>
        <div className="footer-social">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><FaFacebook /></a>
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="YouTube"><FaYoutube /></a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Chanakya University UNI-SPORTS. All rights reserved.</p>
      </div>
    </footer>
  );
}
