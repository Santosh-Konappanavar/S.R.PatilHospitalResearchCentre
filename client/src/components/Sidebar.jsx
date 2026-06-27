import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    if (item.perm && user?.role === 'department') return user?.permissions?.[item.perm];
    return true;
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = { chairman: 'Chairman', admin: 'Administrator', department: 'Department' };
  const roleColor = { chairman: '#f59e0b', admin: '#2563eb', department: '#10b981' };

  return (
    <div style={{
      width: 248, height: '100vh', position: 'fixed', left: 0, top: 0,
      background: 'linear-gradient(180deg, #0d2137 0%, #163352 100%)',
      display: 'flex', flexDirection: 'column', zIndex: 100,
      boxShadow: '4px 0 24px rgba(0,0,0,.15)'
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏥</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, lineHeight: 1.3 }}>S.R. Patil Hospital</div>
            <div style={{ color: '#64748b', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>Research Centre</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {ALL_ITEMS.filter(canView).map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 12px', borderRadius: 9,
            marginBottom: 2, transition: 'all .15s', fontSize: 13, fontWeight: isActive ? 700 : 500,
            color: isActive ? '#fff' : '#94a3b8',
            background: isActive ? 'rgba(37,99,235,.35)' : 'transparent',
            borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent'
          })}>
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div style={{ padding: '14px 14px 18px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: roleColor[user?.role] || '#94a3b8', textTransform: 'uppercase', letterSpacing: .8 }}>{roleLabel[user?.role]}</div>
          </div>
        </div>
        <button onClick={handleLogout} style={{
          width: '100%', padding: '8px', background: 'rgba(239,68,68,.15)', border: '1px solid rgba(239,68,68,.3)',
          color: '#fca5a5', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer'
        }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}