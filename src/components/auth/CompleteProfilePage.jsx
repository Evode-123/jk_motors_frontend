import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

const CompleteProfilePage = () => {
  const { updateUserState } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await apiService.completeProfile(formData);
      updateUserState({
        profileCompleted: true,
        firstName: res.user?.firstName || formData.firstName,
        lastName:  res.user?.lastName  || formData.lastName,
        phone:     res.user?.phone     || formData.phone,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4"
      style={{ background: 'linear-gradient(160deg,#1a2d4a 0%,#1e3557 35%,#1a3d66 65%,#0f2644 100%)' }}
    >
      <style>{`
        .auth-input::placeholder { color: rgba(148,163,184,0.55) !important; opacity: 1; }
        .auth-input { color: #f1f5f9 !important; }
        .auth-input:focus { outline: none; border-color: rgba(14,165,233,0.6) !important; box-shadow: 0 0 0 3px rgba(14,165,233,0.12) !important; }
      `}</style>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(14,165,233,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(14,165,233,0.06) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(14,165,233,0.12) 0%,transparent 65%)' }} />
      <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.14) 0%,transparent 65%)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl p-7"
        style={{
          background: 'rgba(15,38,68,0.88)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(56,189,248,0.15)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}
      >
        {/* Top glow line */}
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
            <User className="w-5 h-5" style={{ color: '#38bdf8' }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: '#f1f5f9' }}>Complete your profile</h2>
          <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.65)' }}>Please provide your details to continue</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg text-sm border"
            style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="Enter your first name"
              required
              className="auth-input w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(56,189,248,0.2)' }}
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Enter your last name"
              required
              className="auth-input w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(56,189,248,0.2)' }}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: 'rgba(148,163,184,0.8)' }}>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+250 XXX XXX XXX"
              className="auth-input w-full px-4 py-3 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(255,255,255,0.055)', border: '1px solid rgba(56,189,248,0.2)' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border-none cursor-pointer transition-all"
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
                  style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
                Saving...
              </>
            ) : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfilePage;
