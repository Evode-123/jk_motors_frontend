import React, { useState, useEffect } from 'react';
import { X, Star, Send, CheckCircle } from 'lucide-react';
import apiService from '../../services/apiService';

/**
 * FeedbackModal
 *
 * Shows automatically after an order is completed, or can be triggered manually.
 * Props:
 *   orderId   — the completed order's ID (optional, can submit without order)
 *   orderInfo — { serviceName, carMake, carModel } for display (optional)
 *   onClose   — called when modal should close
 */
export default function FeedbackModal({ orderId, orderInfo, onClose }) {
  const [rating,    setRating]    = useState(0);
  const [hovered,   setHovered]   = useState(0);
  const [message,   setMessage]   = useState('');
  const [isPublic,  setIsPublic]  = useState(true);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  const handleSubmit = async () => {
    if (!rating)         return setError('Please select a rating.');
    if (!message.trim()) return setError('Please write a short message.');
    setError('');
    setLoading(true);
    try {
      await apiService.submitFeedback({ orderId, rating, message, isPublic });
      setSubmitted(true);
    } catch (e) {
      setError(e.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap');
        .fb-star { transition: transform 0.15s, filter 0.15s; cursor: pointer; }
        .fb-star:hover { transform: scale(1.2); }
        .fb-star.active { filter: drop-shadow(0 0 6px rgba(251,191,36,0.7)); }
        .fb-overlay { animation: fbFadeIn 0.2s ease; }
        .fb-card { animation: fbSlideUp 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes fbFadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fbSlideUp { from{opacity:0;transform:translateY(30px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        .fb-textarea { resize: none; background: rgba(14,165,233,0.04); border: 1px solid rgba(14,165,233,0.2); color: #e2e8f0; border-radius: 12px; width: 100%; padding: 12px 14px; font-family:'Space Grotesk',sans-serif; font-size:14px; outline:none; transition: border-color 0.2s, box-shadow 0.2s; }
        .fb-textarea:focus { border-color: rgba(14,165,233,0.5); box-shadow: 0 0 0 3px rgba(14,165,233,0.08); }
        .fb-textarea::placeholder { color: rgba(148,163,184,0.5); }
        .fb-toggle { width: 42px; height: 24px; border-radius: 12px; border: none; cursor: pointer; position: relative; transition: background 0.2s; flex-shrink: 0; }
        .fb-toggle::after { content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:50%; background:#fff; transition:transform 0.2s; }
        .fb-toggle.on { background: linear-gradient(135deg,#0EA5E9,#6366F1); }
        .fb-toggle.on::after { transform: translateX(18px); }
        .fb-toggle.off { background: rgba(100,116,139,0.4); }
      `}</style>

      {/* Overlay */}
      <div className="fb-overlay" onClick={onClose} style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}>
        {/* Card */}
        <div className="fb-card" onClick={e => e.stopPropagation()} style={{
          background: 'linear-gradient(160deg,#0F2644,#1E3D6E)',
          border: '1px solid rgba(14,165,233,0.25)',
          borderRadius: 24,
          width: '100%',
          maxWidth: 460,
          padding: '32px 28px',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {/* Top accent line */}
          <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:2, background:'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)', borderRadius:2 }} />

          {/* Close */}
          <button onClick={onClose} style={{
            position:'absolute', top:16, right:16,
            background:'rgba(14,165,233,0.08)', border:'1px solid rgba(14,165,233,0.15)',
            borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', color:'#94a3b8',
          }}>
            <X style={{ width:16, height:16 }} />
          </button>

          {submitted ? (
            /* ── Success state ── */
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{
                width:64, height:64, borderRadius:'50%', background:'rgba(16,185,129,0.12)',
                border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center',
                justifyContent:'center', margin:'0 auto 20px',
              }}>
                <CheckCircle style={{ width:32, height:32, color:'#34d399' }} />
              </div>
              <h3 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:18, fontWeight:900, color:'#e2e8f0', marginBottom:10 }}>
                Thank You! 🎉
              </h3>
              <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, color:'#94a3b8', marginBottom:24, lineHeight:1.6 }}>
                Your feedback has been submitted. We appreciate you taking the time to share your experience with us!
              </p>
              <button onClick={onClose} style={{
                background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'#fff', border:'none',
                borderRadius:12, padding:'12px 32px', cursor:'pointer',
                fontFamily:"'Space Grotesk',sans-serif", fontWeight:600, fontSize:14,
              }}>
                Close
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              {/* Header */}
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:11, color:'#38bdf8', textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:8 }}>
                  {orderId ? 'Service Feedback' : 'Share Your Experience'}
                </div>
                <h2 style={{ fontFamily:"'Orbitron',sans-serif", fontSize:20, fontWeight:900, color:'#e2e8f0', margin:0, lineHeight:1.2 }}>
                  HOW DID WE DO?
                </h2>
                {orderInfo && (
                  <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:'#64748b', marginTop:6 }}>
                    {orderInfo.serviceName} · {orderInfo.carMake} {orderInfo.carModel}
                  </p>
                )}
              </div>

              {/* Stars */}
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:'#94a3b8', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Your Rating
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:8 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n}
                      className={`fb-star${(hovered || rating) >= n ? ' active' : ''}`}
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      style={{ fontSize:32, lineHeight:1 }}>
                      <Star style={{
                        width:32, height:32,
                        fill:   (hovered || rating) >= n ? '#fbbf24' : 'transparent',
                        color:  (hovered || rating) >= n ? '#fbbf24' : 'rgba(148,163,184,0.3)',
                        transition:'all 0.15s',
                      }} />
                    </span>
                  ))}
                  {(hovered || rating) > 0 && (
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'#fbbf24', fontWeight:600, marginLeft:4 }}>
                      {STAR_LABELS[hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Message */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, color:'#94a3b8', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                  Your Message
                </div>
                <textarea
                  className="fb-textarea"
                  rows={4}
                  placeholder="Tell us about your experience — what went well, what could be improved..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={1000}
                />
                <div style={{ textAlign:'right', fontFamily:"'Space Grotesk',sans-serif", fontSize:11, color:'#475569', marginTop:4 }}>
                  {message.length}/1000
                </div>
              </div>

              {/* Public toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, padding:'12px 14px', background:'rgba(14,165,233,0.04)', borderRadius:12, border:'1px solid rgba(14,165,233,0.1)' }}>
                <button
                  className={`fb-toggle ${isPublic ? 'on' : 'off'}`}
                  onClick={() => setIsPublic(!isPublic)}
                />
                <div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'#e2e8f0', fontWeight:600 }}>
                    {isPublic ? 'Public Feedback' : 'Private Feedback'}
                  </div>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:11, color:'#64748b' }}>
                    {isPublic ? 'Visible to the team for quality improvement' : 'Only visible to admin, not shared'}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, padding:'10px 14px', marginBottom:14 }}>
                  <p style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13, color:'#f87171', margin:0 }}>{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width:'100%', background:'linear-gradient(135deg,#0EA5E9,#6366F1)', color:'#fff',
                  border:'none', borderRadius:12, padding:'13px', cursor:loading ? 'wait' : 'pointer',
                  fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:15,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  opacity:loading ? 0.75 : 1, transition:'opacity 0.2s',
                  boxShadow:'0 4px 16px rgba(14,165,233,0.25)',
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width:16,height:16,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',animation:'spin 0.7s linear infinite' }} />
                    Submitting…
                  </>
                ) : (
                  <><Send style={{width:16,height:16}} /> Submit Feedback</>
                )}
              </button>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </>
          )}
        </div>
      </div>
    </>
  );
}