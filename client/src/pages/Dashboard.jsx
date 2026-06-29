import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatCard, Card, Badge, Avatar, Button, SectionHeader, DataChip } from '../ui/components';

const DEPT_PALETTE = ['#1e4976', '#d49a2c', '#0d9268', '#7c3aed', '#0e7490', '#dc2626', '#2563eb', '#ea580c'];

export default function Dashboard() {
  const { user, isAdmin, isChairman } = useAuth();
  const [data, setData] = useState(null);
  const [meData, setMeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    if (isAdmin) {
      api.get('/dashboard').then(r => alive && (setData(r.data), setLoading(false)))
        .catch(() => alive && setLoading(false));
    } else {
      api.get('/dashboard/me').then(r => alive && (setMeData(r.data), setLoading(false)))
        .catch(() => alive && setLoading(false));
    }
    return () => { alive = false; };
  }, [isAdmin]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <div>
      {/* ── Hero ───────────────────────────────────────────── */}
      <Hero
        greeting={greeting}
        name={firstName}
        fullName={user?.name}
        role={user?.role}
        departmentName={user?.departmentName}
        isChairman={isChairman}
        isAdmin={isAdmin}
      />

      {isAdmin && (
        loading ? (
          <SkeletonAdmin />
        ) : data ? (
          <AdminDashboard data={data} isChairman={isChairman} />
        ) : (
          <EmptyState
            icon="📡"
            title="Couldn't load the dashboard"
            subtitle="Please check that the server is running."
          />
        )
      )}

      {!isAdmin && (
        loading ? (
          <SkeletonDept />
        ) : meData ? (
          <DeptDashboard meData={meData} user={user} />
        ) : (
          <EmptyState
            icon="📡"
            title="Couldn't load your dashboard"
            subtitle="Please check that the server is running."
          />
        )
      )}
    </div>
  );
}

/* ─────────────────────────  Hero  ─────────────────────────── */

