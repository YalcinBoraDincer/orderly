import { useState, useEffect } from 'react';
import api from '../api/axios';
import PaymentModal from './PaymentModal';

export default function OrderModal({ table, onClose, onSuccess }) {
  const [menuItems, setMenuItems]     = useState([]);
  const [categories, setCategories]   = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [cart, setCart]               = useState({});
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

  const filteredItems = menuItems.filter(i => i.categoryId === activeCategory);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.headerLabel}>MASA {table.tableNumber}</p>
            <h2 style={styles.headerTitle}>
              {table.status === 'OCCUPIED' && activeOrder ? `Sipariş #${activeOrder.id}` : 'Yeni Sipariş'}
            </h2>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : table.status === 'OCCUPIED' && activeOrder ? (
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
                  onSuccess();
                  onClose();
                }}
              />
            )}
          </>
        ) : (
          <div style={styles.body}>
            {/* Category tabs */}
            <div style={styles.categoryBar} className="scrollbar-hide">
              {categories.map(cat => (
                <button key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={activeCategory === cat.id ? styles.catActive : styles.cat}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Item list */}
            <div style={styles.itemList}>
              {filteredItems.length === 0 ? (
                <p style={styles.emptyText}>Bu kategoride ürün yok</p>
              ) : filteredItems.map(item => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} style={styles.menuItem}>
                    <div>
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

            {/* Notes */}
            <div style={styles.notesArea}>
              <input
                style={styles.notesInput}
                placeholder="Sipariş notu (opsiyonel)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            {/* Footer */}
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
                {submitting ? 'Oluşturuluyor...' : 'Sipariş Ver'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveOrderView({ order, onOpenPayment, submitting }) {
  const STATUS_COLORS = {
    WAITING:   '#d0c5af',
    PREPARING: '#f2ca50',
    READY:     '#d4af37',
    SERVED:    '#99907c',
  };

  return (
    <div style={styles.body}>
      <div style={styles.orderInfo}>
        <span style={styles.orderInfoLabel}>Sipariş #{order.id}</span>
        <span style={styles.orderStatus}>{order.status}</span>
      </div>

      <div style={styles.itemList}>
        {order.items?.map(item => (
          <div key={item.id} style={styles.activeItem}>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span style={styles.activeItemQty}>{item.quantity}</span>
              <span style={styles.activeItemName}>{item.menuItemName}</span>
            </div>
            <div style={styles.activeItemRight}>
              <span style={{ color: STATUS_COLORS[item.itemStatus] || '#99907c', fontSize: '12px', fontWeight: '600', letterSpacing: '0.03em' }}>
                {item.itemStatus}
              </span>
              <span style={styles.activeItemPrice}>₺{Number(item.subTotal).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <div style={styles.cartSummary}>
          <span style={styles.cartCount}>Kalan Tutar</span>
          <span style={styles.cartTotal}>₺{Number(order.remainingAmount || order.totalAmount).toFixed(2)}</span>
        </div>
        <button onClick={onOpenPayment} disabled={submitting} style={styles.paymentBtn}>
          {submitting ? 'Bekleniyor...' : 'Ödeme Al'}
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
    backgroundColor: '#1b1b1b', border: '1px solid rgba(212, 175, 55, 0.2)',
    borderRadius: '8px', width: '100%', maxWidth: '520px',
    maxHeight: '85vh', display: 'flex', flexDirection: 'column',
    overflow: 'hidden', boxShadow: '0 40px 60px -15px rgba(5, 8, 20, 0.5)',
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
    color: '#f2ca50', lineHeight: '1.3',
  },
  closeBtn: {
    backgroundColor: 'transparent', border: '1px solid rgba(212, 175, 55, 0.2)',
    color: '#d0c5af', width: '36px', height: '36px', borderRadius: '4px', fontSize: '16px',
  },
  body: { flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  loadingText: { textAlign: 'center', color: '#d0c5af', padding: '40px' },
  emptyText: { textAlign: 'center', color: '#d0c5af', padding: '30px' },

  categoryBar: {
    display: 'flex', gap: '8px', padding: '16px 24px',
    overflowX: 'auto', borderBottom: '1px solid rgba(212, 175, 55, 0.05)',
  },
  cat: {
    padding: '8px 16px', borderRadius: '9999px', whiteSpace: 'nowrap',
    backgroundColor: '#20201f', border: '1px solid rgba(153, 144, 124, 0.2)',
    color: '#d0c5af', fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: '600', letterSpacing: '0.05em',
  },
  catActive: {
    padding: '8px 16px', borderRadius: '9999px', whiteSpace: 'nowrap',
    backgroundColor: '#d4af37', border: 'none', color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em',
  },

  itemList: { flex: 1, overflowY: 'auto', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  menuItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px', backgroundColor: 'rgba(32, 32, 31, 0.5)',
    border: '1px solid rgba(212, 175, 55, 0.08)', borderRadius: '8px',
  },
  menuItemName: { fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: '600', color: '#e5e2e1' },
  menuItemPrice: { fontFamily: "'Playfair Display', serif", fontSize: '14px', color: '#f2ca50', fontWeight: '600', marginTop: '4px' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '30px', height: '30px', borderRadius: '4px', fontSize: '16px', fontWeight: '700',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#f2ca50', border: '1px solid rgba(212, 175, 55, 0.3)',
  },
  qtyBtnAdd: {
    width: '30px', height: '30px', borderRadius: '4px', fontSize: '16px', fontWeight: '700',
    backgroundColor: '#d4af37', color: '#3c2f00', border: 'none',
  },
  qtyNum: { fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: '700', color: '#e5e2e1', minWidth: '20px', textAlign: 'center' },

  notesArea: { padding: '0 24px 12px' },
  notesInput: {
    width: '100%', backgroundColor: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(229, 226, 225, 0.2)',
    padding: '12px 0', color: '#e5e2e1', fontSize: '14px',
    outline: 'none', fontFamily: "'Manrope', sans-serif", boxSizing: 'border-box',
  },

  footer: {
    padding: '20px 24px', borderTop: '1px solid rgba(212, 175, 55, 0.1)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
  },
  cartSummary: { display: 'flex', flexDirection: 'column', gap: '2px' },
  cartCount: { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af', letterSpacing: '0.03em' },
  cartTotal: { fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: '#f2ca50' },
  orderBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '14px 24px', borderRadius: '4px', border: 'none', whiteSpace: 'nowrap',
    letterSpacing: '0.05em', boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },
  paymentBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00', border: 'none',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '14px 24px', borderRadius: '4px', letterSpacing: '0.05em',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },

  orderInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '16px 24px', backgroundColor: 'rgba(32, 32, 31, 0.5)',
    borderBottom: '1px solid rgba(212, 175, 55, 0.08)',
  },
  orderInfoLabel: { fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: '600', color: '#f2ca50' },
  orderStatus: {
    fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: '600', color: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '4px 12px', borderRadius: '4px', letterSpacing: '0.05em',
  },
  activeItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 14px', backgroundColor: 'rgba(32, 32, 31, 0.3)',
    border: '1px solid rgba(212, 175, 55, 0.06)', borderRadius: '8px',
  },
  activeItemQty: {
    fontFamily: "'Manrope', sans-serif", backgroundColor: 'rgba(212, 175, 55, 0.1)',
    color: '#f2ca50', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: '700',
    letterSpacing: '0.05em', minWidth: '28px', textAlign: 'center',
  },
  activeItemName: { fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#e5e2e1', fontWeight: '500' },
  activeItemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' },
  activeItemPrice: { fontFamily: "'Manrope', sans-serif", fontSize: '13px', color: '#d0c5af' },
};
