// ════════════════════════════════════════════════════
// ProfilePage.jsx — Gold/Dark Royal Crest Theme
// ════════════════════════════════════════════════════
import React, { useState } from 'react';
import { User, Mail, Phone, Save, Key, Loader, CheckCircle, Eye, EyeOff, AlertTriangle, X, Chrome, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';

const G = { gold:'#C9A84C', goldDim:'rgba(201,168,76,0.18)', goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)', surface:'rgba(28,22,9,0.6)' };
const FONT  = { fontFamily:"'DM Sans', sans-serif" };
const SERIF = { fontFamily:"'Playfair Display', serif" };
const Tp = {
  label: { fontFamily:"'DM Sans',sans-serif", color:'rgba(168,136,72,0.75)', fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 },
};

const JKCard = ({ children, style={} }) => (
  <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:16, overflow:'hidden', ...style }}>{children}</div>
);

const JKInput = ({ icon:Icon, ...props }) => (
  <div style={{ position:'relative' }}>
    {Icon && <Icon className="w-4 h-4" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:G.textMuted, pointerEvents:'none' }} />}
    <input {...props} style={{ background:props.disabled?'rgba(20,16,8,0.4)':'rgba(20,16,8,0.8)', border:`1px solid ${G.goldDim}`, color:props.disabled?G.textMuted:G.textPrimary, borderRadius:12, padding:`10px ${Icon?'16px 10px 38px':'16px'}`, fontSize:14, width:'100%', ...FONT, outline:'none', cursor:props.disabled?'not-allowed':'text', boxSizing:'border-box' }} />
  </div>
);

function LockedField({ icon:Icon, value, label, hint }) {
  return (
    <div>
      <label style={Tp.label}>{label}</label>
      <div style={{ position:'relative' }}>
        {Icon && <Icon className="w-4 h-4" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:G.textMuted }} />}
        <div style={{ background:'rgba(20,16,8,0.4)', border:`1px solid rgba(201,168,76,0.1)`, color:G.textMuted, borderRadius:12, padding:`10px ${Icon?'38px':'16px'} 10px ${Icon?'38px':'16px'}`, fontSize:14, ...FONT, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>{value||'—'}</span><Lock style={{ width:12, height:12, color:G.textMuted }} />
        </div>
      </div>
      {hint && <p style={{ ...FONT, fontSize:11, color:G.textMuted, marginTop:4 }}>{hint}</p>}
    </div>
  );
}

