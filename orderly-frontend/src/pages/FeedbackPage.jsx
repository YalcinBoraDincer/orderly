import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table') || '';

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4";

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      if (rating <= 3) {
        await api.post('/api/feedback', {
          tableNumber: table,
          rating: rating,
          comment: comment
        });
      }
      setSubmitted(true);
    } catch (error) {
      alert('Geri bildiriminiz gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.iconArea}>🍽️</div>
          <h2 style={styles.brandName}>Orderly</h2>
          <p style={styles.thankYou}>Teşekkür ederiz.</p>
          <p style={styles.thankDesc}>Görüşleriniz hizmet kalitemizi artırmak için bizim için çok değerli.</p>
          <div style={styles.footerText}>Orderly Hospitality</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconArea}>🍽️</div>
        <h2 style={styles.brandName}>Orderly</h2>
        <p style={styles.question}>Yemek deneyiminiz nasıldı?</p>

        {/* Stars */}
        <div style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => {
                setRating(star);
                if (star >= 4) setComment('');
              }}
              style={{
                ...styles.star,
                color: (hoveredRating || rating) >= star ? '#d4af37' : '#353535',
              }}
            >
              ★
            </span>
          ))}
        </div>

        {rating > 0 && rating <= 3 && (
          <div style={styles.feedbackSection}>
            <p style={styles.sadText}>Üzgünüz. Deneyiminizi nasıl iyileştirebiliriz?</p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Görüşlerinizi yazabilirsiniz..."
              style={styles.textarea}
              rows={4}
            />
            <button
              onClick={handleSubmit}
              disabled={submitting || !comment.trim()}
              style={{...styles.btnPrimary, opacity: (submitting || !comment.trim()) ? 0.5 : 1}}
            >
              {submitting ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        )}

        {rating >= 4 && (
          <div style={styles.feedbackSection}>
            <p style={styles.happyText}>Mükemmel. Teşekkürler.</p>
            <p style={styles.happyDesc}>
              Deneyiminizi paylaşarak diğer misafirlerin de bizi keşfetmesine yardımcı olabilirsiniz.
            </p>
            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setSubmitted(true)}
              style={styles.btnPrimary}
            >
              Google'da Değerlendir
            </a>
            <button onClick={() => setSubmitted(true)} style={styles.btnGhost}>
              Tamamla
            </button>
          </div>
        )}

        <div style={styles.divider} />
        <div style={styles.footerText}>Orderly Hospitality</div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#131313',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: "'Manrope', sans-serif",
  },
  card: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px',
    padding: '48px 36px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  iconArea: {
    fontSize: '48px',
    marginBottom: '16px',
    color: '#d4af37',
  },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '36px',
    fontWeight: '700',
    color: '#e5e2e1',
    marginBottom: '8px',
  },
  question: {
    color: '#d0c5af',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    marginBottom: '32px',
  },

  starsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '32px',
  },
  star: {
    fontSize: '44px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },

  feedbackSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sadText: {
    color: '#e5e2e1',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  happyText: {
    fontFamily: "'Playfair Display', serif",
    color: '#f2ca50',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  happyDesc: {
    color: '#d0c5af',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
  },
  thankYou: {
    fontFamily: "'Playfair Display', serif",
    color: '#f2ca50',
    fontSize: '28px',
    fontWeight: '600',
    margin: '16px 0 8px',
  },
  thankDesc: {
    color: '#d0c5af',
    fontSize: '14px',
    lineHeight: '1.6',
    marginBottom: '24px',
  },

  textarea: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '4px',
    padding: '16px',
    color: '#e5e2e1',
    fontSize: '14px',
    resize: 'none',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: "'Manrope', sans-serif",
  },

  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#d4af37',
    color: '#3c2f00',
    borderRadius: '4px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    border: 'none',
    textDecoration: 'none',
    fontFamily: "'Manrope', sans-serif",
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
    transition: 'all 0.2s',
  },
  btnGhost: {
    backgroundColor: 'transparent',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    color: '#e5e2e1',
    borderRadius: '4px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    fontFamily: "'Manrope', sans-serif",
  },

  divider: {
    width: '100%',
    height: '1px',
    background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)',
    margin: '32px 0 16px',
  },
  footerText: {
    color: 'rgba(208, 197, 175, 0.4)',
    fontSize: '12px',
    letterSpacing: '0.05em',
  },
};
