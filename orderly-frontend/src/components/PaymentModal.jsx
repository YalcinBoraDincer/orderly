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
      console.error('Ödemeler yüklenemedi:', e);
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
      onSuccess(); // Üst componenti güncelle (kalan tutar vs değişeceği için)
      fetchPayments(); // Listeyi yenile
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
      onSuccess(); // Başarılı ödeme sonrası üst componenti güncelle
      onClose();   // Modalı kapat
    } catch (e) {
      alert(e.response?.data?.message || 'Ödeme alınamadı!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Ödeme Al - Sipariş #{order.id}</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <div style={styles.body}>
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Sipariş Toplamı:</span>
              <span style={styles.summaryValue}>₺{order.totalAmount?.toFixed(2)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryLabel}>Ödenen:</span>
              <span style={{...styles.summaryValue, color: '#10b981'}}>₺{order.paidAmount?.toFixed(2)}</span>
            </div>
            <div style={{...styles.summaryRow, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px', marginTop: '4px'}}>
              <span style={{...styles.summaryLabel, fontWeight: '700'}}>Kalan Tutar:</span>
              <span style={{...styles.summaryValue, color: '#ef4444', fontWeight: '800'}}>₺{order.remainingAmount?.toFixed(2)}</span>
            </div>
          </div>

          {/* Geçmiş Ödemeler Listesi */}
          {!loadingPayments && payments.length > 0 && (
            <div style={styles.paymentsList}>
              <h3 style={styles.listTitle}>Alınan Ödemeler</h3>
              {payments.map(p => (
                <div key={p.id} style={styles.paymentItem}>
                  <div>
                    <span style={styles.paymentMethod}>
                      {p.paymentMethod === 'CASH' ? '💵 Nakit' : p.paymentMethod === 'CREDIT_CARD' ? '💳 Kredi Kartı' : '🎟️ Yemek Kartı'}
                    </span>
                    <span style={styles.paymentAmount}>₺{p.amount.toFixed(2)}</span>
                    {p.tipAmount > 0 && <span style={styles.paymentTip}>(+₺{p.tipAmount.toFixed(2)} Bahşiş)</span>}
                  </div>
                  <button onClick={() => handleDeletePayment(p.id)} style={styles.deleteBtn}>Sil</button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tahsil Edilecek Tutar (₺)</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Bahşiş (Tip) (₺)</label>
            <input 
              type="number" 
              step="0.01" 
              value={tipAmount} 
              onChange={e => setTipAmount(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Ödeme Yöntemi</label>
            <div style={styles.methodContainer}>
              <button 
                onClick={() => setPaymentMethod('CASH')}
                style={paymentMethod === 'CASH' ? styles.methodBtnActive : styles.methodBtn}
              >💵 Nakit</button>
              <button 
                onClick={() => setPaymentMethod('CREDIT_CARD')}
                style={paymentMethod === 'CREDIT_CARD' ? styles.methodBtnActive : styles.methodBtn}
              >💳 Kredi Kartı</button>
              <button 
                onClick={() => setPaymentMethod('MEAL_CARD')}
                style={paymentMethod === 'MEAL_CARD' ? styles.methodBtnActive : styles.methodBtn}
              >🎟️ Yemek Kartı</button>
            </div>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={handleTakePayment} disabled={submitting} style={styles.submitBtn}>
            {submitting ? 'İşleniyor...' : `Tahsil Et (₺${(Number(amount) + Number(tipAmount)).toFixed(2)})`}
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
    backgroundColor: '#1a1a24', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '16px', width: '100%', maxWidth: '400px',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  title: { fontSize: '18px', fontWeight: '700', color: '#f1f1f1', margin: 0 },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px',
    cursor: 'pointer'
  },
  body: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '8px'
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { color: '#8b8b9e', fontSize: '14px' },
  summaryValue: { color: '#f1f1f1', fontSize: '15px', fontWeight: '600' },
  
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '13px', color: '#8b8b9e', fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '12px 14px', color: '#f1f1f1', fontSize: '16px',
    outline: 'none', fontFamily: 'inherit'
  },
  
  methodContainer: { display: 'flex', gap: '8px' },
  methodBtn: {
    flex: 1, padding: '12px 0', borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e', fontSize: '13px', fontWeight: '600', cursor: 'pointer'
  },
  methodBtnActive: {
    flex: 1, padding: '12px 0', borderRadius: '10px',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none',
    color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer'
  },
  
  paymentsList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  listTitle: { fontSize: '12px', color: '#8b8b9e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px', marginTop: '0' },
  paymentItem: { 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    padding: '8px 12px', borderRadius: '8px'
  },
  paymentMethod: { fontSize: '13px', color: '#8b8b9e', marginRight: '8px' },
  paymentAmount: { fontSize: '14px', color: '#10b981', fontWeight: '700' },
  paymentTip: { fontSize: '11px', color: '#f59e0b', marginLeft: '6px' },
  deleteBtn: { backgroundColor: 'transparent', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', cursor: 'pointer' },
  
  footer: {
    padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)'
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white',
    fontWeight: '700', fontSize: '15px', padding: '14px 24px', borderRadius: '12px',
    border: 'none', width: '100%', cursor: 'pointer'
  }
};
