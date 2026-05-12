import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const STATUS_LABELS = {
  WAITING: 'Bekliyor',
  PREPARING: 'Hazırlanıyor',
  READY: 'Hazır',
  SERVED: 'Servis Edildi',
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/kitchen/orders'); // ✅ Düzeltildi
      setOrders(res.data);
    } catch (e) {
      console.error('Siparişler yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleStartOrder = async (orderId) => {
    try {
      await api.patch(`/api/kitchen/orders/${orderId}/start`); // ✅ Düzeltildi
      fetchOrders();
    } catch (e) {
      alert('Sipariş başlatılamadı!');
    }
  };

  const handleItemReady = async (itemId) => {
    try {
      await api.patch(`/api/kitchen/items/${itemId}/ready`); // ✅ Düzeltildi
      fetchOrders();
    } catch (e) {
      alert('Kalem güncellenemedi!');
    }
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await api.patch(`/api/kitchen/orders/${orderId}/complete`);
      fetchOrders();
    } catch (e) {
      alert('Sipariş teslim edilemedi!');
    }
  };

  const handleAllReady = async (orderId) => {
    try {
      await api.patch(`/api/kitchen/orders/${orderId}/ready-all`);
      fetchOrders();
    } catch (e) {
      alert('Toplu güncelleme başarısız oldu!');
    }
  };

  // ✅ Düzeltildi: orderStatus kullanıyoruz
  const pendingOrders    = orders.filter(o => o.orderStatus === 'PENDING');
  const inProgressOrders = orders.filter(o => o.orderStatus === 'IN_PROGRESS');
  const readyOrders      = orders.filter(o => o.orderStatus === 'READY');

  const renderTicket = (order, columnType) => {
    const isWaiting   = columnType === 'PENDING';
    const isPreparing = columnType === 'IN_PROGRESS';
    const isReady     = columnType === 'READY';

    return (
      <article key={order.orderId} style={{
        ...styles.ticket,
        border: isWaiting   ? '1px solid rgba(212, 175, 55, 0.3)' :
                isPreparing ? '1px solid rgba(212, 175, 55, 0.4)' :
                              '1px solid rgba(153, 144, 124, 0.3)',
      }}>
        {isWaiting && <div style={styles.ticketUrgentBar} />}

        <div style={styles.ticketHeader}>
          <div>
            <h3 style={{ ...styles.ticketId, color: isReady ? '#99907c' : '#f2ca50' }}>
              #{order.orderId}
            </h3>
            <p style={styles.ticketMeta}>
              Masa {order.tableNumber}
              {order.waiterName ? ` • ${order.waiterName}` : ''}
              {order.createdAt ? ` • ⏱ ${getElapsedTime(order.createdAt)}` : ''}
            </p>
          </div>
        </div>

        <div style={{ background: 'linear-gradient(to right, transparent, rgba(212, 175, 55, 0.3), transparent)', height: '1px', width: '100%' }} />

        <ul style={styles.ticketItems}>
          {order.items?.map(item => {
            const isDone = item.itemStatus === 'SERVED' || item.itemStatus === 'READY';
            return (
              <li key={item.id} style={{
                ...styles.ticketItem,
                opacity: isDone ? 0.5 : 1,
                textDecoration: item.itemStatus === 'SERVED' ? 'line-through' : 'none',
              }}>
                <span style={styles.itemQty}>{item.quantity}x</span>
                <div style={{ flex: 1 }}>
                  <p style={styles.itemName}>{item.menuItemName}</p>
                  {item.notes && <p style={styles.itemNotes}>- {item.notes}</p>}
                </div>
                {item.itemStatus === 'PREPARING' && isPreparing && (
                  <button onClick={() => handleItemReady(item.id)} style={styles.itemReadyBtn}>
                    Hazır
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {order.notes && (
          <div style={styles.orderNotes}>📋 {order.notes}</div>
        )}

        <div style={styles.ticketActions}>
          {isWaiting && (
            <button onClick={() => handleStartOrder(order.orderId)} style={styles.btnGhost}>
              HAZIRLANIYOR
            </button>
          )}
          {isPreparing && (
            <button
              onClick={() => handleAllReady(order.orderId)}
              style={styles.btnPrimary}
            >
              TÜMÜ HAZIR
            </button>
          )}
          {isReady && (
            <button onClick={() => handleCompleteOrder(order.orderId)} style={styles.btnPrimary}>
              TESLİM EDİLDİ / KALDIR
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Mutfak Ekranı</h1>
            <p style={styles.subtitle}>
              {new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} | Aktif Servis
            </p>
          </div>
          <button onClick={fetchOrders} style={styles.syncBtn}>
            🔄 Yenile
          </button>
        </header>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : orders.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✅</span>
            <p style={styles.emptyText}>Tüm siparişler tamamlandı!</p>
          </div>
        ) : (
          <div style={styles.board}>

            {/* Bekliyor */}
            <section style={styles.column}>
              <div style={styles.columnHeader}>
                <h2 style={styles.columnTitle}>
                  <span style={{ ...styles.statusDot, backgroundColor: '#ffb4ab', animation: 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  Bekliyor
                </h2>
                <span style={styles.countBadge}>{pendingOrders.length} Sipariş</span>
              </div>
              <div style={styles.columnBody}>
                {pendingOrders.map(o => renderTicket(o, 'PENDING'))}
              </div>
            </section>

            {/* Hazırlanıyor */}
            <section style={styles.column}>
              <div style={styles.columnHeader}>
                <h2 style={styles.columnTitle}>
                  <span style={{ ...styles.statusDot, backgroundColor: '#f2ca50', animation: 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                  Hazırlanıyor
                </h2>
                <span style={styles.countBadge}>{inProgressOrders.length} Sipariş</span>
              </div>
              <div style={styles.columnBody}>
                {inProgressOrders.map(o => renderTicket(o, 'IN_PROGRESS'))}
              </div>
            </section>

            {/* Hazır */}
            <section style={styles.column}>
              <div style={styles.columnHeader}>
                <h2 style={styles.columnTitle}>
                  <span style={{ ...styles.statusDot, backgroundColor: '#99907c' }} />
                  Hazır
                </h2>
                <span style={styles.countBadge}>{readyOrders.length} Sipariş</span>
              </div>
              <div style={{ ...styles.columnBody, opacity: 0.8 }}>
                {readyOrders.map(o => renderTicket(o, 'READY'))}
              </div>
            </section>

          </div>
        )}
      </main>
    </div>
  );
}

function getElapsedTime(createdAt) {
  if (!createdAt) return '-';
  const diff = Math.floor((Date.now() - new Date(createdAt)) / 60000);
  if (diff < 1)  return 'Az önce';
  if (diff < 60) return `${diff} dk`;
  return `${Math.floor(diff / 60)} sa ${diff % 60} dk`;
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#131313', display: 'flex', flexDirection: 'column' },
  main: {
    flex: 1,
    padding: '24px 64px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    fontWeight: '600',
    color: '#e5e2e1',
    lineHeight: '1.2',
  },
  subtitle: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#d0c5af',
    letterSpacing: '0.05em',
    marginTop: '4px',
  },
  syncBtn: {
    padding: '10px 20px',
    backgroundColor: '#d4af37',
    color: '#3c2f00',
    borderRadius: '4px',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
    border: 'none',
    cursor: 'pointer',
  },
  loadingText: { textAlign: 'center', color: '#d0c5af', marginTop: '60px' },
  emptyState: { textAlign: 'center', marginTop: '80px' },
  emptyIcon: { fontSize: '48px', display: 'block', marginBottom: '16px' },
  emptyText: { color: '#d0c5af', fontSize: '18px', fontFamily: "'Manrope', sans-serif" },

  board: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    overflow: 'hidden',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'rgba(27, 27, 27, 0.3)',
    borderRadius: '12px',
    border: '1px solid rgba(212, 175, 55, 0.05)',
    overflow: 'hidden',
  },
  columnHeader: {
    padding: '12px 16px',
    borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(53, 53, 53, 0.5)',
    backdropFilter: 'blur(8px)',
  },
  columnTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '24px',
    fontWeight: '600',
    color: '#e5e2e1',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    lineHeight: '1.3',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  countBadge: {
    fontFamily: "'Manrope', sans-serif",
    backgroundColor: '#353535',
    color: '#d0c5af',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '500',
  },
  columnBody: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },

  ticket: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    boxShadow: '0 20px 40px -10px rgba(5, 8, 20, 0.5)',
    position: 'relative',
    overflow: 'hidden',
  },
  ticketUrgentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '3px',
    height: '100%',
    backgroundColor: '#ffb4ab',
  },
  ticketHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: '8px',
  },
  ticketId: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  ticketMeta: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    color: '#d0c5af',
    letterSpacing: '0.03em',
    marginTop: '4px',
  },
  ticketItems: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '8px',
  },
  ticketItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  itemQty: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    color: '#f2ca50',
    letterSpacing: '0.05em',
    paddingTop: '2px',
  },
  itemName: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '16px',
    fontWeight: '400',
    color: '#e5e2e1',
    lineHeight: '1.6',
  },
  itemNotes: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    color: '#d0c5af',
    letterSpacing: '0.03em',
    marginTop: '2px',
  },
  itemReadyBtn: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: 'rgba(16,185,129,0.15)',
    color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  orderNotes: {
    margin: '0 0 4px 8px',
    padding: '8px 12px',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    border: '1px solid rgba(212, 175, 55, 0.15)',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#f2ca50',
    fontFamily: "'Manrope', sans-serif",
  },

  ticketActions: {
    marginTop: '8px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(212, 175, 55, 0.1)',
  },
  btnGhost: {
    width: '100%',
    padding: '14px',
    borderRadius: '4px',
    border: '1px solid rgba(212, 175, 55, 0.4)',
    backgroundColor: 'transparent',
    color: '#e5e2e1',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    cursor: 'pointer',
  },
  btnPrimary: {
    width: '100%',
    padding: '14px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#d4af37',
    color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.3)',
    cursor: 'pointer',
  },
};
