import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';

const G = {
  gold:       '#C9A84C',
  goldLight:  '#E8C96A',
  goldDim:    'rgba(201,168,76,0.22)',
  goldDimmer: 'rgba(201,168,76,0.09)',
  textPrimary:'#F5E4B8',
  textMuted:  'rgba(168,136,72,0.75)',
  border:     'rgba(201,168,76,0.2)',
  bg:         '#0A0804',
};

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const init = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
      window.google.accounts.id.renderButton(
        document.getElementById('g-btn'),
        { theme: 'outline', size: 'large', shape: 'rectangular', width: 304 }
      );
    };
    const existing = document.getElementById('gsi-script');
    if (existing) { init(); return; }
    const s = document.createElement('script');
    s.id = 'gsi-script'; s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true; s.onload = init;
    document.body.appendChild(s);
  }, []);

  const handleGoogleCredential = async (res) => {
    if (!res?.credential) { setError('Google Sign-In failed.'); return; }
    setGLoading(true); setError('');
    try { await googleLogin(res.credential); navigate(redirectTo, { replace: true }); }
    catch (err) { setError(err.message || 'Google Sign-In failed.'); }
    finally { setGLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password)     { setError('Please enter your password.'); return; }
    setLoading(true);
    try { await login(email.trim(), password); navigate(redirectTo, { replace: true }); }
    catch (err) { setError(err.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden', padding: 16,
      background: 'linear-gradient(160deg,#1C1609 0%,#100D05 40%,#1C1609 70%,#0A0804 100%)',
    }}>
      <style>{`
        .gold-input::placeholder { color: rgba(168,136,72,0.45) !important; opacity: 1; }
        .gold-input { color: #F5E4B8 !important; }
        .gold-input:focus { outline: none !important; border-color: rgba(201,168,76,0.55) !important; box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important; }
        @keyframes jk-spin { to { transform: rotate(360deg); } }
        @keyframes gold-pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
      `}</style>

      {/* Gold grid pattern */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)',
        backgroundSize: '48px 48px' }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, left: -80, width: 320, height: 320, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(201,168,76,0.1) 0%,transparent 65%)', filter: 'blur(32px)' }} />
      <div style={{ position: 'absolute', bottom: -60, right: -60, width: 280, height: 280, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(139,105,20,0.12) 0%,transparent 65%)', filter: 'blur(32px)' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 380,
        borderRadius: 24, padding: '32px 28px',
        background: 'rgba(20,16,8,0.92)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${G.goldDim}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.05) inset',
      }}>
        {/* Top gold accent line */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
          background: `linear-gradient(90deg,transparent,${G.gold},transparent)`, borderRadius: 2 }} />

        {/* Logo / Back */}
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28,
          fontSize: 13, fontWeight: 500, textDecoration: 'none',
          color: G.textMuted, fontFamily: "'DM Sans', sans-serif",
          transition: 'color 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.textMuted}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Home
        </Link>

        {/* Icon + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,105,20,0.25))',
            border: `1px solid ${G.goldDim}`,
            boxShadow: '0 0 20px rgba(201,168,76,0.1)',
          }}>
            <LogIn style={{ width: 20, height: 20, color: G.gold }} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: G.textPrimary, margin: 0, lineHeight: 1.1 }}>
              Welcome back
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: G.textMuted, marginTop: 4 }}>
              Sign in to JK Motors
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 10, fontSize: 13,
            background: 'rgba(180,60,40,0.12)', border: '1px solid rgba(180,60,40,0.3)', color: '#f87171',
            fontFamily: "'DM Sans', sans-serif" }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: G.gold, pointerEvents: 'none' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className="gold-input"
              style={{ width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 14,
                background: 'rgba(20,16,8,0.8)', border: `1px solid ${G.border}`, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: G.gold, pointerEvents: 'none' }} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="gold-input"
              style={{ width: '100%', paddingLeft: 40, paddingRight: 44, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 14,
                background: 'rgba(20,16,8,0.8)', border: `1px solid ${G.border}`, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
              autoComplete="current-password"
              disabled={loading}
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: G.textMuted, padding: 0 }}
              onMouseEnter={e => e.currentTarget.style.color = G.gold}
              onMouseLeave={e => e.currentTarget.style.color = G.textMuted}
            >
              {showPass ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
            </button>
          </div>

          {/* Forgot */}
          <div style={{ textAlign: 'right', marginTop: -4 }}>
            <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 500, textDecoration: 'none', color: G.gold, fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={e => e.currentTarget.style.color = G.goldLight}
              onMouseLeave={e => e.currentTarget.style.color = G.gold}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#8B6914,#C9A84C)',
              color: '#1C1609', opacity: loading ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(28,22,9,0.3)', borderTopColor: '#1C1609', animation: 'jk-spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }} />
          <span style={{ fontSize: 12, color: G.textMuted, fontFamily: "'DM Sans', sans-serif" }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }} />
        </div>

        {/* Google */}
        {GOOGLE_CLIENT_ID && (
          gLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 12, fontSize: 13,
              background: G.goldDimmer, border: `1px solid ${G.border}`, color: G.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${G.goldDim}`, borderTopColor: G.gold, animation: 'jk-spin 0.8s linear infinite' }} />
              Signing in with Google...
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }} id="g-btn" />
          )
        )}

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: G.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
          No account?{' '}
          <Link to={`/signup${location.search}`} style={{ fontWeight: 600, textDecoration: 'none', color: G.gold }}
            onMouseEnter={e => e.currentTarget.style.color = G.goldLight}
            onMouseLeave={e => e.currentTarget.style.color = G.gold}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;