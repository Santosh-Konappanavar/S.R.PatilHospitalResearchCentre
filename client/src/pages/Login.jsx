import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'linear-gradient(135deg, #0d2137 0%, #163352 50%, #1e4976 100%)' }}>
      {/* Left Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', color: '#fff', maxWidth: 560 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48 }}>
          <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏥</div>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: '#94a3b8', marginBottom: 2 }}>Est. 1985</div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: .5 }}>S.R. Patil Hospital</div>
          </div>
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
          Trusted Healthcare<br />
          <span style={{ color: '#f59e0b' }}>Since 1985</span>
        </h1>
        <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.7, marginBottom: 48 }}>
          Badgandi's leading hospital and research centre — providing compassionate, world-class medical care to our community.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[['🫀','Cardiology'],['🔬','Research Centre'],['🚑','24/7 Emergency'],['👶','Paediatrics']].map(([icon, label]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.07)', borderRadius: 10, padding: '12px 16px' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#cbd5e1' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 24, padding: '44px 40px', boxShadow: '0 24px 64px rgba(0,0,0,.3)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>Hospital Management System</div>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0d2137' }}>Sign in to continue</h2>
          </div>

          <form onSubmit={handle}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>👤</span>
                <input
                  value={form.username}
                  onChange={e => setForm(p => ({...p, username: e.target.value}))}
                  placeholder="Enter your username"
                  required
                  style={{ width: '100%', padding: '12px 14px 12px 40px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', transition: 'border .2s', background: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({...p, password: e.target.value}))}
                  placeholder="Enter your password"
                  required
                  style={{ width: '100%', padding: '12px 42px 12px 40px', border: '1.5px solid #e2e8f0', borderRadius: 10, fontSize: 14, outline: 'none', background: '#f8fafc' }}
                  onFocus={e => e.target.style.borderColor = '#2563eb'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <button type="button" onClick={() => setShowPw(p=>!p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#94a3b8' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #0d2137, #1e4976)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, letterSpacing: .3, transition: 'opacity .2s' }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: '16px', background: '#f0f4f8', borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Demo Credentials</div>
            {[['chairman','chairman@123','Chairman'],['admin','admin@123','Admin'],['cardiology','dept@123','Department']].map(([u,p,r]) => (
              <div key={u} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', padding: '3px 0' }}>
                <span style={{ fontWeight: 600 }}>{r}</span>
                <span style={{ color: '#64748b' }}>{u} / {p}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#94a3b8' }}>
            S.R. Patil Hospital & Research Centre, Badgandi
          </div>
        </div>
      </div>
    </div>
  );
}