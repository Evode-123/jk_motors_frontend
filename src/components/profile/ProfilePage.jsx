import React, { useState } from 'react';
import {
  User, Mail, Phone, Save, Key, Loader, CheckCircle,
  Eye, EyeOff, AlertTriangle, X, Chrome, Lock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

/* ─────────────────────────────────────────────
   Typography + design tokens (matches app theme)
───────────────────────────────────────────── */
const Tp = {
  heading: { fontFamily: "'Orbitron', sans-serif", color: '#e2e8f0' },
  body:    { fontFamily: "'Space Grotesk', sans-serif", color: '#e2e8f0' },
  muted:   { fontFamily: "'Space Grotesk', sans-serif", color: '#64748b' },
  label:   {
    fontFamily: "'Space Grotesk', sans-serif", color: '#94a3b8',
    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
    display: 'block', marginBottom: 6,
  },
};

/* ─────────────────────────────────────────────
   Reusable sub-components
───────────────────────────────────────────── */
const JKCard = ({ children, style = {} }) => (
  <div style={{
    background: 'rgba(30,61,110,0.4)',
    border: '1px solid rgba(14,165,233,0.15)',
    borderRadius: 16, overflow: 'hidden', ...style,
  }}>{children}</div>
);

const JKInput = ({ icon: Icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    {Icon && (
      <Icon className="w-4 h-4" style={{
        position: 'absolute', left: 12, top: '50%',
        transform: 'translateY(-50%)', color: '#64748b', pointerEvents: 'none',
      }} />
    )}
    <input
      {...props}
      style={{
        background: props.disabled ? 'rgba(14,165,233,0.02)' : 'rgba(14,165,233,0.05)',
        border: '1px solid rgba(14,165,233,0.2)',
        color: props.disabled ? '#64748b' : '#e2e8f0',
        borderRadius: 12,
        padding: `10px ${Icon ? '16px 10px 38px' : '16px'}`,
        fontSize: 14, width: '100%',
        fontFamily: "'Space Grotesk', sans-serif",
        outline: 'none',
        cursor: props.disabled ? 'not-allowed' : 'text',
        boxSizing: 'border-box',
      }}
    />
  </div>
);

/* ─────────────────────────────────────────────
   Profile Completion Banner
   Show when user hasn't added phone number yet.
   Can be imported and placed in DashboardLayout too.
───────────────────────────────────────────── */
export function ProfileCompletionBanner({ user, onDismiss, onGoToProfile }) {
  // Only show if phone is missing
  if (!user || user.phone) return null;

  const isGoogle = user.authProvider === 'google' || user.authProvider === 'GOOGLE';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 20px',
      background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(239,68,68,0.1))',
      border: '1px solid rgba(245,158,11,0.35)',
      borderRadius: 12, marginBottom: 20,
      fontFamily: "'Space Grotesk', sans-serif",
      flexWrap: 'wrap',
    }}>
      <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b', flexShrink: 0 }} />
      <p style={{ color: '#fcd34d', fontSize: 13, margin: 0, flex: 1, minWidth: 200 }}>
        <strong>Complete your profile!</strong>{' '}
        {isGoogle
          ? 'Add your phone number so we can contact you about your service bookings.'
          : 'Add your phone number and personal details to complete your account.'}
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {onGoToProfile && (
          <button
            onClick={onGoToProfile}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'rgba(245,158,11,0.2)',
              border: '1px solid rgba(245,158,11,0.4)',
              color: '#fcd34d', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            Update Profile
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', color: '#94a3b8', padding: 4,
            }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Google badge shown on profile header
───────────────────────────────────────────── */
function GoogleBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
      background: 'rgba(59,130,246,0.12)', color: '#60a5fa',
      border: '1px solid rgba(59,130,246,0.25)',
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <Chrome style={{ width: 10, height: 10 }} /> Google Account
    </span>
  );
}

