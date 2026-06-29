import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Button, BrandMark, Badge } from '../ui/components';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  const fillDemo = (u, p) => setForm({ username: u, password: p });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #07172a 0%, #0d2137 45%, #122c47 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative gold glow */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '700px', height: '700px',
        background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-150px', left: '40%',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(30,73,118,0.4) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />

      {/* Left — brand hero */}
      <div style={{
        flex: '0 0 52%', position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '60px 72px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <BrandMark size={48} />
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#94abc7', marginBottom: 2 }}>
              Est. 1985 · Badgandi
            </div>
            <div className="srp-display" style={{ fontSize: 18, color: '#fff' }}>
              S.R. Patil Hospital
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 480 }}>
          <Badge tone="gold" size="md" dot style={{ marginBottom: 22 }}>
            Hospital Management System
          </Badge>
          <h1 className="srp-display" style={{
            fontSize: 54, lineHeight: 1.05, marginBottom: 22, color: '#fff',
            fontWeight: 800,
          }}>
            Trusted healthcare,<br />
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 60%, #d49a2c 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              delivered with care.
            </span>
          </h1>
          <p style={{ fontSize: 16, color: '#94abc7', lineHeight: 1.65, marginBottom: 36, maxWidth: 460 }}>
            A unified command centre for our 13 departments — OPD, IPD, surgery, ICU, diagnostics, schemes and beyond. Built for the front-line teams who keep this hospital running.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { icon: '🫀', label: 'Cardiology',         sub: 'Heart & vascular care' },
              { icon: '🔬', label: 'Diagnostics',        sub: 'Lab · Radiology · NABL' },
              { icon: '🚑', label: '24/7 Emergency',     sub: 'Critical & trauma' },
              { icon: '👶', label: 'Mother & Child',     sub: 'OBG · Paediatrics' },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 'var(--r-md)',
                backdropFilter: 'blur(8px)',
                transition: 'all var(--t-base) var(--ease-out)',
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 'var(--r-sm)',
                  background: 'rgba(245,158,11,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>{item.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 1 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: '#94abc7' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24, color: '#94abc7', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <span>ISO 9001</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#94abc7' }} />
          <span>NMC Accredited</span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#94abc7' }} />
          <span>NABL Certified</span>
        </div>
      </div>

      {/* Right — sign-in card */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 56px 40px 24px', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: '100%', maxWidth: 440,
          background: '#fff',
          borderRadius: 'var(--r-2xl)',
          padding: '40px 36px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.18)',
          border: '1px solid rgba(255,255,255,0.6)',
        }}>
          <div style={{ marginBottom: 28 }}>
            <div className="srp-eyebrow" style={{ color: 'var(--gold-700)', marginBottom: 8 }}>
              Welcome back
            </div>
            <h2 className="srp-display" style={{ fontSize: 26, color: 'var(--navy-900)', marginBottom: 6 }}>
              Sign in to continue
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>
              Use your hospital credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handle}>
            <FieldGroup label="Username" icon="👤">
              <input
                value={form.username}
                onChange={e => setForm(p => ({...p, username: e.target.value}))}
                placeholder="e.g. chairman"
                autoComplete="username"
                required
                className="srp-focus"
                style={inputStyle}
              />
            </FieldGroup>

            <FieldGroup label="Password" icon="🔒" style={{ marginBottom: 24 }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(p => ({...p, password: e.target.value}))}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="srp-focus"
                style={{ ...inputStyle, paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', padding: 6,
                  color: 'var(--text-faint)', cursor: 'pointer', fontSize: 16,
                  borderRadius: 'var(--r-sm)',
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </FieldGroup>

            <Button type="submit" variant="gold" size="lg" fullWidth loading={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </Button>
          </form>

          {/* Demo creds */}
          <div style={{ marginTop: 26 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
              color: 'var(--text-soft)',
            }}>
              <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
              <span className="srp-eyebrow">Try a demo account</span>
              <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { u: 'chairman', p: 'chairman@123', label: 'Chairman', tone: 'gold' },
                { u: 'admin',    p: 'admin@123',    label: 'Admin',    tone: 'navy' },
                { u: 'opd',      p: 'opd@123',      label: 'OPD Dept', tone: 'green' },
                { u: 'scheme',   p: 'scheme@123',   label: 'Scheme',   tone: 'purple' },
              ].map(d => (
                <button key={d.u} type="button" onClick={() => fillDemo(d.u, d.p)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
                    padding: '10px 12px',
                    background: '#fff',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 'var(--r-md)',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all var(--t-fast) var(--ease-out)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--navy-300)'; e.currentTarget.style.background = 'var(--bg-tinted)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <Badge tone={d.tone} size="sm" dot>{d.label}</Badge>
                  <div style={{ fontSize: 11, color: 'var(--text-soft)', fontFamily: 'var(--font-mono)' }}>
                    {d.u} / {d.p}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--text-faint)', letterSpacing: '0.05em' }}>
            © {new Date().getFullYear()} S.R. Patil Hospital & Research Centre · Badgandi
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  background: 'var(--bg-tinted)',
  border: '1.5px solid var(--border)',
  borderRadius: 'var(--r-md)',
  fontSize: 14, fontWeight: 500,
  color: 'var(--text)',
  outline: 'none',
  transition: 'all var(--t-base) var(--ease-out)',
};

const FieldGroup = ({ label, icon, children, style: extraStyle }) => (
  <div style={{ marginBottom: 18, ...extraStyle }}>
    <label style={{
      display: 'block', fontSize: 12, fontWeight: 700,
      color: 'var(--navy-800)', marginBottom: 6,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
        fontSize: 15, pointerEvents: 'none', opacity: 0.6,
      }}>{icon}</span>
      {children}
    </div>
  </div>
);