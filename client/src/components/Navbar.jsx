import { useAuth } from '../context/AuthContext';
import { Avatar, Badge } from '../ui/components';

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const roleMeta = {
    chairman:  { label: 'Chairman', tone: 'gold' },
    admin:     { label: 'Administrator', tone: 'navy' },
    department:{ label: 'Department', tone: 'green' },
  }[user?.role] || { label: 'User', tone: 'neutral' };

  return (
    <header style={{
      height: 'var(--header-h)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px) saturate(140%)',
      WebkitBackdropFilter: 'blur(12px) saturate(140%)',
      borderBottom: '1px solid var(--border-soft)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky', top: 0,
      zIndex: 50,
    }}>
      <div>
        <h1 className="srp-display" style={{ fontSize: 19, color: 'var(--navy-900)' }}>
          {title || 'Dashboard'}
        </h1>
        {subtitle && <div style={{ fontSize: 12, color: 'var(--text-soft)', marginTop: 2 }}>{subtitle}</div>}
        {!subtitle && <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1, letterSpacing: '0.02em' }}>{dateStr}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px',
          background: 'var(--bg-tinted)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)',
          minWidth: 240,
          transition: 'all var(--t-base) var(--ease-out)',
        }}
          onFocusCapture={e => { e.currentTarget.style.borderColor = 'var(--navy-300)'; e.currentTarget.style.background = '#fff'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = 'var(--bg-tinted)'; }}
        >
          <span style={{ fontSize: 14, color: 'var(--text-faint)' }}>🔍</span>
          <input
            placeholder="Search patients, departments…"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              outline: 'none', fontSize: 13, color: 'var(--text)',
            }}
          />
          <kbd style={{
            fontSize: 10, color: 'var(--text-faint)',
            background: '#fff', padding: '2px 6px',
            border: '1px solid var(--border-soft)', borderRadius: 4,
            fontFamily: 'var(--font-mono)',
          }}>⌘K</kbd>
        </div>

        {/* Date chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 12px',
          background: 'var(--bg-tinted)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)',
          fontSize: 12, color: 'var(--text-muted)', fontWeight: 600,
        }}>
          <span style={{ fontSize: 13 }}>📅</span>
          {now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>

        {/* User block */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)', lineHeight: 1.2 }}>
              {user?.name}
            </div>
            <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Badge tone={roleMeta.tone} size="sm" dot>{roleMeta.label}</Badge>
            </div>
          </div>
          <Avatar name={user?.name} size={40} />
        </div>
      </div>
    </header>
  );
}