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
    } catch (e) { /* sessizce devam et */ }
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: '🏠 Masalar', roles: ['ADMIN', 'WAITER', 'KITCHEN'] },
    { path: '/kitchen',   label: '👨‍🍳 Mutfak',  roles: ['ADMIN', 'KITCHEN'] },
    { path: '/admin',     label: '⚙️ Yönetim', roles: ['ADMIN'] },
  ];

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🍽️</span>
        <span style={styles.logoText}>Orderly</span>
      </div>

      {/* Linkler */}
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

      {/* Kullanıcı Bilgisi */}
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
    padding: '0 32px',
    height: '64px',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoIcon: { fontSize: '24px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  links: {
    display: 'flex',
    gap: '8px',
  },
  link: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#8b8b9e',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  linkActive: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(245,158,11,0.12)',
    color: '#f59e0b',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid rgba(245,158,11,0.2)',
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
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f1f1',
  },
  role: {
    fontSize: '11px',
    color: '#f59e0b',
    fontWeight: '500',
    letterSpacing: '1px',
  },
  logoutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    color: '#ef4444',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
};
