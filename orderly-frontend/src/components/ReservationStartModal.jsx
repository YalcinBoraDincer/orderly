import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function ReservationStartModal({ table, onClose, onStartOrder }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await api.get('/api/reservations');
        // Filter for this table and status CONFIRMED or PENDING, ideally today.
        const todayStr = new Date().toISOString().split('T')[0];
        const tableRes = res.data.filter(r => 
          r.tableId === table.id && 
          (r.status === 'CONFIRMED' || r.status === 'PENDING') &&
          r.reservationTime.startsWith(todayStr)
        );
        setReservations(tableRes);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
  }, [table.id]);

  const handleStartOrder = async (reservationId) => {
    try {
      if (reservationId) {
        // Mark reservation as COMPLETED. Backend will set table to AVAILABLE
        await api.patch(`/api/reservations/${reservationId}/status?status=COMPLETED`);
      } else {
        // If "Yine de sipariş başlat" is clicked and no reservation was selected
        await api.patch(`/api/tables/${table.id}/status?status=AVAILABLE`);
      }
      onStartOrder(); 
      onClose();
    } catch (e) {
      alert('Sipariş başlatılamadı!');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <p style={styles.headerLabel}>MASA {table.tableNumber}</p>
            <h2 style={styles.headerTitle}>Rezervasyon Detayları</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {loading ? (
            <p style={styles.loadingText}>Yükleniyor...</p>
          ) : reservations.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Bu masa için bugüne ait aktif rezervasyon bulunamadı.</p>
              <button onClick={() => handleStartOrder(null)} style={styles.startBtn}>
                Yine de Sipariş Başlat (Masaya Oturt)
              </button>
            </div>
          ) : (
            <div style={styles.resList}>
              {reservations.map(res => {
                const dateObj = new Date(res.reservationTime);
                const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={res.id} style={styles.resCard}>
                    <div style={styles.resInfo}>
                      <h3 style={styles.resName}>{res.customerName}</h3>
                      <p style={styles.resDetails}>
                        ⏰ {timeStr} • 👥 {res.numberOfGuests} Kişi • 📞 {res.customerPhone}
                      </p>
                      {res.specialNotes && <p style={styles.resNotes}>Not: {res.specialNotes}</p>}
                    </div>
                    <button onClick={() => handleStartOrder(res.id)} style={styles.startBtn}>
                      Müşteri Geldi - Sipariş Başlat
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    backgroundColor: '#1b1b1b', border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px', width: '100%', maxWidth: '500px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  headerLabel: {
    fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: '500',
    letterSpacing: '0.1em', color: '#d0c5af', textTransform: 'uppercase', marginBottom: '4px',
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600',
    color: '#f2ca50', lineHeight: '1.3', margin: 0,
  },
  closeBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#d0c5af', width: '36px', height: '36px', borderRadius: '4px', fontSize: '16px',
  },
  body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  loadingText: { textAlign: 'center', color: '#d0c5af', fontFamily: "'Manrope', sans-serif" },
  emptyState: { display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' },
  emptyText: { fontFamily: "'Manrope', sans-serif", color: '#d0c5af', fontSize: '14px', textAlign: 'center' },
  
  resList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  resCard: {
    backgroundColor: 'rgba(32, 32, 31, 0.5)', border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px',
  },
  resInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
  resName: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#e5e2e1', margin: 0 },
  resDetails: { fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: '#d0c5af', margin: 0 },
  resNotes: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontStyle: 'italic', color: '#f2ca50', margin: '4px 0 0 0' },
  
  startBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00', border: 'none',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '14px 24px', borderRadius: '4px', letterSpacing: '0.05em',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)', width: '100%',
  },
};
