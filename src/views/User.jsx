import { useState, useEffect } from 'react';
import { useMenu, useOrders, usePaymentDetails, useTables, useCurrency } from '../hooks/useStore';
import { ShoppingCart, Plus, Minus, Send, QrCode, CreditCard, Clock, Copy, Check, AlertTriangle, Search, Filter, Info, Users, Heart, Sparkles, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { showToast } from '../utils/toast';
import { sound } from '../utils/sound';

export default function User() {
  const { menu } = useMenu();
  const { placeOrder, orders } = useOrders();
  const { paymentDetails } = usePaymentDetails();
  const { tables } = useTables();
  const { formatPrice } = useCurrency();
  const { tableNo } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const tableOrders = orders.filter(o => o.tableNo === tableNo && !o.paid);
  const allDelivered = tableOrders.length > 0 && tableOrders.every(o => o.status === 'delivered');
  
  const [cart, setCart] = useState([]);
  const [cartNotes, setCartNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVeg, setFilterVeg] = useState(false);
  const [filterSpicy, setFilterSpicy] = useState(false);
  const [selectedItemModal, setSelectedItemModal] = useState(null);
  
  const [isTableClosed, setIsTableClosed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());
  
  // Split bill calculator states
  const [splitCount, setSplitCount] = useState(1);
  const [tipPercent, setTipPercent] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!tableNo) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '3.5rem 2.5rem', maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-glow)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <QrCode size={64} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>Please Scan Table QR Code</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Scan the QR code on your dining table to open the live interactive menu and place orders.
          </p>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            OR SELECT A DEMO TABLE TO TEST:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', width: '100%' }}>
            {tables.map(t => (
              <Link 
                key={t.id} 
                to={`/user/${t.number}?token=${t.token}`} 
                onClick={() => sound.playTap()}
                className="btn btn-secondary"
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem', padding: '0.75rem' }}
              >
                <span style={{ fontWeight: 800 }}>Table {t.number}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={12} /> {t.capacity || 4} Guests
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const table = tables.find(t => t.number.toString() === tableNo);
  const isValidToken = table && table.token === token;

  if (tableNo && !isValidToken) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', textAlign: 'center' }}>
        <div className="glass" style={{ padding: '3.5rem 2.5rem', maxWidth: '540px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '1.25rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <AlertTriangle size={64} color="var(--danger)" />
          </div>
          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.75rem', color: 'var(--danger)' }}>Invalid QR Code</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            This table QR code is invalid or has expired. Please scan the updated QR code on your table.
          </p>
          {tables.length > 0 && (
            <Link 
              to={`/user/${tables[0].number}?token=${tables[0].token}`} 
              onClick={() => sound.playTap()}
              className="btn btn-primary"
            >
              Switch to Active Table {tables[0].number}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Filter Categories
  const categories = ['All', ...new Set(menu.map(item => item.category))];

  // Filter Items
  const filteredMenu = menu.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesVeg = !filterVeg || item.isVeg;
    const matchesSpicy = !filterSpicy || item.isSpicy;
    return matchesCat && matchesSearch && matchesVeg && matchesSpicy;
  });

  const addToCart = (item) => {
    if (!item.inStock) {
      showToast(`${item.name} is currently out of stock.`, 'warning');
      return;
    }
    sound.playTap();
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      setCart(cart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    sound.playTap();
    const existing = cart.find(c => c.id === id);
    if (existing.quantity === 1) {
      setCart(cart.filter(c => c.id !== id));
    } else {
      setCart(cart.map(c => c.id === id ? { ...c, quantity: c.quantity - 1 } : c));
    }
  };

  const handleOrder = () => {
    if (cart.length === 0) return;
    placeOrder(tableNo, cart, cartNotes);
    setCart([]);
    setCartNotes('');
    showToast(`Order sent to kitchen for Table ${tableNo}!`, 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentDetails.paymentUrl);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const tableTotalRaw = tableOrders.reduce((sum, o) => sum + o.total, 0);
  const tipAmount = (tableTotalRaw * tipPercent) / 100;
  const grandTotal = tableTotalRaw + tipAmount;
  const perPersonAmount = splitCount > 0 ? grandTotal / splitCount : grandTotal;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '6rem' }}>
      
      {/* Header Banner */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>AURA DINING EXPERIENCE</span>
          <h2 style={{ fontSize: '2.2rem', margin: 0 }}>Gourmet <span className="text-gradient">Menu</span></h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', color: 'white', padding: '0.6rem 1.25rem', borderRadius: '14px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.65rem', boxShadow: '0 4px 15px var(--primary-glow)' }}>
            <Sparkles size={18} />
            <span>Table {tableNo}</span>
            {table && (
              <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.25)', padding: '0.2rem 0.6rem', borderRadius: '9999px', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                <Users size={13} /> {table.capacity || 4} Seats
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Menu vs Cart/Status Drawer */}
      <div className="user-layout-grid">
        
        {/* Left Main Column: Search, Filter Tabs & Food Cards */}
        <div>
          {/* Search & Filter Bar */}
          <div className="glass" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                className="input-field" 
                style={{ paddingLeft: '2.75rem' }}
                placeholder="Search food, drinks, desserts..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Dietary Toggle Chips */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => { setFilterVeg(!filterVeg); sound.playTap(); }}
                className={`dietary-chip ${filterVeg ? 'dietary-veg' : ''}`}
                style={{ cursor: 'pointer', opacity: filterVeg ? 1 : 0.6, padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
              >
                🌱 Veg Only
              </button>
              <button 
                onClick={() => { setFilterSpicy(!filterSpicy); sound.playTap(); }}
                className={`dietary-chip ${filterSpicy ? 'dietary-nonveg' : ''}`}
                style={{ cursor: 'pointer', opacity: filterSpicy ? 1 : 0.6, padding: '0.6rem 0.9rem', fontSize: '0.85rem' }}
              >
                🌶️ Spicy Only
              </button>
            </div>
          </div>

          {/* Sticky Category Tabs */}
          <div className="category-filter-bar" style={{ marginBottom: '2rem' }}>
            {categories.map(cat => {
              const count = cat === 'All' ? menu.length : menu.filter(m => m.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); sound.playTap(); }}
                  className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat} <span style={{ opacity: 0.7, fontSize: '0.75rem', background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Food Cards Grid */}
          <div className="grid-cards">
            {filteredMenu.map(item => {
              const cartItem = cart.find(c => c.id === item.id);
              const qty = cartItem ? cartItem.quantity : 0;

              return (
                <div key={item.id} className="glass glass-interactive" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', opacity: item.inStock ? 1 : 0.6 }}>
                  {/* Image Container */}
                  <div style={{ height: '170px', overflow: 'hidden', position: 'relative' }}>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }}
                    />
                    
                    {/* Badge Overlay */}
                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                      {item.isVeg ? (
                        <span className="dietary-chip dietary-veg">🌱 Veg</span>
                      ) : (
                        <span className="dietary-chip dietary-nonveg">🥩 Non-Veg</span>
                      )}
                      {item.isSpicy && <span className="dietary-chip dietary-nonveg">🌶️ Spicy</span>}
                    </div>

                    <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', color: 'white', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="var(--accent)" /> {item.prepTime || 10}m
                    </div>

                    {!item.inStock && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.05em' }}>
                        SOLD OUT
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <h4 style={{ fontSize: '1.15rem', margin: 0 }}>{item.name}</h4>
                      <button 
                        onClick={() => { setSelectedItemModal(item); sound.playTap(); }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}
                        title="View details"
                      >
                        <Info size={18} />
                      </button>
                    </div>

                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.4, marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'Prepared fresh on order by our executive chef.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <span className="text-gradient" style={{ fontWeight: 800, fontSize: '1.35rem' }}>{formatPrice(item.price)}</span>

                      {/* Add / Qty Control */}
                      {qty === 0 ? (
                        <button 
                          onClick={() => addToCart(item)}
                          disabled={!item.inStock}
                          className="btn btn-outline"
                          style={{ padding: '0.45rem 1rem', fontSize: '0.875rem' }}
                        >
                          <Plus size={16} /> Add
                        </button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--primary)', padding: '0.25rem 0.5rem', borderRadius: '10px' }}>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><Minus size={16} /></button>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'white', minWidth: '16px', textAlign: 'center' }}>{qty}</span>
                          <button onClick={() => addToCart(item)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' }}><Plus size={16} /></button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredMenu.length === 0 && (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '2rem' }}>
              <Filter size={48} color="var(--text-muted)" style={{ opacity: 0.4, marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-muted)' }}>No food items match your filter</h3>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Try searching for a different keyword or resetting filters.</p>
            </div>
          )}
        </div>

        {/* Right Sticky Column: Cart & Table Order Timeline Drawer */}
        <div className="user-cart-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Cart Card */}
          {!isTableClosed && (
            <div className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShoppingCart color="var(--primary)" size={22} />
                  <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Your Cart</h3>
                </div>
                {cartItemCount > 0 && (
                  <span className="badge badge-preparing">{cartItemCount} items</span>
                )}
              </div>

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                  <p style={{ fontSize: '0.95rem' }}>Your cart is empty.</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Select delicious dishes from the menu!</span>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem', maxHeight: '320px', overflowY: 'auto' }}>
                    {cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                        <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                          <h5 style={{ margin: 0, fontSize: '0.95rem' }}>{item.name}</h5>
                          <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700 }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.4rem', borderRadius: '8px' }}>
                          <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}><Minus size={14} /></button>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => addToCart(item)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '0.2rem' }}><Plus size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="input-group" style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.75rem' }}>Chef Notes (Optional)</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}
                      placeholder="e.g. Extra sauce, no onions..." 
                      value={cartNotes}
                      onChange={e => setCartNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.25rem' }}>
                      <span>Subtotal</span>
                      <span className="text-gradient">{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleOrder}
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                  >
                    <Send size={18} /> Place Order Now
                  </button>
                </>
              )}
            </div>
          )}

          {/* Table Live Orders & Status Stepper */}
          {tableOrders.length > 0 && (
            <div className="glass" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
                <Clock color="var(--accent)" size={22} />
                <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Live Order Tracker</h3>
              </div>

              {/* List of active orders for this table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem', maxHeight: '350px', overflowY: 'auto' }}>
                {tableOrders.map(order => {
                  let timeRemaining = null;
                  if (order.status === 'preparing' && order.prepStartTime) {
                    const elapsedMs = now - order.prepStartTime;
                    const totalPrepMs = (order.totalPrepTime || 10) * 60 * 1000;
                    const remainingMs = Math.max(0, totalPrepMs - elapsedMs);
                    const mins = Math.floor(remainingMs / 60000);
                    const secs = Math.floor((remainingMs % 60000) / 1000);
                    timeRemaining = `${mins}:${secs.toString().padStart(2, '0')}`;
                  }

                  const steps = ['pending', 'preparing', 'ready', 'delivered'];
                  const currentStepIdx = steps.indexOf(order.status);

                  return (
                    <div key={order.id} className="glass-panel" style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Order #{order.id.slice(-4)}</span>
                        <span className={`badge badge-${order.status}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                      </div>

                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                      </div>

                      {/* Visual Stepper */}
                      <div className="order-stepper">
                        {steps.map((st, idx) => (
                          <div key={st} className={`step-item ${idx <= currentStepIdx ? 'completed' : ''} ${idx === currentStepIdx ? 'active' : ''}`}>
                            <div className="step-circle">
                              {idx < currentStepIdx ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span className="step-label" style={{ textTransform: 'capitalize' }}>{st}</span>
                          </div>
                        ))}
                      </div>

                      {timeRemaining && (
                        <div style={{ marginTop: '0.75rem', background: 'rgba(6, 182, 212, 0.15)', padding: '0.4rem 0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 700 }}>
                          <span>Chef Preparing Order...</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {timeRemaining}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Close Table & Split Bill Drawer */}
              {!isTableClosed ? (
                <button 
                  onClick={() => {
                    if (!allDelivered) {
                      showToast("All items must be 'Delivered' before requesting bill.", "warning");
                      return;
                    }
                    sound.playTap();
                    setIsTableClosed(true);
                  }}
                  className={`btn ${allDelivered ? 'btn-danger' : 'btn-secondary'}`}
                  style={{ width: '100%', opacity: allDelivered ? 1 : 0.55 }}
                  disabled={!allDelivered}
                >
                  <CreditCard size={18} /> Request Bill & Pay ({formatPrice(tableTotalRaw)})
                </button>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <CreditCard color="var(--success)" size={22} />
                    <h4 style={{ margin: 0, fontSize: '1.2rem' }}>Split & Payment</h4>
                  </div>

                  {/* Split Bill Calculator */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Split across guests:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '8px' }}>
                        <button onClick={() => { setSplitCount(Math.max(1, splitCount - 1)); sound.playTap(); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Minus size={14} /></button>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', width: '20px', textAlign: 'center' }}>{splitCount}</span>
                        <button onClick={() => { setSplitCount(splitCount + 1); sound.playTap(); }} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Plus size={14} /></button>
                      </div>
                    </div>

                    {/* Tip percentage selector */}
                    <div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>Add Service Tip:</span>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                        {[0, 5, 10, 15].map(pct => (
                          <button
                            key={pct}
                            onClick={() => { setTipPercent(pct); sound.playTap(); }}
                            style={{
                              padding: '0.35rem',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              border: '1px solid var(--glass-border)',
                              background: tipPercent === pct ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                              color: 'white',
                              cursor: 'pointer'
                            }}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Breakdown */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.85rem', borderRadius: '12px', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Food Bill Subtotal:</span>
                      <span>{formatPrice(tableTotalRaw)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Tip ({tipPercent}%):</span>
                      <span>{formatPrice(tipAmount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1rem', color: 'white', borderTop: '1px solid var(--glass-border)', paddingTop: '0.4rem' }}>
                      <span>Grand Total:</span>
                      <span className="text-gradient">{formatPrice(grandTotal)}</span>
                    </div>
                    {splitCount > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem', marginTop: '0.2rem' }}>
                        <span>Per Person ({splitCount}x):</span>
                        <span>{formatPrice(perPersonAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* UPI / QR Payment */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.5rem 0.85rem', borderRadius: '10px', width: '100%', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{paymentDetails.paymentUrl}</span>
                      <button onClick={handleCopy} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex' }} title="Copy Payment Link">
                        {copied ? <Check size={18} color="var(--success)" /> : <Copy size={18} />}
                      </button>
                    </div>

                    {paymentDetails.qrImageUrl && (
                      <img src={paymentDetails.qrImageUrl} alt="Payment QR" style={{ width: '140px', height: '140px', objectFit: 'contain', background: 'white', padding: '0.5rem', borderRadius: '12px' }} />
                    )}

                    <div className="btn btn-success" style={{ width: '100%', fontWeight: 800 }}>
                      Pay {formatPrice(perPersonAmount)} {splitCount > 1 ? '/ Person' : ''}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Floating Mobile Cart Bar */}
      {cart.length > 0 && !isTableClosed && (
        <div className="mobile-cart-float-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ background: 'var(--primary)', color: 'white', padding: '0.3rem 0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800 }}>
              {cartItemCount}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cart Total</div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }} className="text-gradient">{formatPrice(cartTotal)}</div>
            </div>
          </div>
          <button 
            onClick={() => {
              document.querySelector('.user-cart-sidebar')?.scrollIntoView({ behavior: 'smooth' });
              sound.playTap();
            }}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.95rem', fontSize: '0.85rem' }}
          >
            View Cart & Order →
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItemModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div className="glass" style={{ maxWidth: '500px', width: '100%', overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => { setSelectedItemModal(null); sound.playTap(); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', zIndex: 10 }}
            >
              <X size={20} />
            </button>

            <div style={{ height: '240px', width: '100%', overflow: 'hidden' }}>
              <img src={selectedItemModal.image} alt={selectedItemModal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'; }} />
            </div>

            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{selectedItemModal.name}</h3>
                <span className="text-gradient" style={{ fontSize: '1.4rem', fontWeight: 800 }}>{formatPrice(selectedItemModal.price)}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                {selectedItemModal.isVeg ? (
                  <span className="dietary-chip dietary-veg">🌱 Vegetarian</span>
                ) : (
                  <span className="dietary-chip dietary-nonveg">🥩 Non-Vegetarian</span>
                )}
                {selectedItemModal.isSpicy && <span className="dietary-chip dietary-nonveg">🌶️ Spicy</span>}
                <span className="badge badge-preparing"><Clock size={12} /> {selectedItemModal.prepTime || 10} min prep</span>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                {selectedItemModal.description}
              </p>

              <button 
                onClick={() => {
                  addToCart(selectedItemModal);
                  setSelectedItemModal(null);
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Plus size={18} /> Add to Cart ({formatPrice(selectedItemModal.price)})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
