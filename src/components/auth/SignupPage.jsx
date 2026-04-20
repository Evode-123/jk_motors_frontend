import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirectTo = params.get('redirect') || '/dashboard';

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Please enter a password.'); return; }
    if (password.length < PASSWORD_MIN_LENGTH) { setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register({ email: email.trim(), password, confirmPassword: confirm });
      navigate(redirectTo, { replace: true });
    } catch (err) { setError(err.message || 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(56,189,248,0.2)',
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
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 65%)' }} />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-8"
        style={{
          background: 'rgba(15,38,68,0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56,189,248,0.15)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
          style={{ background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),rgba(139,92,246,0.6),transparent)' }} />

        {/* Back */}
        <Link to="/"
          className="inline-flex items-center gap-1.5 mb-5 text-sm font-medium no-underline transition-colors"
          style={{ color:'rgba(148,163,184,0.8)' }}
          onMouseEnter={e => e.currentTarget.style.color='#38bdf8'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.8)'}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'linear-gradient(135deg,rgba(14,165,233,0.25),rgba(99,102,241,0.25))',
            border: '1px solid rgba(14,165,233,0.3)',
            boxShadow: '0 0 24px rgba(14,165,233,0.15)',
          }}>
          <UserPlus className="w-5 h-5" style={{ color:'#38bdf8' }} />
        </div>

        {/* Heading */}
        <div className="text-center mb-5">
          <h2 className="text-xl font-bold mb-1" style={{ color:'#f1f5f9' }}>Create account</h2>
          <p className="text-sm" style={{ color:'rgba(148,163,184,0.7)' }}>Email and password only — quick &amp; free</p>
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
              style={inputStyle}
              autoComplete="email"
              required
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
              style={inputStyle}
              autoComplete="new-password"
              required
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

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:'#38bdf8' }} />
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              className="auth-input w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
              style={inputStyle}
              autoComplete="new-password"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConf(!showConf)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color:'rgba(148,163,184,0.6)', background:'transparent', border:'none', cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color='#38bdf8'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(148,163,184,0.6)'}
            >
              {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password hint */}
          <p className="text-xs pt-0.5" style={{ color:'rgba(148,163,184,0.55)' }}>
            Min {PASSWORD_MIN_LENGTH} chars · uppercase · number · symbol
          </p>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border-none cursor-pointer mt-1"
            style={{
              background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 animate-spin"
                  style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'white' }} />
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center mt-5 text-sm" style={{ color:'rgba(148,163,184,0.6)' }}>
          Already have an account?{' '}
          <Link
            to={`/login${location.search}`}
            className="font-semibold no-underline transition-colors"
            style={{ color:'#38bdf8' }}
            onMouseEnter={e => e.currentTarget.style.color='#7dd3fc'}
            onMouseLeave={e => e.currentTarget.style.color='#38bdf8'}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
