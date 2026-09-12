import { useOrders, useTables } from '../hooks/useStore';
import { Clock, CheckCircle, ChefHat, Play, Home, CheckSquare, Square, AlertCircle, Filter, Sparkles, Bell, Lock, KeyRound, LogOut, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { showToast } from '../utils/toast';

export default function Kitchen() {
  const { orders, updateOrderStatus } = useOrders();
  const { tables } = useTables();
  const [now, setNow] = useState(Date.now());
  const [statusFilter, setStatusFilter] = useState('active'); // 'active', 'pending', 'preparing', 'ready', 'delivered'
  const [checkedItems, setCheckedItems] = useState({}); // { `${orderId}-${itemIdx}`: boolean }

  // Security Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem('aura_kitchen_authenticated') === 'true');
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const kitchenPin = localStorage.getItem('aura_kitchen_pin') || '1234';
    if (pinInput === kitchenPin) {
      sound.playTap();
      setIsAuthenticated(true);
      sessionStorage.setItem('aura_kitchen_authenticated', 'true');
      setPinError(false);
      showToast('Kitchen Portal Unlocked', 'success');
    } else {
      setPinError(true);
      sound.playTap();
      showToast('Incorrect Kitchen PIN Code', 'error');
    }
  };

  const handleLockOut = () => {
    sound.playTap();
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_kitchen_authenticated');
    showToast('Kitchen Portal Locked', 'warning');
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleItemChecked = (orderId, idx) => {
    sound.playTap();
    const key = `${orderId}-${idx}`;
    setCheckedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getBorderColor = (status) => {
    switch(status) {
      case 'pending': return 'var(--warning)';
      case 'preparing': return 'var(--accent)';
      case 'ready': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="badge badge-pending">Pending</span>;
      case 'preparing': return <span className="badge badge-preparing">Preparing</span>;
      case 'ready': return <span className="badge badge-ready">Ready</span>;
      case 'delivered': return <span className="badge badge-delivered">Delivered</span>;
      default: return null;
    }
  };

  // Filters
  const activeOrders = orders.filter(o => o.status !== 'delivered');
  const pastOrders = orders.filter(o => o.status === 'delivered');

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'active') return o.status !== 'delivered';
    if (statusFilter === 'delivered') return o.status === 'delivered';
    return o.status === statusFilter;
  });

  // IF NOT AUTHENTICATED: RENDER PIN SECURITY LOCK SCREEN
  if (!isAuthenticated) {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <div className="glass" style={{ padding: '3.5rem 2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '1.25rem', borderRadius: '50%', width: 'fit-content', margin: '0 auto 1.5rem' }}>
            <ChefHat size={54} color="var(--accent)" />
          </div>

          <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Kitchen Protection</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            Restricted access portal for kitchen staff & head chefs.
          </p>

          <form onSubmit={handlePinSubmit}>
            <div className="input-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.85rem' }}>Kitchen Security PIN</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="password" 
                  maxLength="6"
                  className="input-field" 
                  style={{ paddingLeft: '2.8rem', fontSize: '1.2rem', letterSpacing: '0.2em', textAlign: 'center' }}
                  placeholder="••••"
                  value={pinInput}
                  onChange={e => { setPinInput(e.target.value); setPinError(false); }}
                  autoFocus
                  required
                />
              </div>
              {pinError && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.4rem', display: 'block' }}>Incorrect passcode PIN code. Please try again.</span>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(135deg, var(--accent), var(--primary))' }}>
              <Lock size={18} /> Unlock Kitchen Display
            </button>
          </form>

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Home size={14} /> Back to Guest Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div className="glass" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ChefHat size={16} /> LIVE KITCHEN DISPLAY SYSTEM (KDS)
          </span>
          <h2 style={{ fontSize: '2.2rem', margin: 0 }}>Executive <span className="text-accent-gradient">Chef Hub</span></h2>
        </div>

        {/* Filter Pills & Lock Out */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'active', label: `Active (${activeOrders.length})` },
              { id: 'pending', label: 'Pending' },
              { id: 'preparing', label: 'Preparing' },
              { id: 'ready', label: 'Ready' },
              { id: 'delivered', label: 'Completed' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => { setStatusFilter(f.id); sound.playTap(); }}
                className={`category-pill ${statusFilter === f.id ? 'active' : ''}`}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button 
            onClick={handleLockOut}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
            title="Lock Kitchen Portal"
          >
            <LogOut size={15} /> Lock
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.75rem' }}>
        {filteredOrders.map(order => {
          let timeRemainingStr = null;
          let isOverdue = false;

          if (order.status === 'preparing' && order.prepStartTime) {
            const elapsedMs = now - order.prepStartTime;
            const totalPrepMs = (order.totalPrepTime || 10) * 60 * 1000;
            const remainingMs = totalPrepMs - elapsedMs;
            
            if (remainingMs <= 0) {
              isOverdue = true;
              timeRemainingStr = "OVERDUE";
            } else {
              const mins = Math.floor(remainingMs / 60000);
              const secs = Math.floor((remainingMs % 60000) / 1000);
              timeRemainingStr = `${mins}:${secs.toString().padStart(2, '0')}`;
            }
          }

          const tableInfo = tables.find(t => t.number.toString() === order.tableNo);

          return (
            <div 
              key={order.id} 
              className="glass" 
              style={{ 
                padding: '1.5rem', 
                borderTop: `5px solid ${getBorderColor(order.status)}`,
                display: 'flex',
                flexDirection: 'column',
                boxShadow: isOverdue ? '0 0 25px rgba(239, 68, 68, 0.4)' : undefined
              }}
            >
              {/* Card Top Info */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Table {order.tableNo}</h3>
                    {tableInfo && (
                      <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.15rem 0.45rem', borderRadius: '6px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Users size={11} /> {tableInfo.capacity || 4}p
                      </span>
                    )}
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>#{order.id.slice(-4)}</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              {/* Prep Countdown Banner */}
              {order.status === 'preparing' && (
                <div style={{ 
                  background: isOverdue ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.15)', 
                  border: `1px solid ${isOverdue ? 'var(--danger)' : 'var(--accent)'}`,
                  padding: '0.5rem 0.85rem', 
                  borderRadius: '10px', 
                  marginBottom: '1rem',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  color: isOverdue ? 'var(--danger)' : 'var(--accent)'
                }}>
                  <span>Target Prep Timer:</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isOverdue ? <AlertCircle size={16} /> : <Clock size={16} />}
                    {timeRemainingStr}
                  </span>
                </div>
              )}

              {/* Customer Special Note */}
              {order.note && (
                <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px dashed var(--warning)', color: 'var(--warning)', padding: '0.5rem 0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                  Note: "{order.note}"
                </div>
              )}

              {/* Item Checklist */}
              <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '12px', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '0.05em' }}>ORDER ITEMS CHECKLIST:</div>
                {order.items.map((item, idx) => {
                  const itemKey = `${order.id}-${idx}`;
                  const isDone = !!checkedItems[itemKey];

                  return (
                    <div 
                      key={idx} 
                      onClick={() => toggleItemChecked(order.id, idx)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.6rem', 
                        padding: '0.4rem 0',
                        borderBottom: idx !== order.items.length - 1 ? '1px dashed var(--glass-border)' : 'none',
                        cursor: 'pointer',
                        textDecoration: isDone ? 'line-through' : 'none',
                        opacity: isDone ? 0.45 : 1
                      }}
                    >
                      {isDone ? <CheckSquare size={18} color="var(--success)" /> : <Square size={18} color="var(--text-muted)" />}
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.quantity}x {item.name}</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="btn btn-outline" 
                    style={{ flex: 1, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  >
                    <Play size={18} /> Start Preparation
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="btn btn-success" 
                    style={{ flex: 1 }}
                  >
                    <CheckCircle size={18} /> Mark Order Ready
                  </button>
                )}

                {order.status === 'ready' && (
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                    className="btn btn-primary" 
                    style={{ flex: 1 }}
                  >
                    <ChefHat size={18} /> Mark Served & Delivered
                  </button>
                )}

                {order.status === 'delivered' && (
                  <div style={{ textAlign: 'center', width: '100%', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    ✓ Delivered to Table
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {filteredOrders.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 2rem' }}>
            <ChefHat size={64} color="var(--text-muted)" style={{ opacity: 0.3, marginBottom: '1.25rem' }} />
            <h3 style={{ color: 'var(--text-muted)' }}>Kitchen Queue Empty</h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', marginTop: '0.5rem' }}>No orders currently match the selected status filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
