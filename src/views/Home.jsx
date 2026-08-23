import { Link } from 'react-router-dom';
import { ChefHat, Utensils, LayoutDashboard, QrCode, ArrowRight, ShieldCheck, Flame, Sparkles, Clock, Smartphone } from 'lucide-react';
import { useTables, useOrders } from '../hooks/useStore';
import { sound } from '../utils/sound';

export default function Home() {
  const { tables } = useTables();
  const { orders } = useOrders();

  const activeOrdersCount = orders.filter(o => o.status !== 'delivered' && !o.paid).length;
  const totalDeliveredCount = orders.filter(o => o.status === 'delivered').length;

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5rem', paddingBottom: '4rem' }}>
      
      {/* Hero Section */}
      <div style={{ textAlign: 'center', maxWidth: '820px', marginTop: '1.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.4rem 1.1rem', 
          borderRadius: '9999px', 
          background: 'var(--primary-glow)', 
          border: '1px solid var(--glass-border-hover)', 
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: 'var(--primary)'
        }}>
          <Sparkles size={16} /> NEXT-GEN RESTAURANT OS
        </div>

        <h1 style={{ fontSize: '3.8rem', lineHeight: 1.1, marginBottom: '1.25rem' }}>
          Elevate Your Dining Experience with <span className="text-gradient">Aura Systems</span>
        </h1>
        
        <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
          Seamless contact-free QR dining, real-time Kitchen Display System (KDS), split billing, and instant admin control — engineered for high efficiency.
        </p>
      </div>

      {/* Main Portals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', width: '100%' }}>
        
        {/* Customer Portal Card */}
        <div className="glass glass-interactive" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '0.85rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(236, 72, 153, 0.3)' }}>
              <Utensils size={32} />
            </div>
            <span className="badge badge-preparing">Contactless QR</span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Customer Ordering</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Scan table QR, browse rich visual menus, filter dietary options, track order progress, and split the bill.
            </p>
          </div>

          {/* Quick Demo Table Switcher */}
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Smartphone size={14} color="var(--accent)" /> DEMO TABLE SIMULATION:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {tables.slice(0, 4).map(t => (
                <Link
                  key={t.id}
                  to={`/user/${t.number}?token=${t.token}`}
                  onClick={() => sound.playTap()}
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem', fontSize: '0.8rem', textAlign: 'center' }}
                >
                  T-{t.number}
                </Link>
              ))}
            </div>
          </div>

          <Link 
            to={tables.length > 0 ? `/user/${tables[0].number}?token=${tables[0].token}` : '/user'} 
            onClick={() => sound.playTap()}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'auto', textDecoration: 'none' }}
          >
            Launch Customer Experience <ArrowRight size={18} />
          </Link>
        </div>

        {/* Kitchen KDS Card */}
        <div className="glass glass-interactive" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, #06b6d4, #10b981)', padding: '0.85rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(6, 182, 212, 0.3)' }}>
              <ChefHat size={32} />
            </div>
            {activeOrdersCount > 0 ? (
              <span className="badge badge-pending">{activeOrdersCount} Pending Orders</span>
            ) : (
              <span className="badge badge-ready">Kitchen Idle</span>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Kitchen Display System</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Real-time kitchen order queue with countdown preparation timers, item checklists, urgency alerts & audio chimes.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>DELIVERIES COMPLETED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)' }}>{totalDeliveredCount} Orders Served</div>
            </div>
            <Flame color="var(--warning)" size={28} />
          </div>

          <Link 
            to="/kitchen" 
            onClick={() => sound.playTap()}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'auto', textDecoration: 'none', background: 'linear-gradient(135deg, #06b6d4, #10b981)' }}
          >
            Open KDS Monitor <ArrowRight size={18} />
          </Link>
        </div>

        {/* Admin Dashboard Card */}
        <div className="glass glass-interactive" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)', padding: '0.85rem', borderRadius: '16px', color: 'white', boxShadow: '0 8px 20px rgba(139, 92, 246, 0.3)' }}>
              <LayoutDashboard size={32} />
            </div>
            <span className="badge badge-ready">Manager Hub</span>
          </div>

          <div>
            <h3 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Control Center</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              Comprehensive revenue analytics, menu manager with stock toggles, interactive table QR generator, and merchant settings.
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '14px', border: '1px solid var(--glass-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <ShieldCheck size={28} color="var(--primary)" />
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Instant local synchronization & token-secured table QR validation.
            </div>
          </div>

          <Link 
            to="/admin" 
            onClick={() => sound.playTap()}
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 'auto', textDecoration: 'none', background: 'linear-gradient(135deg, #8b5cf6, #f59e0b)' }}
          >
            Launch Admin Dashboard <ArrowRight size={18} />
          </Link>
        </div>

      </div>

      {/* Feature Highlights Footer Bar */}
      <div className="glass-panel" style={{ width: '100%', padding: '1.5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>Zero App Install</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Scan QR with native phone camera</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>Live Stepper Status</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time updates from kitchen</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>Split Bill & Tip</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Group dining payment tools</div>
        </div>
        <div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--warning)' }}>Audio & Visual KDS</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chef friendly high contrast UI</div>
        </div>
      </div>

    </div>
  );
}
