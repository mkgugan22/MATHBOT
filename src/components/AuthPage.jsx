import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { motion } from 'framer-motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PW_RULES = [
  { key: 'len',   label: 'At least 8 characters',         test: v => v.length >= 8 },
  { key: 'upper', label: 'One uppercase letter',           test: v => /[A-Z]/.test(v) },
  { key: 'lower', label: 'One lowercase letter',           test: v => /[a-z]/.test(v) },
  { key: 'num',   label: 'At least one number',            test: v => /[0-9]/.test(v) },
  { key: 'spec',  label: 'One special character',          test: v => /[!@#$%^&*(),.?":{}|<>]/.test(v) },
];

function vEmail(v) {
  if (!v.trim()) return 'Please enter your email address.';
  if (!EMAIL_RE.test(v.trim())) return 'Please enter a valid email address.';
  return '';
}
function vPassword(v, mode) {
  if (!v) return 'Please enter your password.';
  if (mode === 'signup') {
    const fail = PW_RULES.find(r => !r.test(v));
    if (fail) return `Password must include: ${fail.label.toLowerCase()}.`;
  }
  return '';
}
function vConfirm(pw, cf) {
  if (!cf) return 'Please confirm your password.';
  if (pw !== cf) return 'Passwords do not match.';
  return '';
}
function pwHint(v) {
  if (!v) return 'Start with a strong password: at least 8 characters.';
  const fail = PW_RULES.find(r => !r.test(v));
  return fail ? `Next: ${fail.label}.` : '✓ Password meets all requirements!';
}

export default function AuthPage() {
  const { login, signup } = useAuth();
  const [mode, setMode]   = useState('login');
  const [form, setForm]   = useState({ name: '', email: '', password: '', confirm: '' });
  const [errs, setErrs]   = useState({});
  const [apiErr, setApiErr] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = field => e => {
    const val = e.target.value;
    setForm(f => ({ ...f, [field]: val }));
    setApiErr('');
    setErrs(prev => ({
      ...prev,
      [field]:
        field === 'email'    ? vEmail(val) :
        field === 'password' ? vPassword(val, mode) :
        field === 'confirm'  ? vConfirm(form.password, val) :
        field === 'name'     ? (val.trim() ? '' : 'Please enter your full name.') :
        prev[field],
    }));
    if (field === 'password' && mode === 'signup')
      setErrs(prev => ({ ...prev, confirm: vConfirm(val, form.confirm) }));
  };

  const submit = async e => {
    e.preventDefault();
    setApiErr('');
    const newErrs = {
      ...(mode === 'signup' ? { name: form.name.trim() ? '' : 'Please enter your full name.' } : {}),
      email:    vEmail(form.email),
      password: vPassword(form.password, mode),
      ...(mode === 'signup' ? { confirm: vConfirm(form.password, form.confirm) } : {}),
    };
    if (Object.values(newErrs).some(Boolean)) { setErrs(newErrs); return; }
    setLoading(true);
    try {
      if (mode === 'signup') await signup({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      else                   await login({ email: form.email.trim(), password: form.password });
    } catch (err) { setApiErr(err.message); }
    finally { setLoading(false); }
  };

  const switchMode = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setForm({ name: '', email: '', password: '', confirm: '' });
    setErrs({}); setApiErr('');
  };

  const floatingSymbols = ['∫', '∑', 'π', '√', '∞', '∂', 'Δ', 'θ', 'λ', 'σ'];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#050510', padding: '16px', boxSizing: 'border-box',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grid overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: `linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }} />

      {/* Floating math symbols */}
      {floatingSymbols.map((sym, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0.03, 0.08, 0.03], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
          style={{
            position: 'absolute', fontSize: 40 + (i % 3) * 15, color: '#6366f1',
            fontFamily: "'DM Serif Display', serif",
            left: `${5 + (i * 9.5) % 90}%`, top: `${5 + (i * 11) % 85}%`,
            userSelect: 'none', pointerEvents: 'none',
          }}
        >{sym}</motion.div>
      ))}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 420,
          background: 'rgba(15,15,35,0.92)',
          border: '1px solid rgba(99,102,241,0.25)',
          borderRadius: 20,
          padding: 'clamp(24px, 5%, 36px)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 0 0 1px rgba(99,102,241,0.06), 0 24px 64px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)',
          boxSizing: 'border-box',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, justifyContent: 'center' }}>
          <motion.div
            animate={{ boxShadow: ['0 0 20px rgba(99,102,241,0.4)', '0 0 40px rgba(139,92,246,0.6)', '0 0 20px rgba(99,102,241,0.4)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, flexShrink: 0,
            }}
          >∑</motion.div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#fff', lineHeight: 1 }}>MathBot</div>
            <div style={{ fontSize: 10, color: '#6366f1', fontFamily: "'JetBrains Mono', monospace", letterSpacing: 2 }}>EXPERT AI</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 3, marginBottom: 24,
        }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => mode !== m && switchMode()} type="button"
              style={{
                flex: 1, padding: '8px 0', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontFamily: "'Syne', sans-serif", fontSize: 12, fontWeight: 800,
                letterSpacing: 1, textTransform: 'uppercase', transition: 'all .22s',
                background: mode === m ? 'linear-gradient(135deg, rgba(99,102,241,0.5), rgba(139,92,246,0.3))' : 'transparent',
                color: mode === m ? '#f0f4ff' : '#6a6aaa',
                boxShadow: mode === m ? '0 2px 8px rgba(99,102,241,0.2)' : 'none',
              }}
            >{m === 'login' ? 'Sign In' : 'Create Account'}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <Field label="Full Name" error={errs.name}>
              <input className="math-inp" type="text" placeholder="John Doe"
                value={form.name} onChange={handle('name')} autoComplete="name" />
            </Field>
          )}
          <Field label="Email Address" error={errs.email}>
            <input className="math-inp" type="email" placeholder="you@example.com"
              value={form.email} onChange={handle('email')} autoComplete="email" />
          </Field>
          <Field label="Password" error={errs.password} hint={mode === 'signup' ? pwHint(form.password) : null}>
            <input className={`math-inp${errs.password ? ' err' : ''}`} type="password"
              placeholder={mode === 'signup' ? 'Strong password required' : 'Enter password'}
              value={form.password} onChange={handle('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </Field>
          {mode === 'signup' && (
            <Field label="Confirm Password" error={errs.confirm}>
              <input className={`math-inp${errs.confirm ? ' err' : ''}`} type="password"
                placeholder="Re-enter password" value={form.confirm} onChange={handle('confirm')}
                autoComplete="new-password" />
            </Field>
          )}

          {apiErr && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.3)',
              borderRadius: 10, color: '#f87171',
              fontFamily: "'Syne', sans-serif", fontSize: 13,
            }}>⚠ {apiErr}</div>
          )}

          <motion.button whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.97 }}
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', border: 'none', borderRadius: 10,
              cursor: loading ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff', fontFamily: "'Syne', sans-serif",
              fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase',
              opacity: loading ? 0.65 : 1,
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              minHeight: 48, marginTop: 4,
            }}
          >
            {loading
              ? <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'mathSpin .7s linear infinite' }} />
              : <span>{mode === 'login' ? 'Sign In →' : 'Create Account →'}</span>
            }
          </motion.button>
        </form>

        <p style={{ marginTop: 18, textAlign: 'center', fontFamily: "'Syne', sans-serif", fontSize: 13, color: '#6a6aaa' }}>
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={switchMode} type="button"
            style={{ background: 'none', border: 'none', color: '#a5b4fc', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Syne', sans-serif" }}>
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </motion.div>

      <style>{`
        .math-inp {
          width: 100%; padding: 11px 14px;
          background: rgba(15,15,40,0.8);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 10px; color: #e8e8ff;
          font-family: 'JetBrains Mono', monospace; font-size: 13px;
          outline: none; box-sizing: border-box; transition: border-color .2s, box-shadow .2s;
        }
        .math-inp::placeholder { color: #3a3a6a; font-family: 'Syne', sans-serif; font-size: 13px; }
        .math-inp:focus { border-color: rgba(99,102,241,0.6) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .math-inp.err { border-color: rgba(248,113,113,0.7) !important; }
        @keyframes mathSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontFamily: "'Syne', sans-serif", fontSize: 10, fontWeight: 800, color: '#6a6aaa', letterSpacing: 1.5, textTransform: 'uppercase' }}>{label}</label>
      {children}
      {hint && !error && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6366f1', background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '7px 11px' }}>{hint}</div>
      )}
      {error && <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 12, color: '#f87171', fontWeight: 600 }}>{error}</div>}
    </div>
  );
}