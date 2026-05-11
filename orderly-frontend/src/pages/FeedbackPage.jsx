import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';

export default function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const table = searchParams.get('table') || 'Bilinmeyen Masa';
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bu link canlıya alınırken gerçek işletmenin place_id'si ile değiştirilecek.
  // Şu an test için Googleplex'in (Google Merkezi) yorum ekranı açılacak.
  const GOOGLE_REVIEW_URL = "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4";

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      // Sadece düşük puanları kendi sistemimize kaydediyoruz
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
          <div style={styles.iconWrapper}>🎉</div>
          <h2 style={styles.title}>Geri Bildiriminiz İçin Teşekkürler!</h2>
          <p style={styles.subtitle}>Görüşleriniz hizmet kalitemizi artırmamız için bizim için çok değerli.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Bizi Değerlendirin!</h2>
        <p style={styles.subtitle}>Sizlere daha iyi hizmet verebilmemiz için bugünkü deneyiminizi puanlar mısınız?</p>

        {/* Yıldızlar */}
        <div style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span 
              key={star}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => {
                setRating(star);
                // 4-5 yıldız verildiğinde yorum kutusu vs resetlensin
                if (star >= 4) setComment('');
              }}
              style={{
                ...styles.star,
                color: (hoveredRating || rating) >= star ? '#f59e0b' : '#3f3f46',
                transform: (hoveredRating || rating) >= star ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              ★
            </span>
          ))}
        </div>

        {rating > 0 && rating <= 3 && (
          <div style={styles.feedbackSection}>
            <p style={styles.questionText}>Üzgünüz, deneyiminizi nasıl iyileştirebiliriz?</p>
            <textarea 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Şikayet ve önerilerinizi buraya yazabilirsiniz..."
              style={styles.textarea}
              rows={4}
            />
            <button 
              onClick={handleSubmit} 
              disabled={submitting || !comment.trim()} 
              style={{...styles.submitBtn, opacity: (submitting || !comment.trim()) ? 0.5 : 1}}
            >
              {submitting ? 'Gönderiliyor...' : 'Görüşlerimi Gönder'}
            </button>
          </div>
        )}

        {rating >= 4 && (
          <div style={styles.feedbackSection}>
            <p style={styles.happyText}>Harika! Bizi çok mutlu ettiniz. 😍</p>
            <p style={styles.subtitle}>Bu güzel deneyimi Google'da diğer insanlarla paylaşarak bize destek olmak ister misiniz?</p>
            <a 
              href={GOOGLE_REVIEW_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={() => setSubmitted(true)}
              style={styles.googleBtn}
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" style={styles.googleIcon}/>
              Google'da Değerlendir
            </a>
            <button onClick={() => setSubmitted(true)} style={styles.skipBtn}>Hayır, teşekkürler</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { 
    minHeight: '100vh', backgroundColor: '#0a0a0f', display: 'flex', 
    alignItems: 'center', justifyContent: 'center', padding: '20px',
    fontFamily: 'Inter, sans-serif'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '24px', padding: '40px 30px', width: '100%', maxWidth: '450px',
    textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  title: { fontSize: '26px', fontWeight: '800', color: '#f1f1f1', margin: '0 0 12px 0' },
  subtitle: { fontSize: '14px', color: '#8b8b9e', lineHeight: '1.5', margin: '0 0 24px 0' },
  iconWrapper: { fontSize: '60px', marginBottom: '20px' },
  
  starsContainer: { display: 'flex', justifyContent: 'center', gap: '8px', margin: '30px 0' },
  star: { fontSize: '48px', cursor: 'pointer', transition: 'all 0.2s ease', userSelect: 'none' },
  
  feedbackSection: { display: 'flex', flexDirection: 'column', gap: '16px', animation: 'fadeIn 0.4s ease' },
  questionText: { color: '#f1f1f1', fontSize: '15px', fontWeight: '600', margin: 0 },
  happyText: { color: '#10b981', fontSize: '18px', fontWeight: '800', margin: 0 },
  
  textarea: {
    backgroundColor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', padding: '16px', color: '#f1f1f1', fontSize: '14px',
    resize: 'none', outline: 'none', width: '100%', boxSizing: 'border-box'
  },
  
  submitBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white',
    border: 'none', borderRadius: '12px', padding: '16px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s'
  },
  
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
    backgroundColor: 'white', color: '#1f2937', border: 'none', borderRadius: '12px',
    padding: '16px', fontSize: '16px', fontWeight: '700', textDecoration: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'transform 0.1s'
  },
  googleIcon: { width: '20px', height: '20px' },
  skipBtn: {
    backgroundColor: 'transparent', color: '#8b8b9e', border: 'none',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer', marginTop: '8px'
  }
};
