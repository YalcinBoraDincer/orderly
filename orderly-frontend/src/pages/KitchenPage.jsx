import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

const ORDER_STATUS = {
  PENDING:     { label: 'Bekliyor',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  IN_PROGRESS: { label: 'Hazırlanıyor', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  READY:       { label: 'Hazır',        color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const ITEM_STATUS = {
  WAITING:   { label: 'Bekliyor',      color: '#8b8b9e' },
  PREPARING: { label: 'Hazırlanıyor',  color: '#3b82f6' },
  READY:     { label: '✅ Hazır',      color: '#10b981' },
  SERVED:    { label: 'Servis edildi', color: '#8b8b9e' },
};

export default function KitchenPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/kitchen/orders');
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
      await api.patch(`/api/kitchen/orders/${orderId}/start`);
      fetchOrders();
    } catch (e) {
      alert('Sipariş başlatılamadı!');
    }
  };

  const handleItemReady = async (itemId) => {
    try {
      await api.patch(`/api/kitchen/items/${itemId}/ready`);
      fetchOrders();
    } catch (e) {
      alert('Kalem güncellenemedi!');
    }
  };

  // orderStatus kullanıyoruz (API'den böyle geliyor)
  const pendingOrders    = orders.filter(o => o.orderStatus === 'PENDING');
  const inProgressOrders = orders.filter(o => o.orderStatus === 'IN_PROGRESS');
  const readyOrders      = orders.filter(o => o.orderStatus === 'READY');

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>👨‍🍳 Mutfak Ekranı</h2>
          <div style={styles.headerRight}>
            <span style={styles.autoRefresh}>🔄 10sn'de bir güncellenir</span>
            <button onClick={fetchOrders} style={styles.refreshBtn}>Şimdi Yenile</button>
          </div>
        </div>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : orders.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>✅</span>
            <p style={styles.emptyText}>Tüm siparişler tamamlandı!</p>
          </div>
        ) : (
          <div style={styles.columns}>

            {/* BEKLEYEN */}
            <div style={styles.column}>
              <div style={styles.columnHeader}>
                <span style={styles.dot('#f59e0b')} />
                <h3 style={styles.columnTitle}>Bekliyor</h3>
                <span style={styles.columnCount}>{pendingOrders.length}</span>
              </div>
              {pendingOrders.map(order => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onStart={() => handleStartOrder(order.orderId)}
                  onItemReady={handleItemReady}
                />
              ))}
            </div>

            {/* HAZIRLANIYOR */}
            <div style={styles.column}>
              <div style={styles.columnHeader}>
                <span style={styles.dot('#3b82f6')} />
                <h3 style={styles.columnTitle}>Hazırlanıyor</h3>
                <span style={styles.columnCount}>{inProgressOrders.length}</span>
              </div>
              {inProgressOrders.map(order => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onItemReady={handleItemReady}
                />
              ))}
            </div>

            {/* HAZIR */}
            <div style={styles.column}>
              <div style={styles.columnHeader}>
                <span style={styles.dot('#10b981')} />
                <h3 style={styles.columnTitle}>Hazır</h3>
                <span style={styles.columnCount}>{readyOrders.length}</span>
              </div>
              {readyOrders.map(order => (
                <OrderCard key={order.orderId} order={order} />
              ))}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, onStart, onItemReady }) {
  // orderStatus kullanıyoruz
  const status  = ORDER_STATUS[order.orderStatus] || ORDER_STATUS.PENDING;
  const elapsed = getElapsedTime(order.createdAt);

  return (
    <div style={styles.orderCard}>
      {/* Başlık */}
      <div style={{ ...styles.orderHeader, backgroundColor: status.bg }}>
        <div>
          <span style={styles.tableLabel}>Masa {order.tableNumber}</span>
          <span style={{ ...styles.statusLabel, color: status.color }}>
            {status.label}
          </span>
        </div>
        <div style={styles.orderMeta}>
          <span style={styles.orderId}>#{order.orderId}</span>
          <span style={styles.elapsed}>⏱ {elapsed}</span>
        </div>
      </div>

      {/* Kalemler */}
      <div style={styles.items}>
        {order.items?.map(item => {
          const itemStatus = ITEM_STATUS[item.itemStatus] || ITEM_STATUS.WAITING;
          const isReady    = item.itemStatus === 'READY' || item.itemStatus === 'SERVED';

          return (
            <div key={item.id} style={styles.item}>
              <div style={styles.itemLeft}>
                <span style={styles.itemQty}>{item.quantity}x</span>
                <div>
                  <p style={{
                    ...styles.itemName,
                    textDecoration: isReady ? 'line-through' : 'none',
                    opacity: isReady ? 0.5 : 1,
                  }}>
                    {item.menuItemName}
                  </p>
                  {item.notes && <p style={styles.itemNotes}>📝 {item.notes}</p>}
                </div>
              </div>
              <div style={styles.itemRight}>
                <span style={{ color: itemStatus.color, fontSize: '12px', fontWeight: '600' }}>
                  {itemStatus.label}
                </span>
                {item.itemStatus === 'PREPARING' && onItemReady && (
                  <button onClick={() => onItemReady(item.id)} style={styles.readyBtn}>
                    Hazır
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sipariş Notu */}
      {order.notes && (
        <div style={styles.orderNotes}>📋 {order.notes}</div>
      )}

      {/* Başlat Butonu — orderStatus kullanıyoruz */}
      {order.orderStatus === 'PENDING' && onStart && (
        <button onClick={onStart} style={styles.startBtn}>
          🚀 Hazırlamaya Başla
        </button>
      )}
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
  page:    { minHeight: '100vh', backgroundColor: '#0a0a0f' },
  content: { maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' },
  header:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' },
  title:   { fontSize: '24px', fontWeight: '700', color: '#f1f1f1' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  autoRefresh: { fontSize: '12px', color: '#8b8b9e' },
  refreshBtn:  {
    padding: '8px 16px', borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e', fontSize: '13px',
  },
  columns: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' },
  column:  { display: 'flex', flexDirection: 'column', gap: '16px' },
  columnHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
  columnTitle:  { fontSize: '15px', fontWeight: '700', color: '#f1f1f1', flex: 1 },
  columnCount:  {
    backgroundColor: 'rgba(255,255,255,0.08)', color: '#8b8b9e',
    padding: '2px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
  },
  dot: (color) => ({
    width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color, display: 'inline-block',
  }),
  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', overflow: 'hidden',
  },
  orderHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 16px',
  },
  tableLabel:  { fontSize: '16px', fontWeight: '700', color: '#f1f1f1', display: 'block' },
  statusLabel: { fontSize: '12px', fontWeight: '600', marginTop: '2px', display: 'block' },
  orderMeta:   { textAlign: 'right' },
  orderId:     { fontSize: '13px', color: '#8b8b9e', display: 'block' },
  elapsed:     { fontSize: '12px', color: '#f59e0b', fontWeight: '600', display: 'block', marginTop: '2px' },
  items: { padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  item:  {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)',
  },
  itemLeft:  { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  itemQty:   {
    backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b',
    padding: '2px 8px', borderRadius: '6px', fontSize: '13px', fontWeight: '700',
    minWidth: '28px', textAlign: 'center',
  },
  itemName:  { fontSize: '14px', color: '#f1f1f1', fontWeight: '500' },
  itemNotes: { fontSize: '12px', color: '#8b8b9e', marginTop: '2px' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' },
  readyBtn:  {
    padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981',
    border: '1px solid rgba(16,185,129,0.3)',
  },
  orderNotes: {
    margin: '0 16px 12px', padding: '8px 12px',
    backgroundColor: 'rgba(245,158,11,0.08)',
    border: '1px solid rgba(245,158,11,0.15)',
    borderRadius: '8px', fontSize: '13px', color: '#f59e0b',
  },
  startBtn: {
    width: '100%', padding: '12px',
    backgroundColor: 'rgba(59,130,246,0.15)',
    borderTop: '1px solid rgba(59,130,246,0.2)',
    color: '#3b82f6', fontSize: '14px', fontWeight: '700',
  },
  loadingText: { textAlign: 'center', color: '#8b8b9e', marginTop: '60px' },
  emptyState:  { textAlign: 'center', marginTop: '80px' },
  emptyIcon:   { fontSize: '48px', display: 'block', marginBottom: '16px' },
  emptyText:   { color: '#8b8b9e', fontSize: '18px' },
};
