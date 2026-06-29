import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrandMark, Avatar, Badge } from '../ui/components';

const ALL_ITEMS = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard',       roles: ['chairman','admin','department'] },
  { path: '/departments',icon: '🏥', label: 'Departments',     roles: ['chairman','admin','department'] },
  { path: '/patients',   icon: '👥', label: 'Patients',        roles: ['chairman','admin','department'] },
  { path: '/opd',        icon: '🩺', label: 'OPD',             roles: ['chairman','admin','department'], perm: 'canViewOPD' },
  { path: '/ipd',        icon: '🛏️', label: 'IPD',             roles: ['chairman','admin','department'], perm: 'canViewIPD' },
  { path: '/staff',      icon: '👨‍⚕️', label: 'Staff',          roles: ['chairman','admin','department'], perm: 'canViewStaff' },
  { path: '/purchase',   icon: '🛒', label: 'Purchase Orders', roles: ['chairman','admin','department'], perm: 'canViewPurchase' },
  { path: '/licenses',   icon: '📋', label: 'Licenses',        roles: ['chairman','admin'] },
  { path: '/updates',    icon: '📢', label: 'Updates',         roles: ['chairman','admin','department'] },
  { path: '/users',      icon: '⚙️', label: 'User Management', roles: ['chairman','admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const canView = (item) => {
    if (!item.roles.includes(user?.role)) return false;
    if (item.perm && user?.role === 'department') return !!user?.permissions?.[item.perm];
    return true;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleMeta = {
    chairman:  { label: 'Chairman',         tone: 'gold' },
    admin:     { label: 'Administrator',    tone: 'navy' },
    department:{ label: 'Department',       tone: 'green' },
  }[user?.role] || { label: 'User', tone: 'neutral' };

  return (
    <aside style={{
      width: 'var(--sidebar-w)', height: '100vh',
      position: 'fixed', left: 0, top: 0,
      background: 'linear-gradient(180deg, #07172a 0%, #0a1f38 55%, #0d2137 100%)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.04)',
      boxShadow: '4px 0 24px rgba(7,23,42,0.18)',
    }}>
      {/* Logo block */}
      <div style={{
        padding: '24px 22px 22px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <BrandMark size={42} />
        <div style={{ minWidth: 0 }}>
          <div className="srp-display" style={{ color: '#fff', fontSize: 14, lineHeight: 1.2, marginBottom: 2 }}>
            S.R. Patil Hospital
          </div>
          <div style={{ color: '#94abc7', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Research Centre
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: '20px 22px 8px' }}>
        <div className="srp-eyebrow" style={{ color: 'rgba(148,171,199,0.7)' }}>
          Workspace
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 12px 16px' }}>
        {ALL_ITEMS.filter(canView).map(item => (
          <NavLink key={item.path} to={item.path}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px',
              margin: '2px 0',
              borderRadius: 'var(--r-md)',
              fontSize: 13, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#fff' : '#94abc7',
              background: isActive
                ? 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.02))'
                : 'transparent',
              borderLeft: isActive ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'all var(--t-base) var(--ease-out)',
              position: 'relative',
            })}
            onMouseEnter={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = '#e8eef7';
              }
            }}
            onMouseLeave={e => {
              if (!e.currentTarget.classList.contains('active')) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94abc7';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <span style={{
                  fontSize: 16, width: 22, textAlign: 'center',
                  filter: isActive ? 'saturate(1.2)' : 'saturate(0.8)',
                }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#f59e0b', boxShadow: '0 0 0 3px rgba(245,158,11,0.2)',
                }} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{
        padding: '14px 14px 18px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 11,
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 'var(--r-md)',
          marginBottom: 10,
        }}>
          <Avatar name={user?.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              color: '#fff', fontSize: 12, fontWeight: 700,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              marginBottom: 3,
            }}>{user?.name}</div>
            <Badge tone={roleMeta.tone} size="sm" dot>{roleMeta.label}</Badge>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '9px',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          color: '#fca5a5',
          borderRadius: 'var(--r-md)',
          fontSize: 12, fontWeight: 700,
          letterSpacing: '0.04em',
          transition: 'all var(--t-base) var(--ease-out)',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}