import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // URL'den masa numarasını al (?table=A1)
  const tableNumber = new URLSearchParams(window.location.search).get('table');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, menuRes] = await Promise.all([
          api.get('/api/categories'),
          api.get('/api/menu'),
        ]);
        setCategories(catRes.data);
        setMenuItems(menuRes.data);
        if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id);
      } catch (e) {
        console.error('Menü yüklenemedi:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = activeCategory
    ? menuItems.filter(item => item.categoryId === activeCategory && item.available)
    : menuItems.filter(item => item.available);

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <span style={styles.loadingIcon}>🍽️</span>
        <p style={styles.loadingText}>Menü yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoArea}>
            <span style={styles.logoIcon}>🍽️</span>
            <span style={styles.logoText}>Orderly</span>
          </div>
          {tableNumber && (
            <div style={styles.tableBadge}>
              Masa {tableNumber}
            </div>
          )}
        </div>
      </div>

      {/* Kategori Sekmeleri */}
      <div style={styles.categoryBar}>
        <div style={styles.categoryScroll}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={activeCategory === cat.id ? styles.catBtnActive : styles.catBtn}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menü Öğeleri */}
      <div style={styles.content}>
        {filteredItems.length === 0 ? (
          <p style={styles.emptyText}>Bu kategoride ürün bulunmuyor.</p>
        ) : (
          <div style={styles.grid}>
            {filteredItems.map(item => (
              <div key={item.id} style={styles.card}>
                {/* Görsel alanı */}
                <div style={styles.cardImage}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={styles.image} />
                  ) : (
                    <div style={styles.imagePlaceholder}>
                      <span style={styles.placeholderIcon}>🍴</span>
                    </div>
                  )}
                </div>

                {/* İçerik */}
                <div style={styles.cardContent}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  {item.description && (
                    <p style={styles.itemDesc}>{item.description}</p>
                  )}

                  <div style={styles.cardFooter}>
                    <span style={styles.price}>₺{Number(item.price).toFixed(2)}</span>
                    {item.preparationTimeMinutes && (
                      <span style={styles.prepTime}>
                        ⏱ {item.preparationTimeMinutes} dk
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer / Feedback Banner */}
      <div style={styles.footer}>
        <p style={styles.footerText}>
          Yemeğinizi bitirdiniz mi? 🍽️
        </p>
        <button 
          onClick={() => navigate(`/feedback?table=${tableNumber || 'Bilinmiyor'}`)}
          style={styles.feedbackBtn}
        >
          Bizi Değerlendirin!
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    paddingBottom: '80px',
  },
  loadingScreen: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
  },
  loadingIcon: { fontSize: '48px' },
  loadingText: { color: '#8b8b9e', fontSize: '16px' },

  // Header
  header: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    padding: '0 20px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(20px)',
  },
  headerInner: {
    maxWidth: '800px',
    margin: '0 auto',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoIcon: { fontSize: '22px' },
  logoText: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tableBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    border: '1px solid rgba(245,158,11,0.25)',
    color: '#f59e0b',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },

  // Kategoriler
  categoryBar: {
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: '#0a0a0f',
    position: 'sticky',
    top: '60px',
    zIndex: 99,
  },
  categoryScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: '4px',
    padding: '12px 20px',
    maxWidth: '800px',
    margin: '0 auto',
    scrollbarWidth: 'none',
  },
  catBtn: {
    padding: '8px 18px',
    borderRadius: '20px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  catBtnActive: {
    padding: '8px 18px',
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: '1px solid transparent',
    color: 'white',
    fontSize: '13px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },

  // İçerik
  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8b8b9e',
    marginTop: '40px',
  },

  // Kart
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  cardImage: {
    height: '160px',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.08))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: { fontSize: '40px', opacity: 0.4 },
  cardContent: { padding: '16px' },
  itemName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f1f1',
    marginBottom: '6px',
  },
  itemDesc: {
    fontSize: '13px',
    color: '#8b8b9e',
    lineHeight: '1.5',
    marginBottom: '12px',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '20px',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  prepTime: {
    fontSize: '12px',
    color: '#8b8b9e',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '4px 10px',
    borderRadius: '20px',
  },

  // Footer
  footer: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10,10,15,0.95)', borderTop: '1px solid rgba(255,255,255,0.08)',
    padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backdropFilter: 'blur(20px)', zIndex: 100
  },
  footerText: {
    color: '#8b8b9e', fontSize: '14px', margin: 0, fontWeight: '500'
  },
  feedbackBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    color: 'white', border: 'none', borderRadius: '8px', padding: '10px 16px',
    fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s'
  }
};
