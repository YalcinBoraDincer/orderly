import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) await api.post(`/api/auth/logout?userId=${userId}`);
    } catch (e) { /* silent */ }
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard',   label: 'Masalar',        roles: ['ADMIN', 'WAITER', 'KITCHEN'] },
    { path: '/reservations',label: 'Rezervasyonlar', roles: ['ADMIN', 'WAITER'] },
    { path: '/kitchen',     label: 'Mutfak',         roles: ['ADMIN', 'KITCHEN'] },
    { path: '/admin',       label: 'Yönetim',        roles: ['ADMIN'] },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.logo} onClick={() => navigate('/dashboard')}>
        <span style={styles.logoText}>Orderly</span>
      </div>

      <div style={styles.links}>
        {navLinks
          .filter(link => link.roles.includes(user?.role))
          .map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={location.pathname === link.path ? styles.linkActive : styles.link}
            >
              {link.label}
            </button>
          ))}
      </div>

      <div style={styles.userArea}>
        <div style={styles.userInfo}>
          <span style={styles.username}>{user?.username}</span>
          <span style={styles.role}>{user?.role}</span>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Çıkış
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 64px',
    height: '80px',
    backgroundColor: 'rgba(19, 19, 19, 0.8)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: '700',
    color: '#f2ca50',
    letterSpacing: '-0.02em',
  },
  links: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  link: {
    padding: '10px 20px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'rgba(208, 197, 175, 0.7)',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    transition: 'all 0.3s',
    border: 'none',
  },
  linkActive: {
    padding: '10px 20px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: '#f2ca50',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #f2ca50',
    paddingBottom: '8px',
  },
  userArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  username: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e2e1',
  },
  role: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '11px',
    color: '#d4af37',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#e5e2e1',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    transition: 'all 0.2s',
  },
};