export function ProfileCompletionBanner({ user, onDismiss, onGoToProfile }) {
  if (!user || user.phone) return null;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', background:'rgba(201,168,76,0.08)', border:`1px solid rgba(201,168,76,0.3)`, borderRadius:12, marginBottom:20, ...FONT, flexWrap:'wrap' }}>
      <AlertTriangle className="w-4 h-4" style={{ color:G.gold, flexShrink:0 }} />
      <p style={{ color:G.textPrimary, fontSize:13, margin:0, flex:1, minWidth:200 }}>
        <strong>Complete your profile!</strong> Add your phone number so we can contact you about your service bookings.
      </p>
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        {onGoToProfile && <button onClick={onGoToProfile} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(201,168,76,0.15)', border:`1px solid rgba(201,168,76,0.35)`, color:G.gold, fontSize:12, fontWeight:600, cursor:'pointer', ...FONT }}>Update Profile</button>}
        {onDismiss && <button onClick={onDismiss} style={{ background:'none', border:'none', cursor:'pointer', color:G.textMuted, padding:4 }}><X className="w-4 h-4" /></button>}
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateUserState } = useAuth();
  const isGoogle = user?.authProvider === 'google' || user?.authProvider === 'GOOGLE';
  const isMixed  = user?.authProvider === 'mixed'  || user?.authProvider === 'MIXED';
  const hasPassword = !isGoogle || isMixed;

  const [form,setForm]=useState({ firstName:user?.firstName||'', lastName:user?.lastName||'', phone:user?.phone||'' });
  const [saving,setSaving]=useState(false);
  const [saveMsg,setSaveMsg]=useState('');
  const [saveError,setSaveError]=useState('');
  const [pwForm,setPwForm]=useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showPw,setShowPw]=useState({ curr:false, next:false, conf:false });
  const [pwSaving,setPwSaving]=useState(false);
  const [pwMsg,setPwMsg]=useState('');
  const [pwError,setPwError]=useState('');
  const [bannerDismissed,setBannerDismissed]=useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setSaving(true); setSaveMsg(''); setSaveError('');
    try {
      const payload = isGoogle ? { firstName:user.firstName, lastName:user.lastName, phone:form.phone } : { firstName:form.firstName, lastName:form.lastName, phone:form.phone };
      await apiService.completeProfile(payload);
      updateUserState({ ...payload, profileCompleted:true });
      setSaveMsg('Profile updated successfully!'); setTimeout(() => setSaveMsg(''), 4000);
    } catch(err) { setSaveError(err.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match.'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
    setPwSaving(true); setPwMsg(''); setPwError('');
    try {
      await apiService.changePassword(pwForm.currentPassword, pwForm.newPassword, pwForm.confirmPassword);
      setPwMsg('Password changed successfully!'); setPwForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); setTimeout(() => setPwMsg(''), 4000);
    } catch(err) { setPwError(err.message); }
    finally { setPwSaving(false); }
  };

  const initials = user?.firstName ? `${user.firstName.charAt(0)}${user.lastName?.charAt(0)||''}`.toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';

  const Alert = ({ type, children }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', borderRadius:10, background:type==='success'?'rgba(34,120,80,0.12)':'rgba(180,60,40,0.1)', border:`1px solid ${type==='success'?'rgba(34,120,80,0.25)':'rgba(180,60,40,0.2)'}`, color:type==='success'?'#6ee7b7':'#f87171', ...FONT, fontSize:13 }}>
      {type==='success' && <CheckCircle className="w-4 h-4" />}{children}
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20, maxWidth:640 }}>
      <div>
        <h1 style={{ ...SERIF, fontSize:22, fontWeight:700, color:G.textPrimary }}>My Profile</h1>
        <p style={{ ...FONT, fontSize:13, color:G.textMuted, marginTop:4 }}>Manage your account information</p>
      </div>

      {!bannerDismissed && <ProfileCompletionBanner user={user} onDismiss={() => setBannerDismissed(true)} />}

      {isGoogle && (
        <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px', borderRadius:12, background:'rgba(201,168,76,0.06)', border:`1px solid rgba(201,168,76,0.2)` }}>
          <Chrome className="w-4 h-4" style={{ color:G.gold, marginTop:2, flexShrink:0 }} />
          <p style={{ ...FONT, fontSize:13, margin:0, color:G.textPrimary }}>Your name is managed by your Google account. Only your phone number can be updated here.</p>
        </div>
      )}

      <JKCard>
        <div style={{ padding:'20px 24px', borderBottom:`1px solid ${G.border}`, display:'flex', alignItems:'center', gap:16, background:G.goldDimmer }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt="Profile" style={{ width:56, height:56, borderRadius:'50%', objectFit:'cover', border:`2px solid ${G.goldDim}`, flexShrink:0 }} />
          ) : (
            <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg,#8B6914,#C9A84C)', display:'flex', alignItems:'center', justifyContent:'center', ...SERIF, fontSize:18, fontWeight:700, color:'#1C1609', flexShrink:0 }}>
              {initials}
            </div>
          )}
          <div style={{ flex:1 }}>
            <p style={{ ...FONT, fontSize:16, fontWeight:600, color:G.textPrimary, marginBottom:2 }}>{user?.firstName&&user?.lastName?`${user.firstName} ${user.lastName}`:'New User'}</p>
            <p style={{ ...FONT, fontSize:12, color:G.textMuted, marginBottom:6 }}>{user?.email}</p>
            <span style={{ padding:'2px 10px', borderRadius:20, fontSize:10, fontWeight:600, background:user?.role==='ADMIN'?'rgba(180,60,40,0.12)':'rgba(201,168,76,0.12)', color:user?.role==='ADMIN'?'#f87171':G.gold, border:`1px solid ${user?.role==='ADMIN'?'rgba(180,60,40,0.2)':G.goldDim}` }}>{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {saveMsg   && <Alert type="success">{saveMsg}</Alert>}
          {saveError && <Alert type="error">{saveError}</Alert>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {isGoogle ? (
              <>
                <LockedField icon={User} label="First Name" value={user?.firstName} hint="Managed by Google" />
                <LockedField label="Last Name" value={user?.lastName} hint="Managed by Google" />
              </>
            ) : (
              <>
                <div><label style={Tp.label}>First Name</label><JKInput icon={User} type="text" value={form.firstName} onChange={e=>setForm(p=>({...p,firstName:e.target.value}))} placeholder="Jean" /></div>
                <div><label style={Tp.label}>Last Name</label><JKInput type="text" value={form.lastName} onChange={e=>setForm(p=>({...p,lastName:e.target.value}))} placeholder="Uwimana" /></div>
              </>
            )}
          </div>
          <div><label style={Tp.label}>Email</label><JKInput icon={Mail} type="email" value={user?.email||''} disabled /></div>
          <div>
            <label style={Tp.label}>Phone Number{!user?.phone && <span style={{ marginLeft:6, color:G.gold, fontSize:10, background:'rgba(201,168,76,0.1)', padding:'1px 6px', borderRadius:4 }}>Required</span>}</label>
            <JKInput icon={Phone} type="tel" value={form.phone} onChange={e=>setForm(p=>({...p,phone:e.target.value}))} placeholder="+250 7XX XXX XXX" required />
          </div>
          <button type="submit" disabled={saving}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#8B6914,#C9A84C)', border:'none', color:'#1C1609', ...FONT, fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', opacity:saving?0.5:1, width:'fit-content' }}>
            {saving?<Loader className="w-4 h-4 animate-spin"/>:<Save className="w-4 h-4"/>}
            {saving?'Saving...':'Save Changes'}
          </button>
        </form>
      </JKCard>

      {hasPassword ? (
        <JKCard>
          <div style={{ padding:'16px 24px', borderBottom:`1px solid ${G.border}`, display:'flex', alignItems:'center', gap:8 }}>
            <Key className="w-4 h-4" style={{ color:G.textMuted }} />
            <h3 style={{ ...FONT, fontSize:14, fontWeight:600, color:G.textPrimary }}>Change Password</h3>
          </div>
          <form onSubmit={handleChangePassword} style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
            {pwMsg   && <Alert type="success">{pwMsg}</Alert>}
            {pwError && <Alert type="error">{pwError}</Alert>}
            {[{ key:'currentPassword', label:'Current Password', pKey:'curr' }, { key:'newPassword', label:'New Password', pKey:'next' }, { key:'confirmPassword', label:'Confirm Password', pKey:'conf' }].map(({ key, label, pKey }) => (
              <div key={key}>
                <label style={Tp.label}>{label}</label>
                <div style={{ position:'relative' }}>
                  <input type={showPw[pKey]?'text':'password'} value={pwForm[key]} onChange={e=>setPwForm(p=>({...p,[key]:e.target.value}))} placeholder="••••••••"
                    style={{ background:'rgba(20,16,8,0.8)', border:`1px solid ${G.goldDim}`, color:G.textPrimary, borderRadius:12, padding:'10px 44px 10px 16px', fontSize:14, width:'100%', ...FONT, outline:'none', boxSizing:'border-box' }} />
                  <button type="button" onClick={() => setShowPw(p=>({...p,[pKey]:!p[pKey]}))} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:G.textMuted }}>
                    {showPw[pKey]?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
            ))}
            <button type="submit" disabled={pwSaving}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 24px', borderRadius:12, background:G.goldDimmer, border:`1px solid ${G.border}`, color:G.textPrimary, ...FONT, fontSize:13, fontWeight:600, cursor:pwSaving?'not-allowed':'pointer', opacity:pwSaving?0.5:1, width:'fit-content' }}>
              {pwSaving?<Loader className="w-4 h-4 animate-spin"/>:<Key className="w-4 h-4"/>}
              {pwSaving?'Changing...':'Change Password'}
            </button>
          </form>
        </JKCard>
      ) : (
        <JKCard>
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:'rgba(201,168,76,0.1)', border:`1px solid ${G.goldDim}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Chrome className="w-5 h-5" style={{ color:G.gold }} />
            </div>
            <div>
              <p style={{ ...FONT, fontSize:14, fontWeight:600, color:G.textPrimary, marginBottom:2 }}>Password managed by Google</p>
              <p style={{ ...FONT, fontSize:12, color:G.textMuted }}>To change your password, visit <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" style={{ color:G.gold, textDecoration:'none' }}>myaccount.google.com</a>.</p>
            </div>
          </div>
        </JKCard>
      )}
    </div>
  );
}

export default ProfilePage;