const Hero = ({ greeting, name, fullName, role, departmentName, isChairman, isAdmin }) => {
  const palette = isChairman
    ? { from: '#3a2400', via: '#92651a', to: '#d49a2c', accent: '#fbbf24', glow: 'rgba(245,158,11,0.25)' }
    : isAdmin
    ? { from: '#07172a', via: '#0d2137', to: '#1e4976', accent: '#fbbf24', glow: 'rgba(30,73,118,0.5)' }
    : { from: '#064e3b', via: '#065f46', to: '#10b981', accent: '#fbbf24', glow: 'rgba(16,185,129,0.3)' };

  const roleLabel = isChairman ? 'Chairman' : isAdmin ? 'Administrator' : 'Department user';

  return (
    <div className="srp-anim-in" style={{
      position: 'relative',
      borderRadius: 'var(--r-2xl)',
      padding: '36px 40px',
      marginBottom: 28,
      color: '#fff',
      background: `linear-gradient(120deg, ${palette.from} 0%, ${palette.via} 50%, ${palette.to} 100%)`,
      overflow: 'hidden',
      boxShadow: `0 10px 30px ${palette.glow}, 0 2px 6px rgba(13,33,55,0.16)`,
    }}>
      {/* Decorative gold ring */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px',
        width: '280px', height: '280px',
        border: '2px solid rgba(245,158,11,0.2)',
        borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', top: '20px', right: '40px',
        width: '120px', height: '120px',
        border: '1px solid rgba(245,158,11,0.15)',
        borderRadius: '50%',
      }} />
      {/* Pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 80% 30%, rgba(255,255,255,0.08) 0%, transparent 30%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <Badge tone="gold" size="md" dot style={{ marginBottom: 14 }}>
            {greeting}
          </Badge>
          <h1 className="srp-display" style={{ fontSize: 36, color: '#fff', marginBottom: 8 }}>
            {name} 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', color: 'rgba(232,238,247,0.85)', fontSize: 14 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar name={fullName} size={28} tone="auto" />
              <span style={{ fontWeight: 600 }}>{fullName}</span>
            </span>
            <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
            <Badge tone="gold" size="sm">{roleLabel}</Badge>
            {departmentName && (
              <>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }} />
                <span style={{ fontWeight: 600 }}>{departmentName}</span>
              </>
            )}
          </div>
        </div>

        <div style={{
          textAlign: 'right',
          padding: '14px 22px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 'var(--r-lg)',
          backdropFilter: 'blur(10px)',
          minWidth: 200,
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: palette.accent, marginBottom: 4 }}>
            Today
          </div>
          <div className="srp-display" style={{ fontSize: 22, color: '#fff' }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(232,238,247,0.7)', marginTop: 2 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long' })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────  Admin Dashboard  ───────────────────── */

const AdminDashboard = ({ data, isChairman }) => {
  const adminActions = [
    { icon: '⚙️', label: 'Manage Users',         color: '#2563eb', href: '/users' },
    { icon: '🩺', label: 'OPD Visits',           color: '#0d9268', href: '/opd' },
    { icon: '🛏️', label: 'IPD Admissions',       color: '#d49a2c', href: '/ipd' },
    { icon: '🛒', label: 'Purchase Approvals',   color: '#dc2626', href: '/purchase' },
    { icon: '📋', label: 'Licenses',             color: '#7c3aed', href: '/licenses' },
    { icon: '📢', label: 'Post Update',          color: '#0e7490', href: '/updates' },
  ];

  return (
    <>
      {/* Stat grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <StatCard icon="👥"   label="Total Patients"    value={data.totalPatients}   accent="#2563eb" sub="Active records" />
        <StatCard icon="🩺"   label="Today's OPD"       value={data.todayOPD}        accent="#0d9268" sub="Visits today" />
        <StatCard icon="🛏️"  label="Current IPD"       value={data.currentIPD}      accent="#d49a2c" sub="Admitted patients" />
        <StatCard icon="👨‍⚕️" label="Active Staff"     value={data.totalStaff}      accent="#7c3aed" sub="On duty" />
        <StatCard icon="🛒"   label="Pending POs"       value={data.pendingPOs}      accent="#dc2626" sub="Awaiting approval" />
        <StatCard icon="📋"   label="Expired Licenses"  value={data.expiredLicenses} accent="#ea580c" sub="Need renewal" />
        <StatCard icon="🏢"   label="Departments"       value={data.totalDepartments} accent="#0e7490" sub="Active" />
      </div>

      {/* Quick actions (admin only — not chairman) */}
      {!isChairman && (
        <>
          <SectionHeader eyebrow="Quick actions" title="Manage your hospital" />
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12, marginBottom: 28,
          }}>
            {adminActions.map(a => (
              <ActionTile key={a.href} {...a} />
            ))}
          </div>
        </>
      )}

      {/* Per-department snapshot */}
      {data.departmentStats?.length > 0 && (
        <Card padded={false} accent style={{ marginBottom: 28 }}>
          <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="srp-eyebrow" style={{ marginBottom: 4 }}>Department health</div>
              <h3 className="srp-display" style={{ fontSize: 17, color: 'var(--navy-900)' }}>
                Per-Department Snapshot
                {isChairman && (
                  <span style={{
                    marginLeft: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
                    color: 'var(--gold-700)', textTransform: 'uppercase',
                    background: 'var(--gold-100)', padding: '3px 8px',
                    borderRadius: 'var(--r-full)',
                    verticalAlign: 'middle',
                  }}>
                    Read-only
                  </span>
                )}
              </h3>
            </div>
            <Badge tone="navy" size="sm" dot>{data.departmentStats.length} departments</Badge>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-tinted)' }}>
                  {['Department', 'OPD Today', 'IPD Admitted', 'Last Update'].map((h, i) => (
                    <th key={h} style={{
                      padding: '12px 20px', textAlign: i === 0 ? 'left' : 'right',
                      fontSize: 10, fontWeight: 700, color: 'var(--text-faint)',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      borderTop: '1px solid var(--border-soft)',
                      borderBottom: '1px solid var(--border-soft)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.departmentStats.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-soft)', transition: 'background var(--t-fast) var(--ease-out)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tinted)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 32, height: 32, borderRadius: 'var(--r-sm)',
                          background: `${d.color}1a`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, flexShrink: 0,
                        }}>{iconForDept(d.code)}</span>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 13 }}>{d.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{d.code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Badge tone="green" size="md">{d.opdToday}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      <Badge tone="gold" size="md">{d.ipdAdmitted}</Badge>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'right', color: 'var(--text-soft)', fontSize: 12, maxWidth: 280 }}>
                      {d.lastUpdate ? (
                        <>
                          <div style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{d.lastUpdate.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                            {new Date(d.lastUpdate.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </div>
                        </>
                      ) : <span style={{ color: 'var(--text-faint)' }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent updates */}
      {data.recentUpdates?.length > 0 && (
        <Card>
          <SectionHeader
            eyebrow="Hospital-wide"
            title="Recent updates"
            action={<Badge tone="navy" size="md" dot>{data.recentUpdates.length} new</Badge>}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.recentUpdates.slice(0, 6).map((u, i) => (
              <UpdateItem key={u._id} u={u} />
            ))}
          </div>
        </Card>
      )}
    </>
  );
};

/* ────────────────────  Department Dashboard  ──────────────── */

const DeptDashboard = ({ meData, user }) => {
  const tiles = [
    { path: '/opd',     icon: '🩺', label: 'OPD Visits',     color: '#0d9268', perm: 'canViewOPD' },
    { path: '/ipd',     icon: '🛏️', label: 'IPD Admissions', color: '#d49a2c', perm: 'canViewIPD' },
    { path: '/patients',icon: '👥', label: 'Patients',       color: '#0e7490' },
    { path: '/updates', icon: '📢', label: 'Post Update',    color: '#7c3aed' },
  ].filter(t => !t.perm || user?.permissions?.[t.perm]);

  return (
    <>
      <Card accent style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--r-lg)',
            background: 'linear-gradient(135deg, #065f46, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: '#fff',
            boxShadow: '0 6px 16px rgba(16,185,129,0.3)',
          }}>🏥</div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="srp-eyebrow" style={{ color: 'var(--gold-700)', marginBottom: 4 }}>Your department</div>
            <h2 className="srp-display" style={{ fontSize: 22, color: 'var(--navy-900)', marginBottom: 4 }}>
              {meData.departmentName || user?.departmentName}
            </h2>
            <div style={{ fontSize: 13, color: 'var(--text-soft)' }}>
              You can only view and edit records for this department.
            </div>
          </div>
          <Button variant="gold" icon="📢" onClick={() => window.location.href = '/updates'}>
            Post daily update
          </Button>
        </div>
      </Card>

      {/* Scoped stat tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16, marginBottom: 28,
      }}>
        <StatCard icon="🩺"  label="OPD Today"        value={meData.opdToday}     accent="#0d9268" sub="Visits in your dept" />
        <StatCard icon="🛏️"  label="Current IPD"      value={meData.ipdAdmitted}  accent="#d49a2c" sub="Admitted patients" />
        <StatCard icon="📢"  label="Updates Today"    value={meData.updatesToday} accent="#7c3aed" sub="Posted by your team" />
        <StatCard icon="👨‍⚕️" label="Dept Staff"       value={meData.myStaffCount} accent="#2563eb" sub="Active in your dept" />
      </div>

      {/* Quick links */}
      <SectionHeader eyebrow="Shortcuts" title="Get things done" />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 12,
      }}>
        {tiles.map(t => <ActionTile key={t.path} {...t} />)}
      </div>
    </>
  );
};

