import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleShowToast = (e) => {
      const { message, type } = e.detail;
      const id = Date.now().toString() + Math.random().toString();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('show_toast', handleShowToast);
    return () => window.removeEventListener('show_toast', handleShowToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => {
        let Icon = Info;
        let color = 'var(--accent)';
        if (toast.type === 'success') { Icon = CheckCircle; color = 'var(--success)'; }
        if (toast.type === 'error') { Icon = XCircle; color = 'var(--danger)'; }
        if (toast.type === 'warning') { Icon = AlertCircle; color = 'var(--warning)'; }

        return (
          <div key={toast.id} className="glass toast-item" style={{
            padding: '0.85rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            borderLeft: `4px solid ${color}`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            background: 'var(--bg-dark)'
          }}>
            <Icon color={color} size={22} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: '600', fontSize: '0.925rem', color: 'var(--text-main)', lineHeight: 1.4 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
