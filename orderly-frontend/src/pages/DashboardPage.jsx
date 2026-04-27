import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import OrderModal from '../components/OrderModal';
import api from '../api/axios';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'Boş',     color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)' },
  OCCUPIED:  { label: 'Dolu',    color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)' },
  RESERVED:  { label: 'Rezerve', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
};

export default function DashboardPage() {
  const [tables, setTables]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTable, setSelectedTable] = useState(null); // Modal için

  const fetchTables = async () => {
    try {
      const res = await api.get('/api/tables');
      setTables(res.data);
    } catch (e) {
      console.error('Masalar yüklenemedi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const stats = {
    total:     tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied:  tables.filter(t => t.status === 'OCCUPIED').length,
    reserved:  tables.filter(t => t.status === 'RESERVED').length,
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.content}>
        <div style={styles.header}>
          <h2 style={styles.title}>Masa Durumları</h2>
          <button onClick={fetchTables} style={styles.refreshBtn}>🔄 Yenile</button>
        </div>

        {/* İstatistik Kartları */}
        <div style={styles.statsGrid}>
          <StatCard label="Toplam Masa" value={stats.total}     color="#3b82f6" />
          <StatCard label="Boş"         value={stats.available} color="#10b981" />
          <StatCard label="Dolu"        value={stats.occupied}  color="#ef4444" />
          <StatCard label="Rezerve"     value={stats.reserved}  color="#f59e0b" />
        </div>

        {/* Masa Kartları */}
        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : tables.length === 0 ? (
          <p style={styles.loadingText}>Henüz masa eklenmemiş.</p>
        ) : (
          <div style={styles.tablesGrid}>
            {tables.map(table => {
              const status = STATUS_CONFIG[table.status] || STATUS_CONFIG.AVAILABLE;
              return (
                <div
                  key={table.id}
                  style={styles.tableCard}
                  onClick={() => setSelectedTable(table)} // ← Tıklayınca modal aç
                >
                  {/* Masa Numarası */}
                  <div style={styles.tableTop}>
                    <span style={styles.tableNumber}>Masa {table.tableNumber}</span>
                    <span style={{
                      ...styles.statusBadge,
                      color: status.color,
                      backgroundColor: status.bg,
                      border: `1px solid ${status.border}`,
                    }}>
                      {status.label}
                    </span>
                  </div>

                  {/* Detaylar */}
                  <div style={styles.tableDetails}>
                    <span style={styles.detail}>👥 {table.capacity} kişilik</span>
                    <span style={styles.detail}>
                      {table.location === 'INDOOR' ? '🏠 İç mekan' : '🌿 Dış mekan'}
                    </span>
                  </div>

                  {/* Durum çubuğu */}
                  <div style={{
                    ...styles.tableStatusBar,
                    backgroundColor: status.bg,
                    borderTop: `1px solid ${status.border}`,
                  }}>
                    <span style={{ color: status.color, fontSize: '13px', fontWeight: '600' }}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sipariş Modalı */}
      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
          onSuccess={fetchTables}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={styles.statCard}>
      <span style={{ ...styles.statValue, color }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0a0f' },
  content: { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '24px',
  },
  title:      { fontSize: '24px', fontWeight: '700', color: '#f1f1f1' },
  refreshBtn: {
    padding: '8px 16px', borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#8b8b9e', fontSize: '13px', fontWeight: '500',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px', marginBottom: '32px',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '24px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  statValue: { fontSize: '36px', fontWeight: '800' },
  statLabel: { fontSize: '13px', color: '#8b8b9e', fontWeight: '500' },
  tablesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px',
  },
  tableCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', overflow: 'hidden',
    cursor: 'pointer',                           // ← tıklanabilir
    transition: 'transform 0.15s, border-color 0.15s',
  },
  tableTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px',
  },
  tableNumber: { fontSize: '16px', fontWeight: '700', color: '#f1f1f1' },
  statusBadge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600', letterSpacing: '0.5px',
  },
  tableDetails: {
    display: 'flex', flexDirection: 'column',
    gap: '6px', padding: '0 16px 16px',
  },
  detail:          { fontSize: '13px', color: '#8b8b9e' },
  tableStatusBar:  { padding: '10px 16px', display: 'flex', justifyContent: 'center' },
  loadingText:     { textAlign: 'center', color: '#8b8b9e', marginTop: '60px', fontSize: '16px' },
};
