import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import OrderModal from '../components/OrderModal';
import api from '../api/axios';

const STATUS_CONFIG = {
  AVAILABLE: { label: 'BOŞ',     color: '#f2ca50', borderColor: 'rgba(212, 175, 55, 0.4)', bgStyle: 'gold-border-glow' },
  OCCUPIED:  { label: 'DOLU',    color: '#ffb4ab', borderColor: 'rgba(255, 180, 171, 0.2)', dotColor: '#ffb4ab' },
  RESERVED:  { label: 'REZERVE', color: '#c6c7c2', borderColor: 'rgba(153, 144, 124, 0.3)' },
};

export default function DashboardPage() {
  const [tables, setTables]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [filter, setFilter] = useState('ALL');

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

  const filteredTables = filter === 'ALL' ? tables : tables.filter(t => t.status === filter);

  const stats = {
    total:     tables.length,
    available: tables.filter(t => t.status === 'AVAILABLE').length,
    occupied:  tables.filter(t => t.status === 'OCCUPIED').length,
    reserved:  tables.filter(t => t.status === 'RESERVED').length,
  };

  return (
    <div style={styles.page}>
      <Navbar />

      <main style={styles.main}>
        <div style={styles.bgGlow} />

        <header style={styles.header}>
          <div>
            <p style={styles.headerLabel}>ANA SALON</p>
            <h1 style={styles.headerTitle}>Masa Düzeni</h1>
          </div>

          <div style={styles.filterChips}>
            <button
              onClick={() => setFilter('ALL')}
              style={filter === 'ALL' ? styles.chipActive : styles.chip}
            >
              Tüm Masalar
            </button>
            <button
              onClick={() => setFilter('AVAILABLE')}
              style={filter === 'AVAILABLE' ? styles.chipActive : styles.chip}
            >
              <span style={{...styles.dot, backgroundColor: '#f2ca50', boxShadow: '0 0 8px rgba(242, 202, 80, 0.8)'}} />
              Boş
            </button>
            <button
              onClick={() => setFilter('OCCUPIED')}
              style={filter === 'OCCUPIED' ? styles.chipActive : styles.chip}
            >
              <span style={{...styles.dot, backgroundColor: '#ffb4ab'}} />
              Dolu
            </button>
            <button
              onClick={() => setFilter('RESERVED')}
              style={filter === 'RESERVED' ? styles.chipActive : styles.chip}
            >
              <span style={{...styles.dot, backgroundColor: '#c6c7c2'}} />
              Rezerve
            </button>
          </div>
        </header>

        {loading ? (
          <p style={styles.loadingText}>Yükleniyor...</p>
        ) : filteredTables.length === 0 ? (
          <p style={styles.loadingText}>Henüz masa eklenmemiş.</p>
        ) : (
          <div style={styles.grid}>
            {filteredTables.map(table => {
              const status = STATUS_CONFIG[table.status] || STATUS_CONFIG.AVAILABLE;
              const isOccupied = table.status === 'OCCUPIED';
              const isAvailable = table.status === 'AVAILABLE';

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  style={{
                    ...styles.tableCard,
                    border: `1px solid ${status.borderColor}`,
                    ...(isOccupied ? { boxShadow: '0 10px 30px rgba(5, 8, 20, 0.5)' } : {}),
                    ...(isAvailable ? {
                      border: `1px solid rgba(212, 175, 55, 0.4)`,
                      boxShadow: '0 0 20px rgba(212, 175, 55, 0.15), inset 0 0 10px rgba(212, 175, 55, 0.05)'
                    } : {}),
                  }}
                >
                  {isOccupied && <div style={styles.occupiedBar} />}

                  <div style={styles.cardTop}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {isOccupied && <span style={styles.pulseDot} />}
                      <span style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontSize: '12px',
                        fontWeight: '500',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: status.color,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <span style={styles.capacityBadge}>👥 {table.capacity}</span>
                  </div>

                  <div style={styles.cardCenter}>
                    <h3 style={styles.tableNumber}>Masa {table.tableNumber}</h3>
                    <p style={styles.tableLocation}>
                      {table.location === 'INDOOR' ? 'İç Mekan' : 'Dış Mekan'}
                    </p>
                  </div>

                  {isAvailable && (
                    <div style={styles.cardBottom}>
                      <span style={styles.seatBtn}>Misafir Oturt</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

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

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#131313' },
  main: {
    flex: 1,
    padding: '40px 64px',
    position: 'relative',
  },
  bgGlow: {
    position: 'absolute',
    top: 0,
    left: '25%',
    width: '800px',
    height: '600px',
    background: 'radial-gradient(ellipse, rgba(212, 175, 55, 0.05) 0%, transparent 70%)',
    borderRadius: '50%',
    filter: 'blur(120px)',
    pointerEvents: 'none',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: '32px',
    borderBottom: '1px solid #20201f',
    marginBottom: '32px',
    position: 'relative',
    zIndex: 10,
  },
  headerLabel: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.1em',
    color: '#f2ca50',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  headerTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '48px',
    fontWeight: '700',
    color: '#e5e2e1',
    lineHeight: '1.1',
    letterSpacing: '-0.02em',
  },
  filterChips: {
    display: 'flex',
    gap: '12px',
    paddingBottom: '8px',
  },
  chip: {
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid rgba(153, 144, 124, 0.3)',
    backgroundColor: 'transparent',
    color: '#d0c5af',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.03em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  chipActive: {
    padding: '8px 16px',
    borderRadius: '9999px',
    border: '1px solid #f2ca50',
    backgroundColor: 'rgba(242, 202, 80, 0.1)',
    color: '#f2ca50',
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.03em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  loadingText: { textAlign: 'center', color: '#d0c5af', marginTop: '60px', fontSize: '16px', fontFamily: "'Manrope', sans-serif" },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
    position: 'relative',
    zIndex: 10,
  },
  tableCard: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)',
    backdropFilter: 'blur(16px)',
    borderRadius: '12px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '200px',
    cursor: 'pointer',
    transition: 'transform 0.3s, border-color 0.3s',
    position: 'relative',
    overflow: 'hidden',
  },
  occupiedBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '3px',
    background: 'linear-gradient(to right, rgba(255, 180, 171, 0.4), transparent)',
    borderRadius: '12px 12px 0 0',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pulseDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#ffb4ab',
    animation: 'pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  },
  capacityBadge: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '500',
    letterSpacing: '0.03em',
    color: '#d0c5af',
  },
  cardCenter: {
    textAlign: 'center',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableNumber: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '32px',
    fontWeight: '600',
    color: '#e5e2e1',
    lineHeight: '1.2',
  },
  tableLocation: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '14px',
    color: 'rgba(208, 197, 175, 0.5)',
    marginTop: '4px',
  },
  cardBottom: {
    display: 'flex',
    justifyContent: 'center',
  },
  seatBtn: {
    fontFamily: "'Manrope', sans-serif",
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.05em',
    color: '#f2ca50',
    padding: '8px 24px',
    border: '1px solid rgba(242, 202, 80, 0.5)',
    borderRadius: '4px',
    backgroundColor: 'rgba(242, 202, 80, 0.1)',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
};
