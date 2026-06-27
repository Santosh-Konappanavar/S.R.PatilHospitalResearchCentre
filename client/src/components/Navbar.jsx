import { useAuth } from '../context/AuthContext';

export default function Navbar({ title }) {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div style={{
      height: 60, background: '#fff', borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
      boxShadow: '0 1px 0 #e2e8f0'
    }}>
      <div>
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#0d2137' }}>{title || 'Dashboard'}</h1>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{dateStr}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{user?.name}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'capitalize' }}>{user?.role}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #0d2137, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </div>
  );
}