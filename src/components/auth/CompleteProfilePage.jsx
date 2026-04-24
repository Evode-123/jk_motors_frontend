import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiService from '../../services/apiService';
 
export const CompleteProfilePage = () => {
  const { updateUserState } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName:'', lastName:'', phone:'' });
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
 
  const GC = {
    gold:'#C9A84C', goldDim:'rgba(201,168,76,0.22)',
    textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.2)',
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await apiService.completeProfile(formData);
      updateUserState({
        profileCompleted: true,
        firstName: res.user?.firstName || formData.firstName,
        lastName:  res.user?.lastName  || formData.lastName,
        phone:     res.user?.phone     || formData.phone,
      });
      navigate('/dashboard', { replace:true });
    } catch (err) { setError(err.message || 'Failed to save profile.'); }
    finally { setLoading(false); }
  };
 
  const inputStyle = (iconPadding=false) => ({
    width:'100%', paddingLeft:iconPadding?40:16, paddingRight:16, paddingTop:12, paddingBottom:12,
    borderRadius:12, fontSize:14, background:'rgba(20,16,8,0.8)',
    border:`1px solid ${GC.border}`, fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box',
    color:'#F5E4B8',
  });
 
  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:16, background:'linear-gradient(160deg,#1C1609 0%,#100D05 40%,#1C1609 70%,#0A0804 100%)' }}>
      <style>{`.gold-input::placeholder{color:rgba(168,136,72,0.45)!important;opacity:1}.gold-input{color:#F5E4B8!important}.gold-input:focus{outline:none!important;border-color:rgba(201,168,76,0.55)!important;box-shadow:0 0 0 3px rgba(201,168,76,0.1)!important}@keyframes jk-spin{to{transform:rotate(360deg)}}`}</style>
 
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'linear-gradient(rgba(201,168,76,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,0.04) 1px,transparent 1px)', backgroundSize:'48px 48px' }} />
      <div style={{ position:'absolute', top:-80, right:-80, width:320, height:320, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(201,168,76,0.09) 0%,transparent 65%)', filter:'blur(32px)' }} />
      <div style={{ position:'absolute', bottom:-60, left:-60, width:280, height:280, borderRadius:'50%', pointerEvents:'none', background:'radial-gradient(circle,rgba(139,105,20,0.1) 0%,transparent 65%)', filter:'blur(32px)' }} />
 
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:380, borderRadius:24, padding:'32px 28px', background:'rgba(20,16,8,0.92)', backdropFilter:'blur(24px)', border:`1px solid ${GC.goldDim}`, boxShadow:'0 24px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:`linear-gradient(90deg,transparent,${GC.gold},transparent)`, borderRadius:2 }} />
 
        {/* Icon + Title */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:28 }}>
          <div style={{ width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, background:'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(139,105,20,0.25))', border:`1px solid ${GC.goldDim}` }}>
            <User style={{ width:20, height:20, color:GC.gold }} />
          </div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:GC.textPrimary, margin:'0 0 6px' }}>Complete your profile</h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:GC.textMuted }}>Please provide your details to continue</p>
        </div>
 
        {error && (
          <div style={{ marginBottom:16, padding:'10px 14px', borderRadius:10, fontSize:13, background:'rgba(180,60,40,0.12)', border:'1px solid rgba(180,60,40,0.3)', color:'#f87171', fontFamily:"'DM Sans',sans-serif" }}>{error}</div>
        )}
 
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {/* First name */}
          <div>
            <label style={{ fontFamily:"'DM Sans',sans-serif", color:GC.textMuted, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>First Name</label>
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:GC.gold, pointerEvents:'none' }} />
              <input type="text" value={formData.firstName} onChange={e=>setFormData({...formData,firstName:e.target.value})} placeholder="Enter your first name" required className="gold-input" style={inputStyle(true)} />
            </div>
          </div>
 
          {/* Last name */}
          <div>
            <label style={{ fontFamily:"'DM Sans',sans-serif", color:GC.textMuted, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Last Name</label>
            <div style={{ position:'relative' }}>
              <User style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:GC.gold, pointerEvents:'none' }} />
              <input type="text" value={formData.lastName} onChange={e=>setFormData({...formData,lastName:e.target.value})} placeholder="Enter your last name" required className="gold-input" style={inputStyle(true)} />
            </div>
          </div>
 
          {/* Phone */}
          <div>
            <label style={{ fontFamily:"'DM Sans',sans-serif", color:GC.textMuted, fontSize:11, textTransform:'uppercase', letterSpacing:'0.08em', display:'block', marginBottom:6 }}>Phone Number</label>
            <div style={{ position:'relative' }}>
              <Phone style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:GC.gold, pointerEvents:'none' }} />
              <input type="tel" value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder="+250 XXX XXX XXX" className="gold-input" style={inputStyle(true)} />
            </div>
          </div>
 
          <button type="submit" disabled={loading}
            style={{ width:'100%', padding:'13px', borderRadius:12, fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8, border:'none', cursor:loading?'not-allowed':'pointer', background:loading?'rgba(201,168,76,0.4)':'linear-gradient(135deg,#8B6914,#C9A84C)', color:'#1C1609', opacity:loading?0.7:1, fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 20px rgba(201,168,76,0.25)', marginTop:4 }}>
            {loading ? <><div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(28,22,9,0.3)',borderTopColor:'#1C1609',animation:'jk-spin 0.8s linear infinite' }} />Saving...</> : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
 
export default CompleteProfilePage;