/* ──────────────────────  Shared bits  ─────────────────────── */

const ActionTile = ({ icon, label, color, href }) => (
  <a href={href} style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '18px 20px',
    background: '#fff',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-lg)',
    boxShadow: 'var(--shadow-xs)',
    transition: 'all var(--t-base) var(--ease-out)',
    textDecoration: 'none',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
      e.currentTarget.style.borderColor = 'var(--border-soft)';
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 'var(--r-md)',
      background: `${color}1a`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20, flexShrink: 0,
    }}>{icon}</div>
    <div>
      <div className="srp-display" style={{ fontSize: 14, color: 'var(--navy-900)' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>Open →</div>
    </div>
  </a>
);

const UpdateItem = ({ u }) => {
  const tone = { urgent: 'red', warning: 'orange', success: 'green', info: 'blue', general: 'navy' }[u.type] || 'navy';
  const emoji = { urgent: '🔴', warning: '⚠️', success: '✅', info: '📋', general: '📝' }[u.type] || '📝';
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '14px 16px',
      background: 'var(--bg-tinted)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-md)',
      transition: 'all var(--t-base) var(--ease-out)',
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 'var(--r-sm)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>{emoji}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
          <Badge tone={tone} size="sm">{u.type}</Badge>
          {u.departmentName && (
            <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 600 }}>
              · {u.departmentName}
            </span>
          )}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 13, marginBottom: 2 }}>{u.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.5 }}>{u.content}</div>
        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
          By {u.postedByName} · {timeAgo(u.createdAt)}
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <Card>
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-soft)' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <div className="srp-display" style={{ fontSize: 18, color: 'var(--navy-900)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13 }}>{subtitle}</div>
    </div>
  </Card>
);

const SkeletonAdmin = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
    {Array.from({ length: 7 }).map((_, i) => (
      <div key={i} style={{
        height: 110, borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(90deg, var(--bg-muted) 25%, var(--bg-tinted) 50%, var(--bg-muted) 75%)',
        backgroundSize: '200% 100%',
        animation: 'srp-shimmer 1.4s linear infinite',
      }} />
    ))}
  </div>
);

const SkeletonDept = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} style={{
        height: 110, borderRadius: 'var(--r-lg)',
        background: 'linear-gradient(90deg, var(--bg-muted) 25%, var(--bg-tinted) 50%, var(--bg-muted) 75%)',
        backgroundSize: '200% 100%',
        animation: 'srp-shimmer 1.4s linear infinite',
      }} />
    ))}
  </div>
);

/* ───────────────────────  Helpers  ────────────────────────── */

const iconForDept = (code) => ({
  CARD: '🫀', SURG: '🔪', GYNEC: '🤰', ICU: '🚨', PEDS: '👶',
  ORTH: '🦴', LAB: '🔬', RADIO: '📡', PHARM: '💊', EMRG: '🚑',
  OPD: '🩺', GWD: '🏥', SCHM: '📜',
}[code] || '🏥');

const timeAgo = (iso) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};