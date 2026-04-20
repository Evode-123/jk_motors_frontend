import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowLeft, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GOOGLE_CLIENT_ID } from '../../utils/constants';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
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
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#1a2d4a 0%,#1e3557 35%,#1a3d66 65%,#0f2644 100%)' }}
    >
      <style>{`
        .auth-input::placeholder { color: rgba(148,163,184,0.7) !important; opacity: 1; }
        .auth-input::-webkit-input-placeholder { color: rgba(148,163,184,0.7) !important; }
        .auth-input::-moz-placeholder { color: rgba(148,163,184,0.7) !important; opacity: 1; }
        .auth-input { color: #f1f5f9 !important; }
        .auth-input:focus { outline: none; border-color: rgba(14,165,233,0.6) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.12) !important; }
      `}</style>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage:'linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px)', backgroundSize:'40px 40px' }} />

      {/* Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(14,165,233,0.15) 0%,transparent 65%)' }} />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(99,102,241,0.15) 0%,transparent 65%)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-7"
        style={{
          background: 'rgba(15,38,68,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56,189,248,0.15)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top glow line */}
        <div className="absolute top-0 left-5 right-5 h-px rounded-full pointer-events-none"
          style={{ background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),rgba(139,92,246,0.6),transparent)' }} />

        {/* Back */}
        <Link to="/"
          className="inline-flex items-center gap-1.5 mb-6 text-sm font-medium no-underline transition-colors"
          style={{ color: 'rgba(148,163,184,0.8)' }}
          onMouseEnter={e => e.currentTarget.style.color='#38bdf8'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.8)'}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Icon + title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background:'linear-gradient(135deg,rgba(14,165,233,0.25),rgba(99,102,241,0.25))', border:'1px solid rgba(14,165,233,0.3)' }}>
            <LogIn className="w-5 h-5" style={{ color:'#38bdf8' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-none mb-1" style={{ color:'#f1f5f9' }}>Welcome back</h2>
            <p className="text-sm" style={{ color:'rgba(148,163,184,0.7)' }}>Sign in to JK Motors</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm border"
            style={{ background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.3)', color:'#fca5a5' }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:'#38bdf8' }} />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              className="auth-input w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(56,189,248,0.2)' }}
              autoComplete="email"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:'#38bdf8' }} />
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              className="auth-input w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(56,189,248,0.2)' }}
              autoComplete="current-password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color:'rgba(148,163,184,0.6)', background:'transparent', border:'none', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color='#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.6)'}
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <Link to="/forgot-password"
              className="text-xs font-medium no-underline transition-colors"
              style={{ color:'#38bdf8' }}
              onMouseEnter={e => e.currentTarget.style.color='#7dd3fc'}
              onMouseLeave={e => e.currentTarget.style.color='#38bdf8'}
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border-none cursor-pointer"
            style={{
              background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-white animate-spin"
                  style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
          <span className="text-xs" style={{ color:'rgba(148,163,184,0.5)' }}>or</span>
          <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.1)' }} />
        </div>

        {/* Google */}
        {GOOGLE_CLIENT_ID && (
          gLoading ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm"
              style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(148,163,184,0.7)' }}>
              <div className="w-4 h-4 rounded-full border-2 animate-spin"
                style={{ borderColor:'rgba(255,255,255,0.2)', borderTopColor:'white' }} />
              Signing in with Google...
            </div>
          ) : (
            <div className="flex justify-center" id="g-btn" />
          )
        )}

        {/* Footer */}
        <p className="text-center mt-5 text-sm" style={{ color:'rgba(148,163,184,0.6)' }}>
          No account?{' '}
          <Link to={`/signup${location.search}`}
            className="font-semibold no-underline transition-colors"
            style={{ color:'#38bdf8' }}
            onMouseEnter={e => e.currentTarget.style.color='#7dd3fc'}
            onMouseLeave={e => e.currentTarget.style.color='#38bdf8'}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;