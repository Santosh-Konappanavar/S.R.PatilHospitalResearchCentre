/* SRP Hospital — Design system primitives.
   Editorial navy + gold. Use these instead of inline styles for new surfaces. */

import React from 'react';

/* ─────────────────────────  Button  ───────────────────────── */

export const Button = ({
  variant = 'primary', size = 'md', children, icon, iconRight,
  loading, disabled, fullWidth, type = 'button', onClick, style, ...rest
}) => {
  const variants = {
    primary: {
      bg: 'linear-gradient(135deg, #0d2137 0%, #163352 50%, #1e4976 100%)',
      bgHover: 'linear-gradient(135deg, #122c47 0%, #1e4976 50%, #2c5e92 100%)',
      color: '#fff',
      border: '1px solid rgba(255,255,255,0.06)',
      boxShadow: '0 1px 2px rgba(13,33,55,.18), 0 8px 24px rgba(13,33,55,.18)',
    },
    gold: {
      bg: 'linear-gradient(135deg, #d49a2c 0%, #f59e0b 60%, #fbbf24 100%)',
      bgHover: 'linear-gradient(135deg, #b48428 0%, #d49a2c 60%, #f59e0b 100%)',
      color: '#1a1108',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 1px 2px rgba(180,132,40,.3), 0 8px 24px rgba(245,158,11,.28)',
    },
    ghost: {
      bg: 'transparent',
      bgHover: 'rgba(13,33,55,0.06)',
      color: '#163352',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    outline: {
      bg: '#fff',
      bgHover: '#f8fafc',
      color: '#163352',
      border: '1.5px solid #d8dee8',
      boxShadow: '0 1px 2px rgba(13,33,55,.04)',
    },
    danger: {
      bg: 'linear-gradient(135deg, #b91c1c, #dc2626)',
      bgHover: 'linear-gradient(135deg, #991b1b, #b91c1c)',
      color: '#fff',
      border: '1px solid rgba(0,0,0,0.05)',
      boxShadow: '0 1px 2px rgba(220,38,38,.25), 0 8px 24px rgba(220,38,38,.18)',
    },
  };

  const sizes = {
    sm: { padding: '7px 12px', fontSize: 12, height: 30, radius: 8,  gap: 6 },
    md: { padding: '10px 16px', fontSize: 13, height: 38, radius: 10, gap: 8 },
    lg: { padding: '13px 22px', fontSize: 14, height: 46, radius: 12, gap: 10 },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  const [hover, setHover] = React.useState(false);
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: s.gap,
        padding: s.padding,
        height: s.height,
        background: hover && !isDisabled ? v.bgHover : v.bg,
        color: v.color,
        border: v.border,
        borderRadius: s.radius,
        fontSize: s.fontSize,
        fontWeight: 700,
        letterSpacing: '0.01em',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
        boxShadow: hover && !isDisabled ? v.boxShadow : (isDisabled ? 'none' : v.boxShadow),
        transition: 'background var(--t-base) var(--ease-out), box-shadow var(--t-base) var(--ease-out), transform var(--t-fast) var(--ease-out)',
        transform: hover && !isDisabled ? 'translateY(-1px)' : 'translateY(0)',
        width: fullWidth ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner size={s.fontSize} color={v.color} /> : icon}
      {children}
      {iconRight}
    </button>
  );
};

const Spinner = ({ size = 13, color = 'currentColor' }) => (
  <span style={{
    display: 'inline-block', width: size, height: size,
    border: `2px solid ${color}33`, borderTopColor: color,
    borderRadius: '50%', animation: 'srp-spin .7s linear infinite',
  }} />
);

/* ─────────────────────────  Card  ─────────────────────────── */

export const Card = ({ children, padded = true, hover, style, accent, ...rest }) => (
  <div
    className="srp-anim-in"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-lg)',
      boxShadow: 'var(--shadow-sm)',
      padding: padded ? 22 : 0,
      position: 'relative',
      overflow: 'hidden',
      transition: 'box-shadow var(--t-base) var(--ease-out), transform var(--t-base) var(--ease-out)',
      ...(hover ? { cursor: 'pointer' } : {}),
      ...style,
    }}
    onMouseEnter={hover ? (e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }) : undefined}
    onMouseLeave={hover ? (e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)'; }) : undefined}
    {...rest}
  >
    {accent && (
      <span style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: 'linear-gradient(90deg, #d49a2c, #f59e0b, #d49a2c)',
      }} />
    )}
    {children}
  </div>
);

/* ────────────────────────  StatCard  ──────────────────────── */

