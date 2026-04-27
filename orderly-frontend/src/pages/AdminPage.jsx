import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: '📋 Kategoriler' },
    { id: 'menu',       label: '🍕 Menü Öğeleri' },
    { id: 'tables',     label: '🪑 Masalar' },
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.title}>⚙️ Yönetim Paneli</h2>

        {/* Sekmeler */}
        <div style={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? styles.tabActive : styles.tab}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* İçerik */}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'menu'       && <MenuTab />}
        {activeTab === 'tables'     && <TablesTab />}
      </div>
    </div>
  );
}

// ─── KATEGORİLER ────────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', displayOrder: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    setCategories(res.data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/categories', {
        ...form,
        displayOrder: Number(form.displayOrder) || 0,
      });
      setForm({ name: '', description: '', displayOrder: '' });
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Kategoriyi silmek istiyor musunuz?')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Silinemedi');
    }
  };

  return (
    <div style={styles.tabContent}>
      {/* Form */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Yeni Kategori</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Kategori adı *"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} placeholder="Açıklama"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={styles.input} placeholder="Sıra numarası" type="number"
            value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} />
          {error && <p style={styles.error}>⚠️ {error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : '+ Kategori Ekle'}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div style={styles.list}>
        {categories.map(cat => (
          <div key={cat.id} style={styles.listItem}>
            <div>
              <p style={styles.listName}>{cat.name}</p>
              <p style={styles.listSub}>{cat.description || '—'} • Sıra: {cat.displayOrder}</p>
            </div>
            <div style={styles.listActions}>
              <span style={cat.active ? styles.activeBadge : styles.inactiveBadge}>
                {cat.active ? 'Aktif' : 'Pasif'}
              </span>
              <button onClick={() => handleDelete(cat.id)} style={styles.deleteBtn}>Sil</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MENÜ ÖĞELERİ ───────────────────────────────────────────────
function MenuTab() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: '', name: '', description: '', price: '', preparationTimeMinutes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAll = async () => {
    const [menuRes, catRes] = await Promise.all([
      api.get('/api/menu'),
      api.get('/api/categories'),
    ]);
    setItems(menuRes.data);
    setCategories(catRes.data);
    if (catRes.data.length > 0 && !form.categoryId) {
      setForm(f => ({ ...f, categoryId: catRes.data[0].id }));
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/menu', {
        ...form,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        preparationTimeMinutes: Number(form.preparationTimeMinutes) || null,
      });
      setForm(f => ({ ...f, name: '', description: '', price: '', preparationTimeMinutes: '' }));
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    await api.patch(`/api/menu/${id}/availability`);
    fetchAll();
  };

  return (
    <div style={styles.tabContent}>
      {/* Form */}
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Yeni Menü Öğesi</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <select style={styles.input} value={form.categoryId}
            onChange={e => setForm({...form, categoryId: e.target.value})} required>
            <option value="">Kategori seçin *</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input style={styles.input} placeholder="Ürün adı *"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} placeholder="Açıklama"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={styles.input} placeholder="Fiyat (₺) *" type="number" step="0.01"
            value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
          <input style={styles.input} placeholder="Hazırlık süresi (dakika)"
            type="number" value={form.preparationTimeMinutes}
            onChange={e => setForm({...form, preparationTimeMinutes: e.target.value})} />
          {error && <p style={styles.error}>⚠️ {error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : '+ Menü Öğesi Ekle'}
          </button>
        </form>
      </div>

      {/* Liste */}
      <div style={styles.list}>
        {items.map(item => (
          <div key={item.id} style={styles.listItem}>
            <div>
              <p style={styles.listName}>{item.name}</p>
              <p style={styles.listSub}>{item.categoryName} • ₺{Number(item.price).toFixed(2)}</p>
            </div>
            <div style={styles.listActions}>
              <button onClick={() => handleToggle(item.id)}
                style={item.available ? styles.activeBadge : styles.inactiveBadge}>
                {item.available ? 'Aktif' : 'Pasif'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MASALAR ────────────────────────────────────────────────────
function TablesTab() {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ tableNumber: '', capacity: '', location: 'INDOOR' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTables = async () => {
    const res = await api.get('/api/tables');
    setTables(res.data);
  };

  useEffect(() => { fetchTables(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await api.post('/api/tables', { ...form, capacity: Number(form.capacity) });
      setForm({ tableNumber: '', capacity: '', location: 'INDOOR' });
      fetchTables();
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally { setLoading(false); }
  };

  const downloadQr = async (id, tableNumber) => {
    try {
      const res = await api.get(`/api/tables/${id}/qr`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `masa-${tableNumber}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('QR kod indirilemedi');
    }
  };

  return (
    <div style={styles.tabContent}>
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Yeni Masa</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Masa numarası (örn: A1) *"
            value={form.tableNumber} onChange={e => setForm({...form, tableNumber: e.target.value})} required />
          <input style={styles.input} placeholder="Kapasite *" type="number"
            value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} required />
          <select style={styles.input} value={form.location}
            onChange={e => setForm({...form, location: e.target.value})}>
            <option value="INDOOR">🏠 İç Mekan</option>
            <option value="OUTDOOR">🌿 Dış Mekan</option>
          </select>
          {error && <p style={styles.error}>⚠️ {error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : '+ Masa Ekle'}
          </button>
        </form>
      </div>

      <div style={styles.list}>
        {tables.map(table => (
          <div key={table.id} style={styles.listItem}>
            <div>
              <p style={styles.listName}>Masa {table.tableNumber}</p>
              <p style={styles.listSub}>
                👥 {table.capacity} kişilik •
                {table.location === 'INDOOR' ? ' 🏠 İç mekan' : ' 🌿 Dış mekan'}
              </p>
            </div>
            <div style={styles.listActions}>
              <span style={
                table.status === 'AVAILABLE' ? styles.activeBadge :
                table.status === 'OCCUPIED' ? styles.occupiedBadge : styles.inactiveBadge
              }>
                {table.status === 'AVAILABLE' ? 'Boş' :
                 table.status === 'OCCUPIED' ? 'Dolu' : 'Rezerve'}
              </span>
              <button onClick={() => downloadQr(table.id, table.tableNumber)} style={styles.qrBtn}>
                📷 QR İndir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
const styles = {
  page: { minHeight: '100vh', backgroundColor: '#0a0a0f' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '32px 24px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#f1f1f1', marginBottom: '24px' },

  tabs: { display: 'flex', gap: '8px', marginBottom: '32px' },
  tab: {
    padding: '10px 20px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', color: '#8b8b9e', fontSize: '14px', fontWeight: '500',
  },
  tabActive: {
    padding: '10px 20px', borderRadius: '10px',
    background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))',
    border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: '14px', fontWeight: '700',
  },

  tabContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '24px',
  },
  formTitle: { fontSize: '16px', fontWeight: '700', color: '#f1f1f1', marginBottom: '16px' },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '12px 14px', color: '#f1f1f1', fontSize: '14px',
    outline: 'none', fontFamily: 'Inter, sans-serif',
  },
  error: {
    color: '#ef4444', fontSize: '13px', backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px',
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white',
    fontWeight: '700', fontSize: '14px', padding: '13px', borderRadius: '10px',
  },

  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px', padding: '14px 18px',
  },
  listName: { fontSize: '15px', fontWeight: '600', color: '#f1f1f1' },
  listSub: { fontSize: '12px', color: '#8b8b9e', marginTop: '3px' },
  listActions: { display: 'flex', alignItems: 'center', gap: '10px' },

  activeBadge: {
    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981',
    border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer',
  },
  inactiveBadge: {
    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
  },
  occupiedBadge: {
    padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  deleteBtn: {
    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  qrBtn: {
    padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6',
    border: '1px solid rgba(59,130,246,0.2)',
  },
};

