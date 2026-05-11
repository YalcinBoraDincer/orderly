import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const unavailableItems = activeCategory
    ? menuItems.filter(item => item.categoryId === activeCategory && !item.available)
    : menuItems.filter(item => !item.available);

  const activeCategoryName = categories.find(c => c.id === activeCategory)?.name || '';

  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p style={styles.loadingText}>Menü yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Mobile Header */}
      <div style={styles.mobileHeader}>
        <span style={styles.mobileLogoText}>Orderly</span>
        {tableNumber && (
          <div style={styles.tableBadge}>
            🍽️ <span style={styles.tableBadgeText}>MASA {tableNumber}</span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div style={styles.categoryBar} className="scrollbar-hide">
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

      {/* Section Title */}
      <div style={styles.content}>
        <h2 style={styles.sectionTitle}>
          <span style={styles.sectionDash} />
          {activeCategoryName}
          <span style={styles.sectionLine} />
        </h2>

        {/* Menu Items */}
        <div style={styles.grid}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.card}>
              {item.imageUrl && (
                <div style={styles.cardImage}>
                  <img src={item.imageUrl} alt={item.name} style={styles.image} />
                  <div style={styles.imageOverlay} />
                </div>
              )}
              <div style={{...styles.cardContent, ...(item.imageUrl ? {marginTop: '-48px', position: 'relative', zIndex: 10} : {})}}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <span style={styles.price}>₺{Number(item.price).toFixed(0)}</span>
                </div>
                {item.description && (
                  <p style={styles.itemDesc}>{item.description}</p>
                )}
                {item.preparationTimeMinutes && (
                  <span style={styles.prepTime}>⏱ {item.preparationTimeMinutes} dk</span>
                )}
              </div>
            </div>
          ))}

          {/* Unavailable items */}
          {unavailableItems.map(item => (
            <div key={item.id} style={styles.cardSoldOut}>
              <div style={styles.soldOutOverlay}>
                <span style={styles.soldOutBadge}>TÜKENDİ</span>
              </div>
              <div style={{...styles.cardContent, opacity: 0.5}}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.itemName}>{item.name}</h3>
                  <span style={styles.price}>₺{Number(item.price).toFixed(0)}</span>
                </div>
                {item.description && (
                  <p style={styles.itemDesc}>{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback Banner */}
      <div style={styles.feedbackBanner}>
        <div style={styles.feedbackInner}>
          <div>
            <h4 style={styles.feedbackTitle}>Yemeğinizi bitirdiniz mi?</h4>
            <p style={styles.feedbackSubtitle}>Bize nasıl bir deneyim yaşadığınızı anlatın.</p>
          </div>
          <button
            onClick={() => navigate(`/feedback?table=${tableNumber || 'Bilinmiyor'}`)}
            style={styles.feedbackBtn}
          >
            Değerlendir
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#131313',
    paddingBottom: '120px',
    fontFamily: "'Manrope', sans-serif",
  },
  loadingScreen: {
    minHeight: '100vh',
    backgroundColor: '#131313',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: '#d0c5af', fontSize: '16px' },

  mobileHeader: {
    backgroundColor: 'rgba(19, 19, 19, 0.8)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  mobileLogoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: '700',
    color: '#f2ca50',
    letterSpacing: '-0.02em',
  },
  tableBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    padding: '6px 12px',
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  tableBadgeText: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    color: '#f2ca50',
  },

  categoryBar: {
    display: 'flex',
    overflowX: 'auto',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.05)',
  },
  catBtn: {
    padding: '8px 24px',
    borderRadius: '9999px',
    backgroundColor: '#20201f',
    border: '1px solid rgba(153, 144, 124, 0.3)',
    color: '#d0c5af',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  catBtnActive: {
    padding: '8px 24px',
    borderRadius: '9999px',
    backgroundColor: '#f2ca50',
    border: '1px solid transparent',
    color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },

  content: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px 20px',
  },
  sectionTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '24px',
    fontWeight: '600',
    color: '#e5e2e1',
    marginBottom: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    lineHeight: '1.3',
  },
  sectionDash: {
    width: '32px',
    height: '1px',
    background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.5), transparent)',
    display: 'block',
    flexShrink: 0,
  },
  sectionLine: {
    flex: 1,
    height: '1px',
    background: 'linear-gradient(to right, rgba(212, 175, 55, 0.3), transparent)',
    display: 'block',
  },

  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  card: {
    backgroundColor: 'rgba(32, 32, 31, 0.8)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    overflow: 'hidden',
    transition: 'border-color 0.3s',
  },
  cardImage: {
    height: '200px',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.85,
  },
  imageOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to top, rgba(32, 32, 31, 0.9), transparent)',
  },
  cardContent: { padding: '20px' },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  itemName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#e5e2e1',
    lineHeight: '1.3',
  },
  price: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px',
    fontWeight: '600',
    color: '#f2ca50',
  },
  itemDesc: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    color: '#d0c5af',
    lineHeight: '1.6',
    marginBottom: '12px',
  },
  prepTime: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    color: 'rgba(208, 197, 175, 0.6)',
  },

  cardSoldOut: {
    backgroundColor: 'rgba(32, 32, 31, 0.4)',
    backdropFilter: 'blur(12px)',
    borderRadius: '12px',
    border: '1px solid rgba(153, 144, 124, 0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  soldOutOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(19, 19, 19, 0.5)',
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(2px)',
  },
  soldOutBadge: {
    fontFamily: "'Manrope', sans-serif",
    padding: '8px 16px',
    backgroundColor: '#20201f',
    border: '1px solid rgba(153, 144, 124, 0.3)',
    borderRadius: '9999px',
    color: '#d0c5af',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.1em',
  },

  feedbackBanner: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    padding: '16px 20px',
    zIndex: 40,
  },
  feedbackInner: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'rgba(53, 53, 53, 0.95)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '12px',
    padding: '16px 20px',
    boxShadow: '0 -10px 40px rgba(5, 8, 20, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackTitle: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e2e1',
    marginBottom: '2px',
  },
  feedbackSubtitle: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    color: '#d0c5af',
  },
  feedbackBtn: {
    padding: '10px 20px',
    backgroundColor: '#d4af37',
    color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    borderRadius: '8px',
    border: 'none',
    transition: 'transform 0.1s',
  },
};
