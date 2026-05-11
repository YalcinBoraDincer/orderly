import { useState, useEffect } from 'react';
import api from '../api/axios';
import PaymentModal from './PaymentModal';

export default function OrderModal({ table, onClose, onSuccess }) {
  const [menuItems, setMenuItems]     = useState([]);
  const [categories, setCategories]   = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart]               = useState({}); // { menuItemId: quantity }
  const [notes, setNotes]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          api.get('/api/menu'),
          api.get('/api/categories'),
        ]);
        setMenuItems(menuRes.data.filter(i => i.available));
        setCategories(catRes.data);
        if (catRes.data.length > 0) setActiveCategory(catRes.data[0].id);

        // Dolu masaysa aktif siparişi getir
        if (table.status === 'OCCUPIED') {
          const orderRes = await api.get(`/api/orders/table/${table.id}/active`);
          setActiveOrder(orderRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [table]);

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const qty = (prev[itemId] || 0) - 1;
      if (qty <= 0) { const next = { ...prev }; delete next[itemId]; return next; }
      return { ...prev, [itemId]: qty };
    });
  };

  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = menuItems.find(i => i.id === Number(id));
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleCreateOrder = async () => {
    if (cartItemCount === 0) return alert('Sepet boş!');
    setSubmitting(true);
    try {
      const items = Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId: Number(menuItemId),
        quantity,
        notes: '',
      }));
      await api.post('/api/orders', { tableId: table.id, items, notes });
      onSuccess();
      onClose();
    } catch (e) {
      alert(e.response?.data?.message || 'Sipariş oluşturulamadı!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseOrder = async () => {
    if (!window.confirm('Siparişi kapatmak istiyor musunuz?')) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/orders/${activeOrder.id}/status`, { status: 'CLOSED' });
      onSuccess();
      onClose();
    } catch (e) {
      alert('Sipariş kapatılamadı!');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = menuItems.filter(i => i.categoryId === activeCategory);

  return (
    // Arka plan overlay
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Başlık */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Masa {table.tableNumber}</h2>
            <span style={styles.capacity}>👥 {table.capacity} kişilik •
              {table.location === 'INDOOR' ? ' 🏠 İç mekan' : ' 🌿 Dış mekan'}
            </span>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : table.status === 'OCCUPIED' && activeOrder ? (
          // ── DOLU MASA: Aktif Sipariş ──────────────────────────
          <>
            <ActiveOrderView
              order={activeOrder}
              onOpenPayment={() => setShowPaymentModal(true)}
              submitting={submitting}
            />
            {showPaymentModal && (
              <PaymentModal 
                order={activeOrder} 
                onClose={() => setShowPaymentModal(false)} 
                onSuccess={() => {
                  setShowPaymentModal(false);
                  onSuccess(); // Dashbaord'u yenile
                  onClose();   // Ana modalı kapat (masa boşa çıkmış olabilir)
                }} 
              />
            )}
          </>
        ) : (
          // ── BOŞ MASA: Sipariş Oluştur ─────────────────────────
          <div style={styles.body}>
            {/* Kategori sekmeleri */}
            <div style={styles.categoryBar}>
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={activeCategory === cat.id ? styles.catActive : styles.cat}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Ürün Listesi */}
            <div style={styles.itemList}>
              {filteredItems.length === 0 ? (
                <p style={styles.emptyText}>Bu kategoride ürün yok</p>
              ) : filteredItems.map(item => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} style={styles.menuItem}>
                    <div style={styles.menuItemInfo}>
                      <p style={styles.menuItemName}>{item.name}</p>
                      <p style={styles.menuItemPrice}>₺{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div style={styles.qtyControl}>
                      {qty > 0 && (
                        <>
                          <button onClick={() => removeFromCart(item.id)} style={styles.qtyBtn}>−</button>
                          <span style={styles.qtyNum}>{qty}</span>
                        </>
                      )}
                      <button onClick={() => addToCart(item.id)} style={styles.qtyBtnAdd}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sipariş Notu */}
            <div style={styles.notesArea}>
              <input
                style={styles.notesInput}
                placeholder="📝 Sipariş notu (opsiyonel)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Sepet özeti + Sipariş Ver */}
            <div style={styles.footer}>
              <div style={styles.cartSummary}>
                <span style={styles.cartCount}>{cartItemCount} ürün</span>
                <span style={styles.cartTotal}>₺{cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCreateOrder}
                disabled={cartItemCount === 0 || submitting}
                style={cartItemCount === 0 ? { ...styles.orderBtn, opacity: 0.4 } : styles.orderBtn}
              >
                {submitting ? 'Oluşturuluyor...' : '🍽️ Sipariş Ver'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Aktif sipariş görünümü
function ActiveOrderView({ order, onOpenPayment, submitting }) {
  const STATUS_COLORS = {
    WAITING:   '#8b8b9e',
    PREPARING: '#3b82f6',
    READY:     '#10b981',
    SERVED:    '#8b8b9e',
  };

  return (
    <div style={styles.body}>
      <div style={styles.orderInfo}>
        <span style={styles.orderInfoLabel}>Sipariş #{order.id}</span>
        <span style={styles.orderStatus}>{order.status}</span>
      </div>

      {/* Kalemler */}
      <div style={styles.itemList}>
        {order.items?.map(item => (
          <div key={item.id} style={styles.activeItem}>
            <div>
              <span style={styles.activeItemQty}>{item.quantity}x</span>
              <span style={styles.activeItemName}>{item.menuItemName}</span>
            </div>
            <div style={styles.activeItemRight}>
              <span style={{ color: STATUS_COLORS[item.itemStatus] || '#8b8b9e', fontSize: '12px', fontWeight: '600' }}>
                {item.itemStatus}
              </span>
              <span style={styles.activeItemPrice}>₺{Number(item.subTotal).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toplam + Kapat */}
      <div style={styles.footer}>
        <div style={styles.cartSummary}>
          <span style={styles.cartCount}>Kalan Tutar</span>
          <span style={styles.cartTotal}>₺{Number(order.remainingAmount || order.totalAmount).toFixed(2)}</span>
        </div>
        <button onClick={onOpenPayment} disabled={submitting} style={styles.closeOrderBtn}>
          {submitting ? 'Bekleniyor...' : '💳 Ödeme Al'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000, padding: '20px',
  },
  modal: {
    backgroundColor: '#111118', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px', width: '100%', maxWidth: '520px',
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  title: { fontSize: '20px', fontWeight: '700', color: '#f1f1f1' },
  capacity: { fontSize: '12px', color: '#8b8b9e', marginTop: '4px', display: 'block' },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e', width: '32px', height: '32px', borderRadius: '8px', fontSize: '16px',
  },
  body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  loadingText: { textAlign: 'center', color: '#8b8b9e', padding: '40px' },
  emptyText: { textAlign: 'center', color: '#8b8b9e', padding: '30px' },

  categoryBar: {
    display: 'flex', gap: '6px', padding: '16px 24px',
    overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)',
    scrollbarWidth: 'none',
  },
  cat: {
    padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#8b8b9e', fontSize: '13px', fontWeight: '500',
  },
  catActive: {
    padding: '6px 14px', borderRadius: '20px', whiteSpace: 'nowrap',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    border: 'none', color: 'white', fontSize: '13px', fontWeight: '700',
  },

  itemList: { flex: 1, overflowY: 'auto', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
  },
  menuItemInfo: {},
  menuItemName: { fontSize: '14px', fontWeight: '600', color: '#f1f1f1' },
  menuItemPrice: { fontSize: '13px', color: '#f59e0b', fontWeight: '600', marginTop: '3px' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '28px', height: '28px', borderRadius: '8px', fontSize: '16px', fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.08)', color: '#f1f1f1', border: 'none',
  },
  qtyBtnAdd: {
    width: '28px', height: '28px', borderRadius: '8px', fontSize: '16px', fontWeight: '700',
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', border: 'none',
  },
  qtyNum: { fontSize: '15px', fontWeight: '700', color: '#f1f1f1', minWidth: '20px', textAlign: 'center' },

  notesArea: { padding: '0 24px 12px' },
  notesInput: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px', padding: '10px 14px', color: '#f1f1f1', fontSize: '14px',
    outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
  },

  footer: {
    padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
  },
  cartSummary: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cartCount: { fontSize: '12px', color: '#8b8b9e' },
  cartTotal: { fontSize: '22px', fontWeight: '800', color: '#f59e0b' },
  orderBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white',
    fontWeight: '700', fontSize: '15px', padding: '13px 24px', borderRadius: '12px',
    border: 'none', whiteSpace: 'nowrap',
  },
  closeOrderBtn: {
    backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#10b981', fontWeight: '700', fontSize: '15px', padding: '13px 24px', borderRadius: '12px',
  },

  orderInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  orderInfoLabel: { fontSize: '15px', fontWeight: '700', color: '#f1f1f1' },
  orderStatus: {
    fontSize: '12px', fontWeight: '700', color: '#f59e0b',
    backgroundColor: 'rgba(245,158,11,0.1)', padding: '4px 10px', borderRadius: '20px',
  },
  activeItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px', backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px',
  },
  activeItemQty: {
    backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b',
    padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', marginRight: '10px',
  },
  activeItemName: { fontSize: '14px', color: '#f1f1f1', fontWeight: '500' },
  activeItemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  activeItemPrice: { fontSize: '13px', color: '#8b8b9e' },
};
