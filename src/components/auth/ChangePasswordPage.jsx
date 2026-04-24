import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
import { PASSWORD_MIN_LENGTH } from '../../utils/constants';
 
const G = {
  gold:'#C9A84C', goldLight:'#E8C96A', goldDim:'rgba(201,168,76,0.22)',
  goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8',
  textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.2)',
};
 
const PageShell = ({ children }) => (
  <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:16, background:'linear-gradient(160deg,#1C1609 0%,#100D05 40%,#1C1609 70%,#0A0804 100%)' }}>
    <style>{`.gold-input::placeholder{color:rgba(168,136,72,0.45)!important;opacity:1}.gold-input{color:#F5E4B8!important}.gold-input:focus{outline:none!important;border-color:rgba(201,168,76,0.55)!important;box-shadow:0 0 0 3px rgba(201,168,76,0.1)!important}@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
    <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(201,168,76,0.09) 0%,transparent 65%)', filter:'blur(32px)' }} />
    <div style={{ position:'absolute', bottom:-60, right:-60, width:280, height:280, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(139,105,20,0.1) 0%,transparent 65%)', filter:'blur(32px)' }} />
    {children}
  </div>
);
 
const Card = ({ children }) => (
  <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:380, borderRadius:24, padding:'32px 28px', background:'rgba(20,16,8,0.92)', backdropFilter:'blur(24px)', border:`1px solid ${G.goldDim}`, boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
    <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:`linear-gradient(90deg,transparent,${G.gold},transparent)`, borderRadius:2 }} />
    {children}
  </div>
);
 
const PasswordField = ({ label, value, onChange, show, onToggle, placeholder, hint }) => (
  <div>
    <label style={{ fontFamily:"'DM Sans',sans-serif", color:G.textMuted, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>{label}</label>
    <div style={{ position:'relative' }}>
      <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:G.gold, pointerEvents:'none' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
      <input type={show?'text':'password'} value={value} onChange={onChange} placeholder={placeholder} required className="gold-input"
        style={{ width:'100%', paddingLeft:40, paddingRight:44, paddingTop:12, paddingBottom:12, borderRadius:12, fontSize:14, background:'rgba(20,16,8,0.8)', border:`1px solid ${G.border}`, fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' }} />
      <button type="button" onClick={onToggle}
        style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:G.textMuted, padding:0 }}
        onMouseEnter={e=>e.currentTarget.style.color=G.gold}
        onMouseLeave={e=>e.currentTarget.style.color=G.textMuted}
      >
        {show ? <EyeOff style={{width:16,height:16}} /> : <Eye style={{width:16,height:16}} />}
      </button>
    </div>
    {hint && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:G.textMuted, marginTop:4 }}>{hint}</p>}
  </div>
);
 
const ChangePasswordPage = () => {
  const { updateUserState, handleTokenRefresh } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData]   = useState({ newPassword:'', confirmPassword:'' });
  const [showNew,  setShowNew]    = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [error,    setError]      = useState('');
  const [loading,  setLoading]    = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (formData.newPassword !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.newPassword.length < PASSWORD_MIN_LENGTH) { setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`); return; }
    setLoading(true);
    try {
      const res = await apiService.initialChangePassword(formData.newPassword, formData.confirmPassword);
      handleTokenRefresh(
        { accessToken:res.accessToken, refreshToken:res.refreshToken },
        { ...res.user, mustChangePassword:false }
      );
      navigate('/dashboard', { replace:true });
    } catch (err) { setError(err.message || 'Failed to change password.'); }
    finally { setLoading(false); }
  };
 
  return (
    <PageShell>
      <Card>
        {/* Icon + Title */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:28 }}>
          <div style={{ width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, background:'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,105,20,0.25))', border:`1px solid ${G.goldDim}` }}>
            <Shield style={{ width:20, height:20, color:G.gold }} />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:G.textPrimary, margin:'0 0 6px' }}>Change your password</h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.textMuted }}>Set a new password before continuing</p>
        </div>
 
        {error && (
          <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:10, fontSize:13, background:'rgba(180,60,40,0.12)', border:'1px solid rgba(180,60,40,0.3)', color:'#f87171', fontFamily:"'DM Sans',sans-serif" }}>{error}</div>
        )}
 
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <PasswordField
            label="New Password"
            value={formData.newPassword}
            onChange={e=>setFormData({...formData,newPassword:e.target.value})}
            show={showNew} onToggle={()=>setShowNew(!showNew)}
            placeholder="Enter new password"
            hint={`Min ${PASSWORD_MIN_LENGTH} chars · uppercase · lowercase · number · special char`}
          />
          <PasswordField
            label="Confirm New Password"
            value={formData.confirmPassword}
            onChange={e=>setFormData({...formData,confirmPassword:e.target.value})}
            show={showConf} onToggle={()=>setShowConf(!showConf)}
            placeholder="Confirm new password"
          />
 
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'13px', borderRadius:12, fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, border:'none', cursor:loading?'not-allowed':'pointer', background:loading?'rgba(201,168,76,0.4)':'linear-gradient(135deg,#8B6914,#C9A84C)', color:'#1C1609', opacity:loading?0.7:1, fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 20px rgba(201,168,76,0.25)', marginTop:4 }}>
            {loading ? <><div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(28,22,9,0.3)',borderTopColor:'#1C1609',animation:'jk-spin 0.8s linear infinite' }} />Changing password...</> : 'Change Password'}
          </button>
        </form>
      </Card>
    </PageShell>
  );
};
 
export default ChangePasswordPage;