export const StatCard = ({ icon, label, value, sub, trend, accent = '#1e4976' }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#fff',
        border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)',
        padding: '20px 22px',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all var(--t-base) var(--ease-out)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <span style={{
        position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
        background: accent, borderRadius: '3px 0 0 3px',
      }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-soft)', marginBottom: 8 }}>
            {label}
          </div>
          <div className="srp-display" style={{ fontSize: 30, color: 'var(--navy-900)' }}>
            {value ?? '—'}
          </div>
          {(sub || trend) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              {trend && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: trend.startsWith('-') ? 'var(--signal-red)' : 'var(--signal-green)',
                  background: trend.startsWith('-') ? 'var(--signal-red-bg)' : 'var(--signal-green-bg)',
                  padding: '2px 8px', borderRadius: 'var(--r-full)',
                }}>
                  {trend}
                </span>
              )}
              {sub && <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{sub}</span>}
            </div>
          )}
        </div>
        <div style={{
          width: 46, height: 46, borderRadius: 'var(--r-md)',
          background: `${accent}1a`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────  Badge  ────────────────────────── */

export const Badge = ({ children, tone = 'navy', size = 'md', dot, style }) => {
  const tones = {
    navy:    { bg: 'var(--navy-100)',     fg: 'var(--navy-800)',     dot: 'var(--navy-500)' },
    gold:    { bg: 'var(--gold-100)',     fg: 'var(--gold-700)',     dot: 'var(--gold-500)' },
    green:   { bg: 'var(--signal-green-bg)',  fg: 'var(--signal-green)',  dot: 'var(--signal-green)' },
    blue:    { bg: 'var(--signal-blue-bg)',   fg: 'var(--signal-blue)',   dot: 'var(--signal-blue)' },
    red:     { bg: 'var(--signal-red-bg)',    fg: 'var(--signal-red)',    dot: 'var(--signal-red)' },
    orange:  { bg: 'var(--signal-orange-bg)', fg: 'var(--signal-orange)', dot: 'var(--signal-orange)' },
    purple:  { bg: 'var(--signal-purple-bg)', fg: 'var(--signal-purple)', dot: 'var(--signal-purple)' },
    teal:    { bg: 'var(--signal-teal-bg)',   fg: 'var(--signal-teal)',   dot: 'var(--signal-teal)' },
    neutral: { bg: 'var(--bg-muted)',         fg: 'var(--text-muted)',    dot: 'var(--text-faint)' },
  };
  const t = tones[tone] || tones.navy;
  const sizes = {
    sm: { fontSize: 10, padding: '2px 7px',  gap: 4, height: 18 },
    md: { fontSize: 11, padding: '3px 9px',  gap: 5, height: 22 },
    lg: { fontSize: 12, padding: '4px 11px', gap: 6, height: 26 },
  };
  const s = sizes[size] || sizes.md;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      background: t.bg, color: t.fg,
      fontSize: s.fontSize, fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: s.padding, height: s.height, borderRadius: 'var(--r-full)',
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.dot }} />}
      {children}
    </span>
  );
};

/* ─────────────────────────  Avatar  ───────────────────────── */

export const Avatar = ({ name, size = 36, tone = 'auto' }) => {
  const initials = (name || '?').split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const tones = {
    auto:  ['linear-gradient(135deg, #0d2137, #1e4976)', '#fff'],
    gold:  ['linear-gradient(135deg, #d49a2c, #fbbf24)', '#1a1108'],
    green: ['linear-gradient(135deg, #065f46, #10b981)', '#fff'],
    blue:  ['linear-gradient(135deg, #1e40af, #3b82f6)', '#fff'],
    red:   ['linear-gradient(135deg, #991b1b, #ef4444)', '#fff'],
    navy:  ['linear-gradient(135deg, #0d2137, #2c5e92)', '#fff'],
  };
  const seedTones = ['navy', 'blue', 'green', 'gold', 'red'];
  const tone_ = tone === 'auto' ? seedTones[(initials.charCodeAt(0) || 0) % seedTones.length] : tone;
  const [bg, fg] = tones[tone_] || tones.auto;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.max(11, Math.floor(size * 0.38)),
      fontWeight: 800, flexShrink: 0,
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
      letterSpacing: '0.02em',
    }}>
      {initials || '?'}
    </div>
  );
};

/* ─────────────────────  BrandMark  ────────────────────────── */

export const BrandMark = ({ size = 36 }) => (
  <div style={{
    width: size, height: size,
    background: 'linear-gradient(135deg, #d49a2c 0%, #f59e0b 60%, #fbbf24 100%)',
    borderRadius: Math.max(8, size * 0.28),
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#1a1108', fontSize: size * 0.55, fontWeight: 800,
    boxShadow: '0 2px 6px rgba(180,132,40,.35), inset 0 -2px 0 rgba(0,0,0,.08)',
    position: 'relative',
  }}>
    <span style={{ position: 'relative', zIndex: 1, fontFamily: 'var(--font-display)' }}>+</span>
  </div>
);

/* ────────────────────  Section Header  ───────────────────── */

export const SectionHeader = ({ eyebrow, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 16, flexWrap: 'wrap' }}>
    <div>
      {eyebrow && <div className="srp-eyebrow" style={{ marginBottom: 6 }}>{eyebrow}</div>}
      <h2 className="srp-display" style={{ fontSize: 22, color: 'var(--navy-900)' }}>{title}</h2>
    </div>
    {action}
  </div>
);

/* ───────────────────────  Divider  ────────────────────────── */

export const Divider = ({ label }) => label ? (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0', color: 'var(--text-faint)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em' }}>
    <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
    {label}
    <span style={{ flex: 1, height: 1, background: 'var(--border-soft)' }} />
  </div>
) : (
  <div style={{ height: 1, background: 'var(--border-soft)', margin: '20px 0' }} />
);

/* ──────────────────────  DataChip  ───────────────────────── */

export const DataChip = ({ icon, label, value, accent = '#1e4976' }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 14px',
    background: '#fff',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-md)',
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: 'var(--r-sm)',
      background: `${accent}1a`, color: accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 14,
    }}>{icon}</div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-faint)' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy-900)' }}>{value}</div>
    </div>
  </div>
);

/* Spin keyframes — referenced by Spinner. Need to live in CSS for animation name. */
const _spin = `
@keyframes srp-spin { to { transform: rotate(360deg); } }
`;
if (typeof document !== 'undefined' && !document.getElementById('srp-spin-keyframes')) {
  const style = document.createElement('style');
  style.id = 'srp-spin-keyframes';
  style.textContent = _spin;
  document.head.appendChild(style);
}