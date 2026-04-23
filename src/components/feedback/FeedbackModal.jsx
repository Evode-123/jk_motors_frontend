// ═══════════════════════════════════════
// FeedbackModal.jsx — Gold/Dark Theme
// ═══════════════════════════════════════
import React, { useState, useEffect } from 'react';
import { X, Star, Send, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';

export default function FeedbackModal({ orderId, orderInfo, onClose }) {
  const [rating,setRating]=useState(0);
  const [hovered,setHovered]=useState(0);
  const [message,setMessage]=useState('');
  const [isPublic,setIsPublic]=useState(true);
  const [loading,setLoading]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [error,setError]=useState('');

  useEffect(() => { document.body.style.overflow='hidden'; return () => { document.body.style.overflow=''; }; }, []);

  const STAR_LABELS = ['','Poor','Fair','Good','Great','Excellent'];

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating.');
    if (!message.trim()) return setError('Please write a short message.');
    setError(''); setLoading(true);
    try { await apiService.submitFeedback({ orderId, rating, message, isPublic }); setSubmitted(true); }
    catch (e) { setError(e.message || 'Failed to submit feedback. Please try again.'); }
    finally { setLoading(false); }
  };

  const G = { gold:'#C9A84C', goldDim:'rgba(201,168,76,0.18)', goldDimmer:'rgba(201,168,76,0.09)', textPrimary:'#F5E4B8', textMuted:'rgba(168,136,72,0.75)', border:'rgba(201,168,76,0.16)' };

  return (
    <>
      <style>{`
        .fb-overlay { animation: fbFadeIn 0.2s ease; }
        .fb-card { animation: fbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes fbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fbSlideUp { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .fb-textarea { resize:none; background:rgba(20,16,8,0.8); border:1px solid rgba(201,168,76,0.22); color:#F5E4B8; border-radius:12px; width:100%; padding:12px 14px; font-family:'DM Sans',sans-serif; font-size:14px; outline:none; transition:border-color 0.2s,box-shadow 0.2s; }
        .fb-textarea:focus { border-color:rgba(201,168,76,0.5); box-shadow:0 0 0 3px rgba(201,168,76,0.08); }
        .fb-textarea::placeholder { color:rgba(168,136,72,0.45); }
        .fb-toggle { width:42px; height:24px; border-radius:12px; border:none; cursor:pointer; position:relative; transition:background 0.2s; flex-shrink:0; }
        .fb-toggle::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#F5E4B8; transition:transform 0.2s; }
        .fb-toggle.on { background:linear-gradient(135deg,#8B6914,#C9A84C); }
        .fb-toggle.on::after { transform:translateX(18px); }
        .fb-toggle.off { background:rgba(100,80,20,0.4); }
        @keyframes jk-spin { to { transform:rotate(360deg); } }
      `}</style>

      <div className="fb-overlay" onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
        <div className="fb-card" onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(160deg,#100D05,#1C1609)', border:`1px solid ${G.goldDim}`, borderRadius:24, width:'100%', maxWidth:460, padding:'32px 28px', position:'relative', boxShadow:'0 24px 64px rgba(0,0,0,0.7)' }}>

          <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:`linear-gradient(90deg,transparent,${G.gold},transparent)`, borderRadius:2 }} />

          <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:G.goldDimmer, border:`1px solid ${G.border}`, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:G.textMuted }}>
            <X style={{ width:16, height:16 }} />
          </button>

          {submitted ? (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(52,211,153,0.12)', border:'1px solid rgba(52,211,153,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                <CheckCircle style={{ width:32, height:32, color:'#34d399' }} />
              </div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:18, fontWeight:700, color:G.textPrimary, marginBottom:10 }}>Thank You! 🎉</h3>
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:G.textMuted, marginBottom:24, lineHeight:1.6 }}>Your feedback has been submitted. We appreciate you taking the time to share your experience!</p>
              <button onClick={onClose} style={{ background:'linear-gradient(135deg,#8B6914,#C9A84C)', color:'#1C1609', border:'none', borderRadius:12, padding:'12px 32px', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:14 }}>Close</button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:G.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>
                  {orderId ? 'Service Feedback' : 'Share Your Experience'}
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:20, fontWeight:700, color:G.textPrimary, margin:0, lineHeight:1.2 }}>HOW DID WE DO?</h2>
                {orderInfo && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:G.textMuted, marginTop:6 }}>{orderInfo.serviceName} · {orderInfo.carMake} {orderInfo.carModel}</p>}
              </div>

              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:G.textMuted, marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>Your Rating</div>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} onClick={() => setRating(n)} onMouseEnter={() => setHovered(n)} onMouseLeave={() => setHovered(0)}
                      style={{ cursor:'pointer', transition:'transform 0.15s', transform:(hovered||rating)>=n?'scale(1.2)':'scale(1)' }}>
                      <Star style={{ width:32, height:32, fill:(hovered||rating)>=n?G.gold:'transparent', color:(hovered||rating)>=n?G.gold:'rgba(168,136,72,0.3)', transition:'all 0.15s', filter:(hovered||rating)>=n?`drop-shadow(0 0 6px rgba(201,168,76,0.6))`:'none' }} />
                    </span>
                  ))}
                  {(hovered||rating) > 0 && <span style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.gold, fontWeight:600, marginLeft:4 }}>{STAR_LABELS[hovered||rating]}</span>}
                </div>
              </div>

              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:G.textMuted, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Your Message</div>
                <textarea className="fb-textarea" rows={4} placeholder="Tell us about your experience — what went well, what could be improved..." value={message} onChange={e=>setMessage(e.target.value)} maxLength={1000} />
                <div style={{ textAlign:'right', fontFamily:"'DM Sans',sans-serif", fontSize:11, color:G.textMuted, marginTop:4 }}>{message.length}/1000</div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'12px 14px', background:G.goldDimmer, borderRadius:12, border:`1px solid ${G.border}` }}>
                <button className={`fb-toggle ${isPublic?'on':'off'}`} onClick={() => setIsPublic(!isPublic)} />
                <div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.textPrimary, fontWeight:600 }}>{isPublic?'Public Feedback':'Private Feedback'}</div>
                  <div style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:G.textMuted }}>{isPublic?'Visible to the team for quality improvement':'Only visible to admin, not shared'}</div>
                </div>
              </div>

              {error && (
                <div style={{ background:'rgba(180,60,40,0.1)', border:'1px solid rgba(180,60,40,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                  <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'#f87171', margin:0 }}>{error}</p>
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                style={{ width:'100%', background:'linear-gradient(135deg,#8B6914,#C9A84C)', color:'#1C1609', border:'none', borderRadius:12, padding:'13px', cursor:loading?'wait':'pointer', fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity:loading?0.75:1, transition:'opacity 0.2s', boxShadow:'0 4px 16px rgba(201,168,76,0.2)' }}>
                {loading ? (
                  <><div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(28,22,9,0.3)',borderTopColor:'#1C1609',animation:'jk-spin 0.7s linear infinite' }} /> Submitting…</>
                ) : (
                  <><Send style={{width:16,height:16}} /> Submit Feedback</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}