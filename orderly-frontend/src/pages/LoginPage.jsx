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
    e.preventDefault(); // Sayfanın yenilenmesini engelle
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { username, password });
      login(response.data);         // Token'ları kaydet
      navigate('/dashboard');        // Dashboard'a yönlendir
    } catch (err) {
      setError('Kullanıcı adı veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Arka plan efekti */}
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoArea}>
          <span style={styles.logoIcon}>🍽️</span>
          <h1 style={styles.logoText}>Orderly</h1>
          <p style={styles.subtitle}>Restoran Yönetim Sistemi</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kullanıcı Adı</label>
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
            <label style={styles.label}>Şifre</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              required
            />
          </div>

          {/* Hata mesajı */}
          {error && <p style={styles.error}>⚠️ {error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.6 } : styles.button}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
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
    backgroundColor: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGlow1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
    top: '-100px',
    left: '-100px',
    pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
    bottom: '-80px',
    right: '-80px',
    pointerEvents: 'none',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    backdropFilter: 'blur(20px)',
    position: 'relative',
    zIndex: 1,
  },
  logoArea: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  logoIcon: {
    fontSize: '48px',
  },
  logoText: {
    fontSize: '32px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginTop: '8px',
  },
  subtitle: {
    color: '#8b8b9e',
    fontSize: '14px',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#8b8b9e',
    letterSpacing: '0.5px',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#f1f1f1',
    fontSize: '15px',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'Inter, sans-serif',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  button: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: 'white',
    fontWeight: '700',
    fontSize: '16px',
    padding: '15px',
    borderRadius: '12px',
    marginTop: '8px',
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.3px',
  },
};
