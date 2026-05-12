import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const STATUS_CONFIG = {
  PENDING:   { label: 'BEKLİYOR',    color: '#d0c5af', bg: 'rgba(208, 197, 175, 0.1)', border: 'rgba(208, 197, 175, 0.3)' },
  CONFIRMED: { label: 'ONAYLANDI',   color: '#f2ca50', bg: 'rgba(242, 202, 80, 0.1)',  border: 'rgba(242, 202, 80, 0.4)' },
  CANCELLED: { label: 'İPTAL EDİLDİ',color: '#ffb4ab', bg: 'rgba(255, 180, 171, 0.1)', border: 'rgba(255, 180, 171, 0.3)' },
  COMPLETED: { label: 'GELDİ',       color: '#99907c', bg: 'rgba(153, 144, 124, 0.1)', border: 'rgba(153, 144, 124, 0.3)' }
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchData = async () => {
    try {
      const [resRes, tableRes] = await Promise.all([
        api.get('/api/reservations'),
        api.get('/api/tables')
      ]);
      // Sort reservations by time descending or ascending
      const sorted = resRes.data.sort((a, b) => new Date(a.reservationTime) - new Date(b.reservationTime));
      setReservations(sorted);
      setTables(tableRes.data);
    } catch (e) {
      console.error('Veriler yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/api/reservations/${id}/status?status=${newStatus}`);
      fetchData();
    } catch (e) {
      alert('Durum güncellenemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu rezervasyonu silmek istiyor musunuz?')) return;
    try {
      await api.delete(`/api/reservations/${id}`);
      fetchData();
    } catch (e) {
      alert('Silinemedi');
    }
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <p style={styles.headerLabel}>YÖNETİM</p>
            <h1 style={styles.headerTitle}>Rezervasyonlar</h1>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.addBtn}>
            + Yeni Rezervasyon
          </button>
        </header>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : reservations.length === 0 ? (
          <p style={styles.loadingText}>Henüz bir rezervasyon bulunmuyor.</p>
        ) : (
          <div style={styles.list}>
            {reservations.map(res => {
              const statusConfig = STATUS_CONFIG[res.status] || STATUS_CONFIG.PENDING;
              const dateObj = new Date(res.reservationTime);
              const dateStr = dateObj.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
              const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

              return (
                <div key={res.id} style={styles.card}>
                  <div style={styles.cardTop}>
                    <div style={styles.timeBox}>
                      <span style={styles.dateText}>{dateStr}</span>
                      <span style={styles.timeText}>{timeStr}</span>
                    </div>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.color,
                      border: `1px solid ${statusConfig.border}`
                    }}>
                      {statusConfig.label}
                    </span>
                  </div>

                  <div style={styles.cardCenter}>
                    <h3 style={styles.customerName}>{res.customerName}</h3>
                    <p style={styles.customerPhone}>📞 {res.customerPhone}</p>
                    <div style={styles.detailsRow}>
                      <span style={styles.detailItem}>👥 {res.numberOfGuests} Kişi</span>
                      <span style={styles.detailItem}>🪑 Masa {res.tableNumber}</span>
                    </div>
                    {res.specialNotes && (
                      <p style={styles.notes}>Not: {res.specialNotes}</p>
                    )}
                  </div>

                  <div style={styles.cardBottom}>
                    {res.status === 'PENDING' && (
                      <button onClick={() => handleStatusChange(res.id, 'CONFIRMED')} style={styles.actionBtnPrimary}>
                        Onayla
                      </button>
                    )}
                    {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                      <button onClick={() => handleStatusChange(res.id, 'COMPLETED')} style={styles.actionBtnOutline}>
                        Geldi
                      </button>
                    )}
                    {(res.status === 'PENDING' || res.status === 'CONFIRMED') && (
                      <button onClick={() => handleStatusChange(res.id, 'CANCELLED')} style={styles.actionBtnDanger}>
                        İptal
                      </button>
                    )}
                    {(res.status === 'CANCELLED' || res.status === 'COMPLETED') && (
                      <button onClick={() => handleDelete(res.id)} style={styles.actionBtnDanger}>
                        Sil
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModal && (
        <ReservationModal
          tables={tables}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function ReservationModal({ tables, onClose, onSuccess }) {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    reservationDate: '',
    reservationTime: '',
    numberOfGuests: '',
    tableId: '',
    specialNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dateTimeStr = `${form.reservationDate}T${form.reservationTime}:00`;

      await api.post('/api/reservations', {
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        reservationTime: dateTimeStr,
        numberOfGuests: Number(form.numberOfGuests),
        tableId: Number(form.tableId),
        specialNotes: form.specialNotes,
        status: 'CONFIRMED'
      });
      onSuccess();
    } catch (e) {
      alert(e.response?.data?.message || 'Rezervasyon oluşturulamadı.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Yeni Rezervasyon</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>MÜŞTERİ ADI</label>
              <input required style={styles.input} value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>TELEFON</label>
              <input required style={styles.input} value={form.customerPhone} onChange={e => setForm({...form, customerPhone: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>TARİH</label>
              <input required type="date" style={styles.input} value={form.reservationDate} onChange={e => setForm({...form, reservationDate: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>SAAT</label>
              <input required type="time" style={styles.input} value={form.reservationTime} onChange={e => setForm({...form, reservationTime: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>KİŞİ SAYISI</label>
              <input required type="number" min="1" style={styles.input} value={form.numberOfGuests} onChange={e => setForm({...form, numberOfGuests: e.target.value})} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>MASA</label>
              <select required style={styles.input} value={form.tableId} onChange={e => setForm({...form, tableId: e.target.value})}>
                <option value="">Masa Seçin</option>
                {tables.map(t => (
                  <option key={t.id} value={t.id}>Masa {t.tableNumber} ({t.capacity} Kişilik)</option>
                ))}
              </select>
            </div>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>ÖZEL NOTLAR</label>
            <input style={styles.input} value={form.specialNotes} onChange={e => setForm({...form, specialNotes: e.target.value})} />
          </div>

          <button type="submit" disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'Kaydediliyor...' : 'Rezervasyonu Tamamla'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#131313' },
  main: { padding: '40px 64px', maxWidth: '1200px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottom: '1px solid #20201f', paddingBottom: '32px', marginBottom: '32px'
  },
  headerLabel: {
    fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: '500',
    letterSpacing: '0.1em', color: '#f2ca50', textTransform: 'uppercase', marginBottom: '8px',
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '40px', fontWeight: '700',
    color: '#e5e2e1', lineHeight: '1.1', letterSpacing: '-0.02em',
  },
  addBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00', fontFamily: "'Manrope', sans-serif",
    fontSize: '14px', fontWeight: '700', letterSpacing: '0.05em', padding: '12px 24px',
    borderRadius: '4px', boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },
  loadingText: { textAlign: 'center', color: '#d0c5af', marginTop: '60px', fontFamily: "'Manrope', sans-serif" },

  list: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px',
  },
  card: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(16px)',
    borderRadius: '8px', border: '1px solid rgba(212, 175, 55, 0.15)', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '16px',
    boxShadow: '0 20px 40px -10px rgba(5, 8, 20, 0.5)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  timeBox: { display: 'flex', flexDirection: 'column' },
  dateText: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af' },
  timeText: { fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600', color: '#f2ca50' },
  statusBadge: {
    fontFamily: "'Manrope', sans-serif", fontSize: '11px', fontWeight: '700',
    letterSpacing: '0.05em', padding: '4px 10px', borderRadius: '4px',
  },
  cardCenter: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  customerName: { fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: '#e5e2e1' },
  customerPhone: { fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#d0c5af' },
  detailsRow: { display: 'flex', gap: '16px', marginTop: '4px' },
  detailItem: { fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: '#e5e2e1', backgroundColor: 'rgba(53, 53, 53, 0.5)', padding: '4px 8px', borderRadius: '4px' },
  notes: { fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: '#d0c5af', fontStyle: 'italic', marginTop: '8px', padding: '8px', backgroundColor: 'rgba(212, 175, 55, 0.05)', borderRadius: '4px' },

  cardBottom: { display: 'flex', gap: '8px', borderTop: '1px solid rgba(212, 175, 55, 0.1)', paddingTop: '16px' },
  actionBtnPrimary: { flex: 1, padding: '10px', backgroundColor: '#d4af37', color: '#3c2f00', border: 'none', borderRadius: '4px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: '700' },
  actionBtnOutline: { flex: 1, padding: '10px', backgroundColor: 'transparent', color: '#d0c5af', border: '1px solid rgba(153, 144, 124, 0.3)', borderRadius: '4px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: '600' },
  actionBtnDanger: { padding: '10px', backgroundColor: 'transparent', color: '#ffb4ab', border: '1px solid rgba(255, 180, 171, 0.3)', borderRadius: '4px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: '600' },

  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000, padding: '20px',
  },
  modal: {
    backgroundColor: '#1b1b1b', border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px', width: '100%', maxWidth: '600px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  modalTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600',
    color: '#f2ca50', margin: 0,
  },
  closeBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#d0c5af', width: '36px', height: '36px', borderRadius: '4px', fontSize: '16px',
  },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af', fontWeight: '500', letterSpacing: '0.1em' },
  input: {
    backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: '1px solid rgba(229, 226, 225, 0.2)', borderRadius: '0',
    padding: '12px 0', color: '#e5e2e1', fontSize: '16px', outline: 'none', fontFamily: "'Manrope', sans-serif",
  },
  submitBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '16px', borderRadius: '4px', border: 'none', letterSpacing: '0.05em',
    marginTop: '16px', boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },
};
