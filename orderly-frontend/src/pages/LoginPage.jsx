import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      console.log('LOGIN RESPONSE:', response.data); // ← ekle
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <div style={styles.bgGlow} />

      <div style={styles.card}>
        <div style={styles.logoArea}>
          <h1 style={styles.logoText}>Orderly</h1>
          <div style={styles.divider} />
          <p style={styles.subtitle}>Premium Restoran Yönetimi</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>KULLANICI ADI</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="kullanici_adi"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>ŞİFRE</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p style={styles.footer}>Orderly Hospitality</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131313',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px',
    padding: '56px 48px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '48px',
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '40px',
    fontWeight: '700',
    color: '#f2ca50',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  divider: {
    width: '60px',
    height: '1px',
    background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)',
    margin: '16px auto',
  },
  subtitle: {
    fontFamily: "'Manrope', sans-serif",
    color: '#d0c5af',
    fontSize: '14px',
    fontWeight: '500',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    color: '#d0c5af',
    letterSpacing: '0.1em',
  },
  input: {
    backgroundColor: 'transparent',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '1px solid rgba(229, 226, 225, 0.3)',
    borderRadius: '0',
    padding: '14px 0',
    color: '#e5e2e1',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: "'Manrope', sans-serif",
  },
  error: {
    fontFamily: "'Manrope', sans-serif",
    color: '#ffb4ab',
    fontSize: '13px',
    backgroundColor: 'rgba(147, 0, 10, 0.15)',
    border: '1px solid rgba(147, 0, 10, 0.3)',
    borderRadius: '4px',
    padding: '12px 14px',
  },
  button: {
    backgroundColor: '#d4af37',
    color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif",
    fontWeight: '700',
    fontSize: '14px',
    padding: '16px',
    borderRadius: '4px',
    marginTop: '8px',
    transition: 'all 0.3s',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },
  footer: {
    fontFamily: "'Manrope', sans-serif",
    textAlign: 'center',
    color: 'rgba(208, 197, 175, 0.4)',
    fontSize: '12px',
    letterSpacing: '0.05em',
    marginTop: '32px',
  },
};