/* ─────────────────────────────────────────────
   Read-only locked field (for Google name fields)
───────────────────────────────────────────── */
function LockedField({ icon: Icon, value, label, hint }) {
  return (
    <div>
      <label style={Tp.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        {Icon && (
          <Icon className="w-4 h-4" style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: '#64748b',
          }} />
        )}
        <div style={{
          background: 'rgba(14,165,233,0.02)',
          border: '1px solid rgba(14,165,233,0.1)',
          color: '#94a3b8', borderRadius: 12,
          padding: `10px ${Icon ? '38px' : '16px'} 10px ${Icon ? '38px' : '16px'}`,
          fontSize: 14, fontFamily: "'Space Grotesk', sans-serif",
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{value || '—'}</span>
          <Lock style={{ width: 12, height: 12, color: '#475569' }} />
        </div>
      </div>
      {hint && (
        <p style={{ ...Tp.muted, fontSize: 11, marginTop: 4 }}>{hint}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main ProfilePage
───────────────────────────────────────────── */
export function ProfilePage() {
  const { user, updateUserState } = useAuth();

  // Detect provider
  const isGoogle = user?.authProvider === 'google' || user?.authProvider === 'GOOGLE';
  const isMixed  = user?.authProvider === 'mixed'  || user?.authProvider === 'MIXED';
  // Mixed = started with Google but also has a password — show password section
  const hasPassword = !isGoogle || isMixed;

  // Profile form state
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
  });
  const [saving,    setSaving]    = useState(false);
  const [saveMsg,   setSaveMsg]   = useState('');
  const [saveError, setSaveError] = useState('');

  // Password form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw,  setShowPw]  = useState({ curr: false, next: false, conf: false });
  const [pwSaving,  setPwSaving]  = useState(false);
  const [pwMsg,     setPwMsg]     = useState('');
  const [pwError,   setPwError]   = useState('');

  // Banner dismiss state
  const [bannerDismissed, setBannerDismissed] = useState(false);

  /* ── Save profile ── */
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setSaveMsg(''); setSaveError('');
    try {
      // For Google users only phone (and optional extra fields) are editable —
      // names come from Google so we don't overwrite them unless explicitly changed.
      const payload = isGoogle
        ? { firstName: user.firstName, lastName: user.lastName, phone: form.phone }
        : { firstName: form.firstName, lastName: form.lastName, phone: form.phone };

      await apiService.completeProfile(payload);
      updateUserState({ ...payload, profileCompleted: true });
      setSaveMsg('Profile updated successfully!');
      setTimeout(() => setSaveMsg(''), 4000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── Change password ── */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8)                 { setPwError('Password must be at least 8 characters.'); return; }
    setPwSaving(true); setPwMsg(''); setPwError('');
    try {
      await apiService.changePassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmPassword);
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwMsg(''), 4000);
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  };

  const initials = user?.firstName
    ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const Alert = ({ type, children }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 10,
      background: type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.2)'}`,
      color: type === 'success' ? '#6ee7b7' : '#f87171',
      fontFamily: "'Space Grotesk', sans-serif", fontSize: 13,
    }}>
      {type === 'success' && <CheckCircle className="w-4 h-4" />}
      {children}
    </div>
  );

  return (
    <div className="space-y-6" style={{ maxWidth: 640 }}>

      {/* ── Heading ── */}
      <div>
        <h1 style={{ ...Tp.heading, fontSize: 22, fontWeight: 900 }}>My Profile</h1>
        <p style={{ ...Tp.muted, fontSize: 13, marginTop: 4 }}>Manage your account information</p>
      </div>

      {/* ── Incomplete profile banner ── */}
      {!bannerDismissed && (
        <ProfileCompletionBanner
          user={user}
          onDismiss={() => setBannerDismissed(true)}
        />
      )}

      {/* ── Google account info notice ── */}
      {isGoogle && (
        <div style={{
          display: 'flex', alignItems: 'flex-start', gap: 10,
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(59,130,246,0.07)',
          border: '1px solid rgba(59,130,246,0.2)',
        }}>
          <Chrome className="w-4 h-4" style={{ color: '#60a5fa', marginTop: 2, flexShrink: 0 }} />
          <p style={{ ...Tp.body, fontSize: 13, margin: 0, color: '#93c5fd' }}>
            Your name is managed by your Google account. Only your phone number and
            other contact details can be updated here.
          </p>
        </div>
      )}

      {/* ── Profile card ── */}
      <JKCard>
        {/* Avatar + info header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(14,165,233,0.1)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: 'rgba(14,165,233,0.03)',
        }}>
          {/* Avatar: Google photo or initials */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl} alt="Profile"
              style={{
                width: 56, height: 56, borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(14,165,233,0.3)',
                flexShrink: 0,
              }}
            />
          ) : (
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Orbitron', sans-serif", fontSize: 18, fontWeight: 900,
              color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
          )}

          <div style={{ flex: 1 }}>
            <p style={{ ...Tp.body, fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'New User'}
            </p>
            <p style={{ ...Tp.muted, fontSize: 12, marginBottom: 6 }}>{user?.email}</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
                background: user?.role === 'ADMIN' ? 'rgba(239,68,68,0.12)' : 'rgba(14,165,233,0.1)',
                color: user?.role === 'ADMIN' ? '#f87171' : '#38bdf8',
                border: `1px solid ${user?.role === 'ADMIN' ? 'rgba(239,68,68,0.2)' : 'rgba(14,165,233,0.2)'}`,
              }}>
                {user?.role}
              </span>
              {isGoogle && <GoogleBadge />}
            </div>
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={handleSaveProfile} style={{
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {saveMsg   && <Alert type="success">{saveMsg}</Alert>}
          {saveError && <Alert type="error">{saveError}</Alert>}

          {/* ── Name fields: locked for Google users, editable for local ── */}
          <div className="grid grid-cols-2 gap-4">
            {isGoogle ? (
              <>
                <LockedField
                  icon={User}
                  label="First Name"
                  value={user?.firstName}
                  hint="Managed by Google"
                />
                <LockedField
                  label="Last Name"
                  value={user?.lastName}
                  hint="Managed by Google"
                />
              </>
            ) : (
              <>
                <div>
                  <label style={Tp.label}>First Name</label>
                  <JKInput
                    icon={User}
                    type="text"
                    value={form.firstName}
                    onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))}
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label style={Tp.label}>Last Name</label>
                  <JKInput
                    type="text"
                    value={form.lastName}
                    onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))}
                    placeholder="Uwimana"
                  />
                </div>
              </>
            )}
          </div>

          {/* Email — always locked */}
          <div>
            <label style={Tp.label}>Email</label>
            <JKInput icon={Mail} type="email" value={user?.email || ''} disabled />
          </div>

          {/* Phone — editable for everyone */}
          <div>
            <label style={Tp.label}>
              Phone Number
              {!user?.phone && (
                <span style={{
                  marginLeft: 6, color: '#f59e0b', fontSize: 10,
                  background: 'rgba(245,158,11,0.1)',
                  padding: '1px 6px', borderRadius: 4,
                }}>
                  Required
                </span>
              )}
            </label>
            <JKInput
              icon={Phone}
              type="tel"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
              placeholder="+250 7XX XXX XXX"
              required
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 24px', borderRadius: 12,
              background: 'linear-gradient(135deg,#0EA5E9,#6366F1)',
              border: 'none', color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              width: 'fit-content',
            }}
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </JKCard>

      {/* ── Password section — hidden for pure Google users ── */}
      {hasPassword ? (
        <JKCard>
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(14,165,233,0.1)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <Key className="w-4 h-4" style={{ color: '#64748b' }} />
            <h3 style={{ ...Tp.body, fontSize: 14, fontWeight: 600 }}>Change Password</h3>
          </div>

          <form onSubmit={handleChangePassword} style={{
            padding: '20px 24px',
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            {pwMsg   && <Alert type="success">{pwMsg}</Alert>}
            {pwError && <Alert type="error">{pwError}</Alert>}

            {[
              { key: 'currentPassword', label: 'Current Password', pKey: 'curr' },
              { key: 'newPassword',     label: 'New Password',     pKey: 'next' },
              { key: 'confirmPassword', label: 'Confirm Password', pKey: 'conf' },
            ].map(({ key, label, pKey }) => (
              <div key={key}>
                <label style={Tp.label}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw[pKey] ? 'text' : 'password'}
                    value={pwForm[key]}
                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                    placeholder="••••••••"
                    style={{
                      background: 'rgba(14,165,233,0.05)',
                      border: '1px solid rgba(14,165,233,0.2)',
                      color: '#e2e8f0', borderRadius: 12,
                      padding: '10px 44px 10px 16px', fontSize: 14, width: '100%',
                      fontFamily: "'Space Grotesk', sans-serif",
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => ({ ...p, [pKey]: !p[pKey] }))}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none',
                      cursor: 'pointer', color: '#64748b',
                    }}
                  >
                    {showPw[pKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={pwSaving}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', borderRadius: 12,
                background: 'rgba(30,61,110,0.8)',
                border: '1px solid rgba(14,165,233,0.2)',
                color: '#e2e8f0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 13, fontWeight: 600,
                cursor: pwSaving ? 'not-allowed' : 'pointer',
                opacity: pwSaving ? 0.5 : 1,
                width: 'fit-content',
              }}
            >
              {pwSaving ? <Loader className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </JKCard>
      ) : (
        /* Shown instead of password form for Google-only users */
        <JKCard>
          <div style={{
            padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Chrome className="w-5 h-5" style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p style={{ ...Tp.body, fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
                Password managed by Google
              </p>
              <p style={{ ...Tp.muted, fontSize: 12 }}>
                Your account uses Google Sign-In. To change your password, visit your
                Google Account settings at{' '}
                <a
                  href="https://myaccount.google.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#38bdf8', textDecoration: 'none' }}
                >
                  myaccount.google.com
                </a>.
              </p>
            </div>
          </div>
        </JKCard>
      )}
    </div>
  );
}

export default ProfilePage;