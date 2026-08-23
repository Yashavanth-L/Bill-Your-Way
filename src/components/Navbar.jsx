import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChefHat, Utensils, LayoutDashboard, Sparkles, Volume2, VolumeX, Palette, Clock, Lock } from 'lucide-react';
import { sound } from '../utils/sound';
import { useOrders, useCurrency } from '../hooks/useStore';

export default function Navbar() {
  const location = useLocation();
  const { orders } = useOrders();
  const { currency, setCurrency } = useCurrency();
  const [muted, setMuted] = useState(sound.isMuted());
  const [theme, setTheme] = useState(() => localStorage.getItem('aura_theme') || 'cosmic');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [timeStr, setTimeStr] = useState('');

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && !o.paid).length;
  const isCustomerPage = location.pathname.startsWith('/user');
  const isKitchenPage = location.pathname === '/kitchen';
  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) sound.playTap();
  };

  const themes = [
    { id: 'cosmic', name: 'Cosmic Dark', color: '#8b5cf6' },
    { id: 'emerald', name: 'Emerald Luxe', color: '#10b981' },
    { id: 'gold', name: 'Midnight Gold', color: '#f59e0b' },
    { id: 'light', name: 'Clean Light', color: '#7c3aed' },
  ];

  return (
    <div className="container main-navbar">
      <div className="glass" style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }} onClick={() => sound.playTap()}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px var(--primary-glow)' }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', margin: 0, lineHeight: 1.1 }} className="text-gradient">Aura Dining</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              {isCustomerPage ? 'GUEST PORTAL' : isKitchenPage ? 'KITCHEN SYSTEM' : isAdminPage ? 'ADMIN CENTER' : 'SMART SUITE'}
            </span>
          </div>
        </Link>

        {/* Portal Navigation Links - Dynamically Scope Based on User Role */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Landing / Gateway Link */}
          {!isCustomerPage && (
            <Link 
              to="/" 
              onClick={() => sound.playTap()}
              className={`btn ${location.pathname === '/' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <span>Home</span>
            </Link>
          )}

          {/* Show Admin link ONLY when on Admin portal or landing page */}
          {!isCustomerPage && !isKitchenPage && (
            <Link 
              to="/admin" 
              onClick={() => sound.playTap()}
              className={`btn ${location.pathname.startsWith('/admin') ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              <Lock size={15} />
              <span>Admin</span>
            </Link>
          )}

          {/* Customer Link */}
          {isCustomerPage && (
            <div className="badge badge-preparing" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              <Utensils size={14} /> Guest Dining View
            </div>
          )}

          {/* Kitchen Display Link (Visible on Kitchen & Staff views) */}
          {(isKitchenPage || isAdminPage || location.pathname === '/') && (
            <Link 
              to="/kitchen" 
              onClick={() => sound.playTap()}
              className={`btn ${location.pathname === '/kitchen' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', position: 'relative' }}
            >
              <ChefHat size={16} />
              <span>Kitchen</span>
              {activeOrdersCount > 0 && (
                <span style={{ 
                  position: 'absolute', 
                  top: '-4px', 
                  right: '-4px', 
                  background: 'var(--danger)', 
                  color: 'white', 
                  borderRadius: '9999px', 
                  width: '18px', 
                  height: '18px', 
                  fontSize: '0.7rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  {activeOrdersCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Control Tools (Clock, Sound, Theme) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* System Clock */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.8rem', borderRadius: '9999px' }}>
            <Clock size={14} color="var(--accent)" />
            <span>{timeStr}</span>
          </div>

          {/* Currency Switcher Toggle - Admin Only */}
          {isAdminPage && (
            <div style={{ display: 'flex', gap: '2px', background: 'rgba(0,0,0,0.25)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button
                onClick={() => { setCurrency('₹'); sound.playTap(); }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  border: 'none',
                  background: currency === '₹' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                  color: currency === '₹' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Switch to Indian Rupee (₹)"
              >
                ₹ INR
              </button>
              <button
                onClick={() => { setCurrency('$'); sound.playTap(); }}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  borderRadius: '7px',
                  border: 'none',
                  background: currency === '$' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                  color: currency === '$' ? '#fff' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                title="Switch to US Dollar ($)"
              >
                $ USD
              </button>
            </div>
          )}

          {/* Sound Toggle Button */}
          <button 
            onClick={toggleSound}
            className="btn btn-secondary btn-icon"
            title={muted ? "Unmute Audio Effects" : "Mute Audio Effects"}
            style={{ color: muted ? 'var(--text-muted)' : 'var(--accent)' }}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Theme Switcher Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => { setShowThemePicker(!showThemePicker); sound.playTap(); }}
              className="btn btn-secondary btn-icon"
              title="Change Theme"
            >
              <Palette size={18} color="var(--primary)" />
            </button>

            {showThemePicker && (
              <div className="glass" style={{ 
                position: 'absolute', 
                right: 0, 
                top: 'calc(100% + 0.5rem)', 
                width: '180px', 
                padding: '0.5rem', 
                zIndex: 200, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '0.35rem' 
              }}>
                {themes.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemePicker(false);
                      sound.playTap();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: theme === t.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                      color: 'var(--text-main)',
                      fontWeight: theme === t.id ? 700 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color }} />
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
