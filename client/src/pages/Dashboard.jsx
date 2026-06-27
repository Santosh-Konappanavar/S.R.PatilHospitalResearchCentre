import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Card = ({ icon, label, value, color, sub }) => (
  <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,.07)', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: color, borderRadius: '14px 0 0 14px' }} />
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 6 }}>{label}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: '#0d2137', lineHeight: 1 }}>{value ?? '—'}</div>
        {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    } else { setLoading(false); }
  }, [isAdmin]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg, #0d2137 0%, #1e4976 100%)', borderRadius: 16, padding: '26px 28px', marginBottom: 24, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 4 }}>{greeting}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{user?.name} 👋</h2>
          <div style={{ fontSize: 13, color: '#64748b', textTransform: 'capitalize' }}>
            Role: <span style={{ color: '#f59e0b', fontWeight: 700 }}>{user?.role}</span>
            {user?.departmentName && <span> · {user.departmentName}</span>}
          </div>
        </div>
        <div style={{ fontSize: 56, opacity: .2 }}>🏥</div>
      </div>

      {isAdmin && (
        loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Loading dashboard data...</div>
        ) : data ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
              <Card icon="👥" label="Total Patients"    value={data.totalPatients}    color="#2563eb" sub="Active records" />
              <Card icon="🩺" label="Today's OPD"       value={data.todayOPD}         color="#10b981" sub="Visits today" />
              <Card icon="🛏️" label="Current IPD"       value={data.currentIPD}        color="#f59e0b" sub="Admitted patients" />
              <Card icon="👨‍⚕️" label="Active Staff"     value={data.totalStaff}        color="#8b5cf6" sub="On duty" />
              <Card icon="🛒" label="Pending POs"       value={data.pendingPOs}        color="#ef4444" sub="Purchase orders" />
              <Card icon="📋" label="Expired Licenses"  value={data.expiredLicenses}   color="#f97316" sub="Need renewal" />
              <Card icon="🏢" label="Departments"       value={data.totalDepartments}  color="#0ea5e9" sub="Active" />
            </div>

            {data.recentUpdates?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 14, padding: 22, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0d2137', marginBottom: 16 }}>📢 Recent Hospital Updates</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.recentUpdates.map(u => (
                    <div key={u._id} style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: 10, borderLeft: '3px solid #2563eb' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{u.title}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{u.content}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>By {u.postedByName} · {new Date(u.createdAt).toLocaleDateString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>Could not load dashboard data. Ensure the server is running.</div>
      )}

      {!isAdmin && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: '🩺', label: 'OPD Visits', path: '/opd', color: '#10b981', perm: 'canViewOPD' },
            { icon: '🛏️', label: 'IPD Admissions', path: '/ipd', color: '#f59e0b', perm: 'canViewIPD' },
            { icon: '👨‍⚕️', label: 'My Staff', path: '/staff', color: '#8b5cf6', perm: 'canViewStaff' },
            { icon: '🛒', label: 'Purchase Orders', path: '/purchase', color: '#ef4444', perm: 'canViewPurchase' },
            { icon: '📢', label: 'Updates', path: '/updates', color: '#2563eb' },
            { icon: '👥', label: 'Patients', path: '/patients', color: '#0ea5e9' },
          ].filter(i => !i.perm || user?.permissions?.[i.perm]).map(item => (
            <a href={item.path} key={item.path} style={{
              background: '#fff', borderRadius: 14, padding: '24px 22px', border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,.07)',
              transition: 'transform .15s, box-shadow .15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.07)'; }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{item.icon}</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0d2137' }}>{item.label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}