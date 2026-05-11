import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axios';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: 'Kategoriler' },
    { id: 'menu',       label: 'Menü Öğeleri' },
    { id: 'tables',     label: 'Masalar' },
  ];

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.content}>
        <p style={styles.headerLabel}>YÖNETİM</p>
        <h2 style={styles.title}>Sistem Ayarları</h2>

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

        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'menu'       && <MenuTab />}
        {activeTab === 'tables'     && <TablesTab />}
      </div>
    </div>
  );
}

function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]             = useState({ name: '', description: '', displayOrder: '' });
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

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
      <div style={styles.formCard}>
        <h3 style={styles.formTitle}>Yeni Kategori</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Kategori adı *"
            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={styles.input} placeholder="Açıklama"
            value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <input style={styles.input} placeholder="Sıra numarası" type="number"
            value={form.displayOrder} onChange={e => setForm({...form, displayOrder: e.target.value})} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : 'Kategori Ekle'}
          </button>
        </form>
      </div>

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

function MenuTab() {
  const [items, setItems]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm]           = useState({
    categoryId: '', name: '', description: '', price: '', preparationTimeMinutes: ''
  });
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

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

  const handleImageUpload = async (id, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/api/menu/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAll();
    } catch (e) {
      alert('Resim yüklenemedi!');
    }
  };

  return (
    <div style={styles.tabContent}>
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
          <input style={styles.input} placeholder="Hazırlık süresi (dakika)" type="number"
            value={form.preparationTimeMinutes}
            onChange={e => setForm({...form, preparationTimeMinutes: e.target.value})} />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : 'Menü Öğesi Ekle'}
          </button>
        </form>
      </div>

      <div style={styles.list}>
        {items.map(item => (
          <div key={item.id} style={styles.listItem}>
            <div style={styles.itemImageBox}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} style={styles.itemImage} />
              ) : (
                <span style={styles.itemImagePlaceholder}>🍴</span>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <p style={styles.listName}>{item.name}</p>
              <p style={styles.listSub}>{item.categoryName} • ₺{Number(item.price).toFixed(2)}</p>
            </div>

            <div style={styles.listActions}>
              <button onClick={() => handleToggle(item.id)}
                style={item.available ? styles.activeBadge : styles.inactiveBadge}>
                {item.available ? 'Aktif' : 'Pasif'}
              </button>
              <label style={styles.uploadBtn}>
                Resim
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={(e) => handleImageUpload(item.id, e.target.files[0])} />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TablesTab() {
  const [tables, setTables]   = useState([]);
  const [form, setForm]       = useState({ tableNumber: '', capacity: '', location: 'INDOOR' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

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
      const a   = document.createElement('a');
      a.href     = url;
      a.download = `masa-${tableNumber}-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('QR kod indirilemedi');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Masayı silmek istiyor musunuz?')) return;
    try {
      await api.delete(`/api/tables/${id}`);
      fetchTables();
    } catch (err) {
      alert(err.response?.data?.message || 'Masa silinemedi!');
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
            <option value="INDOOR">İç Mekan</option>
            <option value="OUTDOOR">Dış Mekan</option>
          </select>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Ekleniyor...' : 'Masa Ekle'}
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
                {table.location === 'INDOOR' ? ' İç mekan' : ' Dış mekan'}
              </p>
            </div>
            <div style={styles.listActions}>
              <span style={
                table.status === 'AVAILABLE' ? styles.activeBadge :
                table.status === 'OCCUPIED'  ? styles.occupiedBadge : styles.inactiveBadge
              }>
                {table.status === 'AVAILABLE' ? 'Boş' :
                 table.status === 'OCCUPIED'  ? 'Dolu' : 'Rezerve'}
              </span>
              <button onClick={() => downloadQr(table.id, table.tableNumber)} style={styles.qrBtn}>
                QR İndir
              </button>
              <button onClick={() => handleDeleteTable(table.id)} style={styles.deleteBtn}>
                Sil
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight: '100vh', backgroundColor: '#131313' },
  content: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  headerLabel: {
    fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: '500',
    letterSpacing: '0.1em', color: '#f2ca50', textTransform: 'uppercase', marginBottom: '8px',
  },
  title: {
    fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: '700',
    color: '#e5e2e1', marginBottom: '32px', lineHeight: '1.2',
  },

  tabs: { display: 'flex', gap: '8px', marginBottom: '32px' },
  tab: {
    padding: '10px 20px', borderRadius: '4px',
    backgroundColor: 'transparent', border: '1px solid rgba(153, 144, 124, 0.3)',
    color: '#d0c5af', fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: '600',
    letterSpacing: '0.05em',
  },
  tabActive: {
    padding: '10px 20px', borderRadius: '4px',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.4)',
    color: '#f2ca50', fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: '700',
    letterSpacing: '0.05em',
  },

  tabContent: { display: 'flex', flexDirection: 'column', gap: '24px' },
  formCard: {
    backgroundColor: 'rgba(28, 28, 28, 0.8)', backdropFilter: 'blur(16px)',
    border: '1px solid rgba(212, 175, 55, 0.15)', borderRadius: '8px', padding: '24px',
  },
  formTitle: {
    fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600',
    color: '#e5e2e1', marginBottom: '16px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: {
    backgroundColor: 'transparent', border: 'none',
    borderBottom: '1px solid rgba(229, 226, 225, 0.2)', borderRadius: '0',
    padding: '12px 0', color: '#e5e2e1', fontSize: '14px',
    outline: 'none', fontFamily: "'Manrope', sans-serif",
  },
  error: {
    fontFamily: "'Manrope', sans-serif", color: '#ffb4ab', fontSize: '13px',
    backgroundColor: 'rgba(147, 0, 10, 0.15)', border: '1px solid rgba(147, 0, 10, 0.3)',
    borderRadius: '4px', padding: '8px 12px',
  },
  submitBtn: {
    backgroundColor: '#d4af37', color: '#3c2f00',
    fontFamily: "'Manrope', sans-serif", fontWeight: '700', fontSize: '14px',
    padding: '14px', borderRadius: '4px', letterSpacing: '0.05em', marginTop: '8px',
    boxShadow: '0 10px 20px -10px rgba(212, 175, 55, 0.4)',
  },

  list:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  listItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    backgroundColor: 'rgba(28, 28, 28, 0.6)', border: '1px solid rgba(212, 175, 55, 0.08)',
    borderRadius: '8px', padding: '14px 16px',
  },
  listName: { fontFamily: "'Manrope', sans-serif", fontSize: '15px', fontWeight: '600', color: '#e5e2e1' },
  listSub:  { fontFamily: "'Manrope', sans-serif", fontSize: '12px', color: '#d0c5af', marginTop: '3px' },
  listActions: { display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' },

  itemImageBox: {
    width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0,
    backgroundColor: 'rgba(32, 32, 31, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1px solid rgba(212, 175, 55, 0.1)',
  },
  itemImage:            { width: '100%', height: '100%', objectFit: 'cover' },
  itemImagePlaceholder: { fontSize: '20px', opacity: 0.4 },

  activeBadge: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(212, 175, 55, 0.1)', color: '#d4af37',
    border: '1px solid rgba(212, 175, 55, 0.3)', cursor: 'pointer',
    fontFamily: "'Manrope', sans-serif", letterSpacing: '0.03em',
  },
  inactiveBadge: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(255, 180, 171, 0.1)', color: '#ffb4ab',
    border: '1px solid rgba(255, 180, 171, 0.2)', cursor: 'pointer',
    fontFamily: "'Manrope', sans-serif", letterSpacing: '0.03em',
  },
  occupiedBadge: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(255, 180, 171, 0.1)', color: '#ffb4ab',
    border: '1px solid rgba(255, 180, 171, 0.2)',
    fontFamily: "'Manrope', sans-serif", letterSpacing: '0.03em',
  },
  deleteBtn: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'transparent', color: '#ffb4ab',
    border: '1px solid rgba(255, 180, 171, 0.3)',
    fontFamily: "'Manrope', sans-serif",
  },
  uploadBtn: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'rgba(212, 175, 55, 0.05)', color: '#f2ca50',
    border: '1px solid rgba(212, 175, 55, 0.2)', cursor: 'pointer',
    fontFamily: "'Manrope', sans-serif",
  },
  qrBtn: {
    padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
    backgroundColor: 'transparent', color: '#d0c5af',
    border: '1px solid rgba(153, 144, 124, 0.3)',
    fontFamily: "'Manrope', sans-serif",
  },
};
