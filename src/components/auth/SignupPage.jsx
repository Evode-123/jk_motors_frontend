import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';

const G = {
  gold:       '#C9A84C',
  goldLight:  '#E8C96A',
  goldDim:    'rgba(201,168,76,0.22)',
  goldDimmer: 'rgba(201,168,76,0.09)',
  textPrimary:'#F5E4B8',
  textMuted:  'rgba(168,136,72,0.75)',
  border:     'rgba(201,168,76,0.2)',
};

const SignupPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
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

  const InputField = ({ icon: Icon, type, placeholder, value, onChange, showToggle, shown, onToggle, autoComplete }) => (
    <div style={{ position: 'relative' }}>
      <Icon style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: G.gold, pointerEvents: 'none' }} />
      <input
        type={showToggle ? (shown ? 'text' : 'password') : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="gold-input"
        style={{ width: '100%', paddingLeft: 40, paddingRight: showToggle ? 44 : 16, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 14,
          background: 'rgba(20,16,8,0.8)', border: `1px solid ${G.border}`, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
        autoComplete={autoComplete}
        required
        disabled={loading}
      />
      {showToggle && (
        <button type="button" onClick={onToggle}
          style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: G.textMuted, padding: 0 }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.textMuted}
        >
          {shown ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
        </button>
      )}
    </div>
  );

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
      `}</style>

      {/* Gold grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)',
        backgroundSize: '48px 48px' }} />

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: -80, right: -80, width: 360, height: 360, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(201,168,76,0.09) 0%,transparent 65%)', filter: 'blur(32px)' }} />
      <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle,rgba(139,105,20,0.1) 0%,transparent 65%)', filter: 'blur(32px)' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 380,
        borderRadius: 24, padding: '32px 28px',
        background: 'rgba(20,16,8,0.92)',
        backdropFilter: 'blur(24px)',
        border: `1px solid ${G.goldDim}`,
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Top gold line */}
        <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2,
          background: `linear-gradient(90deg,transparent,${G.gold},transparent)`, borderRadius: 2 }} />

        {/* Back */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24,
          fontSize: 13, fontWeight: 500, textDecoration: 'none', color: G.textMuted, fontFamily: "'DM Sans', sans-serif" }}
          onMouseEnter={e => e.currentTarget.style.color = G.gold}
          onMouseLeave={e => e.currentTarget.style.color = G.textMuted}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Home
        </Link>

        {/* Icon */}
        <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,105,20,0.25))',
          border: `1px solid ${G.goldDim}`, boxShadow: '0 0 24px rgba(201,168,76,0.1)' }}>
          <UserPlus style={{ width: 20, height: 20, color: G.gold }} />
        </div>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: G.textPrimary, margin: '0 0 6px' }}>
            Create account
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: G.textMuted }}>
            Email and password only — quick &amp; free
          </p>
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
          <InputField icon={Mail}  type="email"    placeholder="Email address"    value={email}    onChange={e => { setEmail(e.target.value); setError(''); }}    autoComplete="email" />
          <InputField icon={Lock}  type="password" placeholder="Password"         value={password} onChange={e => { setPassword(e.target.value); setError(''); }} autoComplete="new-password" showToggle shown={showPass} onToggle={() => setShowPass(!showPass)} />
          <InputField icon={Lock}  type="password" placeholder="Confirm password" value={confirm}  onChange={e => { setConfirm(e.target.value); setError(''); }}  autoComplete="new-password" showToggle shown={showConf} onToggle={() => setShowConf(!showConf)} />

          <p style={{ fontSize: 11, color: G.textMuted, fontFamily: "'DM Sans', sans-serif", marginTop: -4 }}>
            Min {PASSWORD_MIN_LENGTH} chars · uppercase · number · symbol
          </p>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: 12, fontWeight: 700, fontSize: 14, marginTop: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg,#8B6914,#C9A84C)',
              color: '#1C1609', opacity: loading ? 0.7 : 1,
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(28,22,9,0.3)', borderTopColor: '#1C1609', animation: 'jk-spin 0.8s linear infinite' }} />
                Creating account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: G.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
          Already have an account?{' '}
          <Link to={`/login${location.search}`} style={{ fontWeight: 600, textDecoration: 'none', color: G.gold }}
            onMouseEnter={e => e.currentTarget.style.color = G.goldLight}
            onMouseLeave={e => e.currentTarget.style.color = G.gold}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;