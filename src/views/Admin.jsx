import { useState } from 'react';
import { useMenu, useTables, useOrders, usePaymentDetails, useCurrency } from '../hooks/useStore';
import { Plus, Trash2, Home, QrCode, Save, Edit, Clock, DollarSign, TrendingUp, Users, RefreshCw, Sparkles, Search, Lock, KeyRound, LogOut, ShieldCheck, Upload, Link2, X, ChefHat } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { showToast } from '../utils/toast';
import { sound } from '../utils/sound';
import { compressImageFile } from '../utils/imageUtils';

export default function Admin() {
  const { menu, addMenuItem, removeMenuItem, updateMenuItem, toggleStockStatus } = useMenu();
  const { tables, addTable, updateTable, removeTable, regenerateTableToken } = useTables();
  const { orders, clearTable } = useOrders();
  const { paymentDetails, updatePaymentDetails } = usePaymentDetails();
  const { currency, setCurrency, formatPrice } = useCurrency();
  
  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('aura_admin_authenticated') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [adminPin, setAdminPin] = useState(() => localStorage.getItem('aura_admin_pin') || '1234');
  const [newPin, setNewPin] = useState('');
  const [kitchenPin, setKitchenPin] = useState(() => localStorage.getItem('aura_kitchen_pin') || '1234');
  const [newKitchenPin, setNewKitchenPin] = useState('');

  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    category: 'Mains', 
    prepTime: 10, 
    image: '', 
    description: '',
    isVeg: true,
    isSpicy: false,
    isGF: false 
  });
  
  const [editId, setEditId] = useState(null);
  const [newTableNo, setNewTableNo] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [paymentForm, setPaymentForm] = useState(paymentDetails);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'tables', 'orders', 'payment'
  const [searchQuery, setSearchQuery] = useState('');
  const [imageSourceType, setImageSourceType] = useState('file'); // 'file' or 'url'

  // Handle Admin Passcode Login
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === adminPin) {
      sound.playTap();
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_admin_authenticated', 'true');
      setPinError(false);
      showToast('Admin Portal Unlocked', 'success');
    } else {
      setPinError(true);
      sound.playTap();
      showToast('Incorrect PIN Code', 'error');
    }
  };

  const handleLockOut = () => {
    sound.playTap();
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_admin_authenticated');
    showToast('Admin Portal Locked', 'warning');
  };

  const handleChangePin = (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) {
      showToast('PIN must be at least 4 digits.', 'warning');
      return;
    }
    sound.playTap();
    localStorage.setItem('aura_admin_pin', newPin);
    setAdminPin(newPin);
    setNewPin('');
    showToast('Admin Security PIN updated successfully!', 'success');
  };

  const handleChangeKitchenPin = (e) => {
    e.preventDefault();
    if (!newKitchenPin || newKitchenPin.length < 4) {
      showToast('Kitchen PIN must be at least 4 digits.', 'warning');
      return;
    }
    sound.playTap();
    localStorage.setItem('aura_kitchen_pin', newKitchenPin);
    setKitchenPin(newKitchenPin);
    setNewKitchenPin('');
    showToast('Kitchen Display Passcode updated successfully!', 'success');
  };

  // Analytics Metrics
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && !o.paid).length;
  const occupiedTablesCount = tables.filter(t => orders.some(o => o.tableNo === t.number.toString() && !o.paid)).length;
  const totalSeatingCapacity = tables.reduce((sum, t) => sum + (t.capacity || 4), 0);
  const occupancyRate = tables.length > 0 ? Math.round((occupiedTablesCount / tables.length) * 100) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    sound.playTap();
    
    const formattedItem = {
      ...newItem,
      price: parseFloat(newItem.price),
      prepTime: parseInt(newItem.prepTime, 10) || 10,
      image: newItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      description: newItem.description || 'Delicious chef recommended dish prepared fresh on order.'
    };

    if (editId) {
      updateMenuItem({ ...formattedItem, id: editId });
      showToast(`Updated menu item: ${newItem.name}`, 'success');
      setEditId(null);
    } else {
      addMenuItem(formattedItem);
      showToast(`Added menu item: ${newItem.name}`, 'success');
    }
    setNewItem({ name: '', price: '', category: 'Mains', prepTime: 10, image: '', description: '', isVeg: true, isSpicy: false, isGF: false });
  };

  const handleEdit = (item) => {
    sound.playTap();
    setNewItem(item);
    setEditId(item.id);
    if (item.image && item.image.startsWith('data:')) {
      setImageSourceType('file');
    } else {
      setImageSourceType('url');
    }
  };

  const handleMenuImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setNewItem(prev => ({ ...prev, image: compressed }));
        showToast('Local image loaded & optimized successfully!', 'success');
      } catch (err) {
        showToast('Error reading image file.', 'error');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setPaymentForm(prev => ({ ...prev, qrImageUrl: compressed }));
        showToast('Payment QR code image uploaded!', 'success');
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPaymentForm(prev => ({ ...prev, qrImageUrl: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddTable = (e) => {
    e.preventDefault();
    if (!newTableNo) return;
    sound.playTap();
    const cap = parseInt(newTableCapacity, 10) || 4;
    addTable(parseInt(newTableNo, 10), cap);
    showToast(`Table ${newTableNo} (${cap} seats) created successfully`, 'success');
    setNewTableNo('');
    setNewTableCapacity(4);
  };

  const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, '') + '/#';

  const filteredMenu = menu.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // IF NOT AUTHENTICATED: RENDER PIN SECURITY LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <div className="glass" style={{ padding: '3.5rem 2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '1.25rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <ShieldCheck size={54} color="var(--primary)" />
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Admin Protection</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Restricted access portal for restaurant managers & authorized staff.
          </p>

          <form onSubmit={handlePinSubmit}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label>Enter Passcode PIN</label>
              <input 
                type="password"
                maxLength="6"
                className="input-field"
                style={{ 
                  textAlign: 'center', 
                  fontSize: '1.5rem', 
                  letterSpacing: '0.4em',
                  borderColor: pinError ? 'var(--danger)' : undefined 
                }}
                placeholder="••••"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                autoFocus
                required
              />
            </div>

            {pinError && (
              <p style={{ color: 'var(--danger)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                Incorrect PIN. Default demo passcode is 1234
              </p>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
              <KeyRound size={18} /> Unlock Admin Hub
            </button>
          </form>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Default Demo Passcode: <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: 'var(--accent)' }}>1234</code>
          </span>
        </div>
      </div>
    );
  }

  // AUTHENTICATED ADMIN DASHBOARD VIEW
  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '5rem' }}>
      
      {/* Header */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>AUTHENTICATED ADMIN SESSION</span>
          <h2 style={{ fontSize: '2.2rem', margin: 0 }}>Restaurant <span className="text-gradient">Control Center</span></h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handleLockOut} className="btn btn-secondary" title="Lock Admin Session">
            <LogOut size={16} /> Lock Portal
          </button>
          <Link to="/" onClick={() => sound.playTap()} className="btn btn-secondary">
            <Home size={18} /> Exit to Gateway
          </Link>
        </div>
      </div>

      {/* KPI Stats Analytics Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.85rem', borderRadius: '14px', color: 'var(--success)' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>TOTAL REVENUE</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800 }} className="text-gradient">{formatPrice(totalRevenue)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '0.85rem', borderRadius: '14px', color: 'var(--accent)' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE ORDERS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent)' }}>{activeOrdersCount} Queue</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.85rem', borderRadius: '14px', color: 'var(--warning)' }}>
            <Users size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>OCCUPANCY & SEATS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--warning)' }}>{occupancyRate}% ({occupiedTablesCount}/{tables.length})</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{totalSeatingCapacity} Total Seats</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '0.85rem', borderRadius: '14px', color: 'var(--primary)' }}>
            <Sparkles size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>MENU DISHES</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{menu.length} Active</div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          { id: 'menu', label: 'Menu Catalog Manager' },
          { id: 'tables', label: 'Table & QR Studio' },
          { id: 'orders', label: 'Financial Order Logs' },
          { id: 'payment', label: 'Merchant & Security Settings' },
        ].map(tab => (
          <button 
            key={tab.id}
            className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setActiveTab(tab.id); sound.playTap(); }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MENU CATALOG MANAGER */}
      {activeTab === 'menu' && (
        <div className="admin-two-col-grid">
          {/* Add / Edit Form */}
          <div className="glass" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)', fontSize: '1.35rem' }}>
              {editId ? 'Edit Menu Item' : 'Add New Dish'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Dish Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  placeholder="e.g. Truffle Mushroom Risotto"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Price ({currency})</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    className="input-field" 
                    value={newItem.price}
                    onChange={e => setNewItem({...newItem, price: e.target.value})}
                    placeholder="12.99"
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Prep Time (m)</label>
                  <input 
                    type="number" 
                    min="1"
                    className="input-field" 
                    value={newItem.prepTime}
                    onChange={e => setNewItem({...newItem, prepTime: e.target.value})}
                    placeholder="10"
                    required
                  />
                </div>
              </div>
              
              <div className="input-group">
                <label>Category</label>
                <select 
                  className="input-field"
                  value={newItem.category}
                  onChange={e => setNewItem({...newItem, category: e.target.value})}
                  style={{ backgroundColor: 'var(--bg-dark)' }}
                >
                  <option value="Starters">Starters</option>
                  <option value="Mains">Mains</option>
                  <option value="Sides">Sides</option>
                  <option value="Drinks">Drinks</option>
                  <option value="Desserts">Desserts</option>
                </select>
              </div>

              <div className="input-group">
                <label>Description</label>
                <textarea 
                  className="input-field" 
                  rows="2"
                  value={newItem.description || ''}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  placeholder="Fresh chef ingredients..."
                />
              </div>

              <div className="input-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ margin: 0 }}>Item Image</label>
                  <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <button 
                      type="button"
                      onClick={() => setImageSourceType('file')}
                      style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: imageSourceType === 'file' ? 'var(--primary)' : 'transparent',
                        color: imageSourceType === 'file' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Upload size={12} /> Local File
                    </button>
                    <button 
                      type="button"
                      onClick={() => setImageSourceType('url')}
                      style={{
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: 'none',
                        background: imageSourceType === 'url' ? 'var(--primary)' : 'transparent',
                        color: imageSourceType === 'url' ? '#fff' : 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Link2 size={12} /> Web URL
                    </button>
                  </div>
                </div>

                {imageSourceType === 'file' ? (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="input-field" 
                      onChange={handleMenuImageUpload}
                      style={{ padding: '0.5rem', cursor: 'pointer' }}
                    />
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                      Select a photo from your computer (PNG, JPG, WebP)
                    </small>
                  </div>
                ) : (
                  <input 
                    type="text" 
                    className="input-field" 
                    value={newItem.image}
                    onChange={e => setNewItem({...newItem, image: e.target.value})}
                    placeholder="https://..."
                  />
                )}

                {/* Image Preview */}
                {newItem.image && (
                  <div style={{ marginTop: '0.75rem', position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', background: '#000', maxHeight: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <img 
                      src={newItem.image} 
                      alt="Preview" 
                      style={{ width: '100%', height: '140px', objectFit: 'cover' }} 
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <button 
                      type="button"
                      onClick={() => setNewItem({...newItem, image: ''})}
                      style={{
                        position: 'absolute',
                        top: '0.4rem',
                        right: '0.4rem',
                        background: 'rgba(0,0,0,0.75)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Dietary Flags */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem({...newItem, isVeg: e.target.checked})} />
                  🌱 Vegetarian
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={newItem.isSpicy} onChange={e => setNewItem({...newItem, isSpicy: e.target.checked})} />
                  🌶️ Spicy
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editId ? <Save size={18} /> : <Plus size={18} />} {editId ? 'Update Item' : 'Add Item'}
                </button>
                {editId && (
                  <button type="button" onClick={() => { setEditId(null); setNewItem({ name: '', price: '', category: 'Mains', prepTime: 10, image: '', description: '', isVeg: true, isSpicy: false, isGF: false }); }} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Menu Cards */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Active Menu Items ({menu.length})</h3>
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  className="input-field"
                  style={{ paddingLeft: '2.4rem', padding: '0.45rem 0.8rem 0.45rem 2.4rem', fontSize: '0.85rem' }}
                  placeholder="Filter menu..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-cards">
              {filteredMenu.map(item => (
                <div key={item.id} className="glass" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: item.inStock ? 1 : 0.6 }}>
                  <div style={{ height: '140px', overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button 
                      onClick={() => { toggleStockStatus(item.id); sound.playTap(); }}
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: item.inStock ? 'var(--success)' : 'var(--danger)',
                        color: 'white',
                        border: 'none',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        cursor: 'pointer'
                      }}
                    >
                      {item.inStock ? 'IN STOCK' : 'OUT OF STOCK'}
                    </button>
                  </div>

                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{item.name}</h4>
                      <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatPrice(item.price)}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                      <span className="badge badge-pending">{item.category}</span>
                      <span className="badge badge-preparing"><Clock size={12} />{item.prepTime || 10}m</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleEdit(item)}
                        className="btn btn-outline" 
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button 
                        onClick={() => { removeMenuItem(item.id); sound.playTap(); showToast(`Removed ${item.name}`, 'warning'); }}
                        className="btn btn-danger" 
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TABLE & QR STUDIO */}
      {activeTab === 'tables' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 2fr', gap: '2rem' }}>
          {/* Add Table */}
          <div className="glass" style={{ padding: '1.75rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1.25rem', color: 'var(--primary)', fontSize: '1.35rem' }}>Create Table</h3>
            <form onSubmit={handleAddTable}>
              <div className="input-group">
                <label>Table Number</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={newTableNo}
                  onChange={e => setNewTableNo(e.target.value)}
                  placeholder="e.g. 5"
                  min="1"
                  required
                />
              </div>

              <div className="input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={15} color="var(--primary)" /> Occupancy Count (Seats / Guests)
                </label>
                <input 
                  type="number" 
                  min="1"
                  max="50"
                  className="input-field" 
                  value={newTableCapacity}
                  onChange={e => setNewTableCapacity(e.target.value)}
                  placeholder="e.g. 4"
                  required
                />
                
                {/* Quick capacity preset chips */}
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {[2, 4, 6, 8, 10, 12].map(cap => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => { setNewTableCapacity(cap); sound.playTap(); }}
                      style={{
                        flex: 1,
                        padding: '0.3rem 0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: Number(newTableCapacity) === cap ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                        background: Number(newTableCapacity) === cap ? 'var(--primary-glow)' : 'rgba(255,255,255,0.05)',
                        color: Number(newTableCapacity) === cap ? 'var(--primary)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '36px'
                      }}
                    >
                      {cap}p
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem' }}>
                <Plus size={18} /> Add Table QR
              </button>
            </form>
          </div>

          {/* Tables Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Active Dining Tables ({tables.length})</h3>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Seating: <span className="text-gradient" style={{ fontWeight: 800 }}>{totalSeatingCapacity} Guests</span>
              </span>
            </div>

            <div className="grid-cards">
              {tables.sort((a,b) => a.number - b.number).map(table => {
                const qrUrl = `${baseUrl}/user/${table.number}?token=${table.token}`;
                const activeTableOrders = orders.filter(o => o.tableNo === table.number.toString() && !o.paid);
                const isOccupied = activeTableOrders.length > 0;
                const activeTotal = activeTableOrders.reduce((sum, o) => sum + o.total, 0);
                const capacity = table.capacity || 4;

                return (
                  <div key={table.id} className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.3rem', margin: 0 }}>Table {table.number}</h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                          <Users size={13} color="var(--primary)" /> {capacity} Persons Capacity
                        </span>
                      </div>
                      <span className={`badge ${isOccupied ? 'badge-pending' : 'badge-ready'}`}>
                        {isOccupied ? `Occupied (${formatPrice(activeTotal)})` : 'Free'}
                      </span>
                    </div>

                    {/* Quick Seats Capacity Adjuster */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.25)', padding: '0.35rem 0.65rem', borderRadius: '10px', width: '100%', marginBottom: '0.85rem', border: '1px solid var(--glass-border)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Users size={12} /> Seats:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <button
                          type="button"
                          onClick={() => {
                            const newCap = Math.max(1, capacity - 1);
                            updateTable(table.id, { capacity: newCap });
                            sound.playTap();
                          }}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                          title="Decrease seats"
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, minWidth: '22px', textAlign: 'center', color: 'var(--primary)' }}>
                          {capacity}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCap = capacity + 1;
                            updateTable(table.id, { capacity: newCap });
                            sound.playTap();
                          }}
                          style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}
                          title="Increase seats"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '0.85rem', borderRadius: '16px', marginBottom: '0.85rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                      <QRCodeCanvas value={qrUrl} size={140} />
                    </div>

                    <a href={qrUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none', marginBottom: '1.25rem', fontSize: '0.8rem', fontWeight: 600, wordBreak: 'break-all', textAlign: 'center' }}>
                      Open Table Menu →
                    </a>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      {isOccupied && (
                        <button 
                          onClick={() => {
                            clearTable(table.number.toString());
                            regenerateTableToken(table.number);
                            sound.playTap();
                            showToast(`Table ${table.number} cleared and token regenerated.`, 'success');
                          }} 
                          className="btn btn-outline" 
                          style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                        >
                          <RefreshCw size={14} /> Clear & Reset
                        </button>
                      )}
                      <button 
                        onClick={() => { removeTable(table.id); sound.playTap(); }}
                        className="btn btn-danger" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        title="Delete Table"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL ORDERS LOG */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Financial Transaction Logs</h3>
            <span style={{ fontSize: '1.25rem', fontWeight: 800 }} className="text-gradient">Total Delivered Revenue: {formatPrice(totalRevenue)}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No orders recorded yet.
              </div>
            ) : (
              orders.map(order => (
                <div key={order.id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                      <h4 style={{ fontSize: '1.2rem', margin: 0 }}>Table {order.tableNo}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID #{order.id}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(order.timestamp).toLocaleString()}</span>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800 }} className="text-gradient">{formatPrice(order.total)}</span>
                    <span className={`badge badge-${order.status}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MERCHANT & SECURITY SETTINGS */}
      {activeTab === 'payment' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {/* Merchant UPI Details */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Merchant Payment Setup</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              sound.playTap();
              updatePaymentDetails(paymentForm);
              showToast('Payment merchant details updated!', 'success');
            }}>
              <div className="input-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={paymentForm.name}
                  onChange={e => setPaymentForm({...paymentForm, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Payment URL / UPI Link</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={paymentForm.paymentUrl}
                  onChange={e => setPaymentForm({...paymentForm, paymentUrl: e.target.value})}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Payment QR Image Upload</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="input-field" 
                  onChange={handleImageUpload}
                  style={{ padding: '0.5rem' }}
                />
                {paymentForm.qrImageUrl && (
                  <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                    <img src={paymentForm.qrImageUrl} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'contain', background: 'white', padding: '0.5rem', borderRadius: '12px' }} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                <Save size={18} /> Save Payment Settings
              </button>
            </form>
          </div>

          {/* System Currency Settings */}
          <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>System Currency</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Select the primary currency symbol for menu prices, guest checkout bills, and reporting logs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
                { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
                { symbol: '€', code: 'EUR', label: 'Euro (€)' },
                { symbol: '£', code: 'GBP', label: 'British Pound (£)' },
              ].map(item => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setCurrency(item.symbol);
                    sound.playTap();
                    showToast(`Currency changed to ${item.label}`, 'success');
                  }}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: currency === item.symbol ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: currency === item.symbol ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span>{item.label}</span>
                  <span style={{ fontSize: '1.1rem', background: 'var(--primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.symbol}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Security PIN Settings (Admin & Kitchen) */}
          <div className="glass" style={{ padding: '2rem', height: 'fit-content' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>Security Passcodes</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Manage access protection passcodes for both Admin Portal and Kitchen Display System.
            </p>

            {/* Admin PIN Form */}
            <form onSubmit={handleChangePin} style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} /> Admin Security Passcode
              </h4>
              <div className="input-group">
                <label>Current Admin PIN</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={adminPin}
                  disabled
                  style={{ opacity: 0.7, fontFamily: 'monospace' }}
                />
              </div>

              <div className="input-group">
                <label>New Admin PIN (min 4 digits)</label>
                <input 
                  type="password" 
                  maxLength="6"
                  className="input-field" 
                  placeholder="e.g. 1234"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-outline" style={{ width: '100%', marginTop: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                <KeyRound size={16} /> Update Admin Passcode
              </button>
            </form>

            {/* Kitchen PIN Form */}
            <form onSubmit={handleChangeKitchenPin}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--accent)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ChefHat size={18} /> Kitchen Display Passcode
              </h4>
              <div className="input-group">
                <label>Current Kitchen PIN</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={kitchenPin}
                  disabled
                  style={{ opacity: 0.7, fontFamily: 'monospace' }}
                />
              </div>

              <div className="input-group">
                <label>New Kitchen PIN (min 4 digits)</label>
                <input 
                  type="password" 
                  maxLength="6"
                  className="input-field" 
                  placeholder="e.g. 5678"
                  value={newKitchenPin}
                  onChange={e => setNewKitchenPin(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-outline" style={{ width: '100%', marginTop: '0.75rem', borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                <KeyRound size={16} /> Update Kitchen Passcode
              </button>
            </form>
          </div>


        </div>
      )}

    </div>
  );
}
