import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData]                       = useState({ newPassword: '', confirmPassword: '' });
  const [showNewPassword, setShowNewPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.newPassword !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.newPassword.length < PASSWORD_MIN_LENGTH)
      { setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`); return; }
    if (!token) { setError('Invalid or missing reset token.'); return; }

    setLoading(true);
    try {
      await apiService.resetPassword(token, formData.newPassword, formData.confirmPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const sharedCardStyle = {
    background: 'rgba(15,38,68,0.88)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(56,189,248,0.15)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
  };

  const pageWrapper = (children) => (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: 'linear-gradient(160deg,#1a2d4a 0%,#1e3557 35%,#1a3d66 65%,#0f2644 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(14,165,233,0.14) 0%,transparent 65%)' }} />
      <div className="absolute -bottom-16 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)' }} />
      {children}
    </div>
  );

  if (success) {
    return pageWrapper(
      <div className="relative z-10 w-full max-w-sm rounded-2xl p-8 text-center" style={sharedCardStyle}>
        <div className="absolute top-0 left-5 right-5 h-px rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),rgba(139,92,246,0.6),transparent)' }} />
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}
        >
          <CheckCircle className="w-7 h-7" style={{ color: '#4ade80' }} />
        </div>
        <h2 className="text-lg font-bold mb-2" style={{ color: '#f1f5f9' }}>Password reset successfully!</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(148,163,184,0.65)' }}>You can now sign in with your new password.</p>
        <div className="text-xs mb-5" style={{ color: 'rgba(148,163,184,0.45)' }}>Redirecting to login...</div>
        <button
          onClick={() => navigate('/login', { replace: true })}
          className="w-full py-3 rounded-xl font-semibold text-sm border-none cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)', color: '#ffffff', boxShadow: '0 4px 20px rgba(14,165,233,0.35)' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return pageWrapper(
    <>
      <style>{`
        .auth-input::placeholder { color: rgba(148,163,184,0.55) !important; opacity: 1; }
        .auth-input { color: #f1f5f9 !important; }
        .auth-input:focus { outline: none; border-color: rgba(14,165,233,0.6) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.12) !important; }
      `}</style>
      <div className="relative z-10 w-full max-w-sm rounded-2xl p-7" style={sharedCardStyle}>
        <div className="absolute top-0 left-5 right-5 h-px rounded-full pointer-events-none"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),rgba(139,92,246,0.6),transparent)' }} />

        {/* Icon + Title */}
        <div className="flex flex-col items-center text-center mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(135deg,rgba(14,165,233,0.22),rgba(99,102,241,0.22))',
              border: '1px solid rgba(14,165,233,0.28)',
              boxShadow: '0 0 20px rgba(14,165,233,0.12)',
            }}
          >
            <Lock className="w-5 h-5" style={{ color: '#38bdf8' }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>Reset your password</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.65)' }}>Enter your new password below</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm border"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}
        {!token && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm border"
            style={{ background: 'rgba(234,179,8,0.1)', borderColor: 'rgba(234,179,8,0.3)', color: '#fde047' }}>
            ⚠️ No reset token found. Please use the link from your email.{' '}
            <Link to="/forgot-password" style={{ color: '#38bdf8', textDecoration: 'underline' }}>Request a new link</Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>New Password</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#38bdf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
                className="auth-input w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(56,189,248,0.2)' }}
              />
              <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(148,163,184,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.45)' }}>
              Min {PASSWORD_MIN_LENGTH} chars · uppercase · number · special char
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>Confirm New Password</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#38bdf8' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
                className="auth-input w-full pl-10 pr-10 py-3 rounded-xl text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(56,189,248,0.2)' }}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'rgba(148,163,184,0.5)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.5)'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-all"
            style={{
              background: loading ? 'rgba(14,165,233,0.5)' : 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(14,165,233,0.35)',
              opacity: loading || !token ? 0.6 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-t-white animate-spin"
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Resetting...
              </>
            ) : 'Reset Password'}
          </button>
        </form>
      </div>
    </>
  );
};

export default ResetPasswordPage;
