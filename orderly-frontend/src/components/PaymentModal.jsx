import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function PaymentModal({ order, onClose, onSuccess }) {
  const [amount, setAmount] = useState(order.remainingAmount || 0);
  const [tipAmount, setTipAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [submitting, setSubmitting] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const fetchPayments = async () => {
    try {
      const res = await api.get(`/api/payments/order/${order.id}`);
      setPayments(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [order.id]);

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Bu ödemeyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.delete(`/api/payments/${paymentId}`);
      onSuccess();
      fetchPayments();
    } catch (e) {
      alert(e.response?.data?.message || 'Ödeme silinemedi!');
    }
  };

  const handleTakePayment = async () => {
    if (amount <= 0 || amount > order.remainingAmount) {
      alert(`Geçersiz tutar! Kalan tutar: ₺${order.remainingAmount}`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/payments', {
        orderId: order.id,
        amount: amount,
        tipAmount: tipAmount,
        paymentMethod: paymentMethod
      });
      onSuccess();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Ödeme alınamadı!');
    } finally {
      setSubmitting(false);
    }
  };

  const METHOD_LABELS = {
    CASH: '💵 Nakit',
    CREDIT_CARD: '💳 Kredi Kartı',
    MEAL_CARD: '🎟️ Yemek Kartı'
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div>
            <p style={styles.headerLabel}>SİPARİŞ #{order.id}</p>
            <h2 style={styles.headerTitle}>Ödeme Al</h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Summary */}
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Sipariş Toplamı</span>
              <span style={styles.summaryValue}>₺{order.totalAmount?.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Ödenen</span>
              <span style={{...styles.summaryValue, color: '#d4af37'}}>₺{order.paidAmount?.toFixed(2)}</span>
            </div>
            <div style={styles.divider} />
            <div style={styles.summaryRow}>
              <span style={{...styles.summaryLabel, fontWeight: '700'}}>Kalan Tutar</span>
              <span style={{...styles.summaryValue, color: '#ffb4ab', fontWeight: '800', fontFamily: "'Playfair Display', serif", fontSize: '20px'}}>
                ₺{order.remainingAmount?.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Past payments */}
          {!loadingPayments && payments.length > 0 && (
            <div style={styles.paymentsList}>
              <h3 style={styles.listTitle}>ALINAN ÖDEMELER</h3>
              {payments.map(p => (
                <div key={p.id} style={styles.paymentItem}>
                  <div>
                    <span style={styles.paymentMethod}>{METHOD_LABELS[p.paymentMethod]}</span>
                    <span style={styles.paymentAmount}>₺{p.amount.toFixed(2)}</span>
                    {p.tipAmount > 0 && <span style={styles.paymentTip}>(+₺{p.tipAmount.toFixed(2)})</span>}
                  </div>
                  <button onClick={() => handleDeletePayment(p.id)} style={styles.deleteBtn}>Sil</button>
                </div>
              ))}
            </div>
          )}

          {/* Amount */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>TAHSİL EDİLECEK TUTAR (₺)</label>
            <input type="number" step="0.01" value={amount} onChange={e => setAmount(Number(e.target.value))} style={styles.input} />
          </div>

          {/* Tip */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>BAHŞİŞ (₺)</label>
            <input type="number" step="0.01" value={tipAmount} onChange={e => setTipAmount(Number(e.target.value))} style={styles.input} />
          </div>

          {/* Method */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>ÖDEME YÖNTEMİ</label>
            <div style={styles.methodContainer}>
              {Object.entries(METHOD_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setPaymentMethod(key)}
                  style={paymentMethod === key ? styles.methodBtnActive : styles.methodBtn}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleTakePayment} disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'İşleniyor...' : `Tahsil Et — ₺${(Number(amount) + Number(tipAmount)).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000, padding: '20px',
  },
  modal: {
    backgroundColor: '#1b1b1b', border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px', width: '100%', maxWidth: '420px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px', borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
  },
  headerLabel: {
    fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: '500',
    letterSpacing: '0.1em', color: '#d0c5af', marginBottom: '4px',
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '600',
    color: '#f2ca50', margin: 0, lineHeight: '1.3',
  },
  closeBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#d0c5af', width: '36px', height: '36px', borderRadius: '4px', fontSize: '16px',
  },
  body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '60vh' },

  summaryCard: {
    backgroundColor: 'rgba(32, 32, 31, 0.5)', padding: '16px', borderRadius: '8px',
    border: '1px solid rgba(212, 175, 55, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontFamily: "'Manrope', sans-serif", color: '#d0c5af', fontSize: '14px' },
  summaryValue: { fontFamily: "'Manrope', sans-serif", color: '#e5e2e1', fontSize: '15px', fontWeight: '600' },
  divider: { width: '100%', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)', margin: '4px 0' },

  paymentsList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listTitle: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af', letterSpacing: '0.1em', margin: 0 },
  paymentItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(32, 32, 31, 0.3)', border: '1px solid rgba(212, 175, 55, 0.05)',
    padding: '10px 12px', borderRadius: '8px',
  },
  paymentMethod: { fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: '#d0c5af', marginRight: '8px' },
  paymentAmount: { fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#d4af37', fontWeight: '700' },
  paymentTip: { fontFamily: "'Manrope', sans-serif", fontSize: '11px', color: '#f2ca50', marginLeft: '6px' },
  deleteBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(255, 180, 171, 0.3)', color: '#ffb4ab',
    borderRadius: '4px', padding: '4px 10px', fontSize: '11px', fontFamily: "'Manrope', sans-serif", fontWeight: '600',
  },

  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af', fontWeight: '500', letterSpacing: '0.1em' },
  input: {
    backgroundColor: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
    borderBottom: '1px solid rgba(229, 226, 225, 0.2)', borderRadius: '0',
    padding: '12px 0', color: '#e5e2e1', fontSize: '16px', outline: 'none', fontFamily: "'Manrope', sans-serif",
  },

  methodContainer: { display: 'flex', gap: '8px' },
  methodBtn: {
    flex: 1, padding: '12px 0', borderRadius: '4px',
    backgroundColor: 'rgba(32, 32, 31, 0.5)', border: '1px solid rgba(212, 175, 55, 0.15)',
    color: '#d0c5af', fontSize: '12px', fontWeight: '600', fontFamily: "'Manrope', sans-serif",
  },
  methodBtnActive: {
    flex: 1, padding: '12px 0', borderRadius: '4px',
    backgroundColor: '#d4af37', border: 'none', color: '#3c2f00',
    fontSize: '12px', fontWeight: '700', fontFamily: "'Manrope', sans-serif",
  },

  footer: {
    padding: '20px 24px', borderTop: '1px solid rgba(212, 175, 55, 0.1)',
    backgroundColor: 'rgba(14, 14, 14, 0.5)',
  },
  submitBtn: {
    width: '100%', backgroundColor: '#d4af37', color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '16px', borderRadius: '4px', border: 'none', letterSpacing: '0.05em',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },
};
