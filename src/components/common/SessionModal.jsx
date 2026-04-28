import React, { useEffect, useRef } from 'react';
import { Clock, LogIn, RefreshCw, ShieldAlert, Loader } from 'lucide-react';

const G = {
  gold:        '#C9A84C',
  goldLight:   '#E8C96A',
  goldDim:     'rgba(201,168,76,0.18)',
  goldDimmer:  'rgba(201,168,76,0.09)',
  textPrimary: '#F5E4B8',
  textMuted:   'rgba(168,136,72,0.75)',
  border:      'rgba(201,168,76,0.16)',
};

const FONT  = { fontFamily: "'DM Sans', sans-serif" };
const SERIF = { fontFamily: "'Playfair Display', serif" };

// Convert seconds to "M:SS" string
const fmtCountdown = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

// Animated ring that drains as countdown runs
function CountdownRing({ value, max, size = 80 }) {
  const r   = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / max) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke="rgba(201,168,76,0.12)" strokeWidth="5" />
      {/* Progress */}
      <circle cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={value <= 60 ? '#f87171' : G.gold}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        strokeDashoffset={`${circ - fill}`}
        style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
      />
    </svg>
  );
}

export default function SessionModal({
  phase,       // 'warning' | 'expired'
  countdown,   // seconds remaining (warning phase only)
  maxCountdown,// total warning seconds (to compute ring %)
  onExtend,    // async fn — refreshes token
  onLogout,    // fn — logs user out
  extending,   // bool — loading state while refreshing
}) {
  const btnRef = useRef(null);

  // Auto-focus primary button for accessibility
  useEffect(() => {
    if (phase && btnRef.current) {
      setTimeout(() => btnRef.current?.focus(), 150);
    }
  }, [phase]);

  if (phase !== 'warning' && phase !== 'expired') return null;

  const isExpired = phase === 'expired';

  return (
    <>
      <style>{`
        @keyframes session-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes session-modal-in {
          from { opacity: 0; transform: translateY(24px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes pulse-ring {
          0%,100% { box-shadow: 0 0 0 0 rgba(201,168,76,0.3); }
          50%      { box-shadow: 0 0 0 8px rgba(201,168,76,0); }
        }
      `}</style>

      {/* Backdrop */}
      <div style={{
        position:   'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        display:    'flex', alignItems: 'center', justifyContent: 'center',
        padding:    16,
        animation:  'session-backdrop-in 0.25s ease',
      }}>

        {/* Card */}
        <div style={{
          position:   'relative',
          width:      '100%', maxWidth: 400,
          borderRadius: 24,
          background: 'linear-gradient(160deg, #100D05 0%, #1C1609 60%, #100D05 100%)',
          border:     `1px solid ${isExpired ? 'rgba(248,113,113,0.25)' : G.goldDim}`,
          boxShadow:  isExpired
            ? '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(248,113,113,0.08)'
            : '0 32px 80px rgba(0,0,0,0.8), 0 0 40px rgba(201,168,76,0.06)',
          padding:    '36px 28px',
          animation:  'session-modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          overflow:   'hidden',
        }}>

          {/* Top accent line */}
          <div style={{
            position:   'absolute', top: 0, left: '10%', right: '10%', height: 2,
            background: isExpired
              ? 'linear-gradient(90deg, transparent, #f87171, transparent)'
              : `linear-gradient(90deg, transparent, ${G.gold}, transparent)`,
            borderRadius: 2,
          }} />

          {/* Icon area */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            {isExpired ? (
              // Expired — static icon
              <div style={{
                width:        64, height: 64, borderRadius: '50%',
                background:   'rgba(248,113,113,0.1)',
                border:       '1px solid rgba(248,113,113,0.25)',
                display:      'flex', alignItems: 'center', justifyContent: 'center',
                margin:       '0 auto 16px',
                animation:    'pulse-ring 2s ease-in-out infinite',
              }}>
                <ShieldAlert style={{ width: 28, height: 28, color: '#f87171' }} />
              </div>
            ) : (
              // Warning — countdown ring
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 16px' }}>
                <CountdownRing value={countdown} max={maxCountdown} size={80} />
                <div style={{
                  position:   'absolute', inset: 0,
                  display:    'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 1,
                }}>
                  <span style={{
                    ...FONT,
                    fontSize:   countdown <= 60 ? 17 : 15,
                    fontWeight: 700,
                    color:      countdown <= 60 ? '#f87171' : G.gold,
                    transition: 'color 0.5s',
                    lineHeight: 1,
                  }}>
                    {fmtCountdown(countdown)}
                  </span>
                </div>
              </div>
            )}

            <h2 style={{
              ...SERIF,
              fontSize:   19, fontWeight: 700, color: G.textPrimary,
              margin: '0 0 8px',
            }}>
              {isExpired ? 'Session Expired' : 'Still there?'}
            </h2>

            <p style={{
              ...FONT,
              fontSize: 13, color: G.textMuted, lineHeight: 1.6,
            }}>
              {isExpired
                ? 'Your session has ended due to inactivity. Please sign in again to continue.'
                : `You've been inactive for a while. Your session will end in ${fmtCountdown(countdown)} unless you continue.`
              }
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {isExpired ? (
              <button
                ref={btnRef}
                onClick={onLogout}
                style={{
                  width:      '100%', padding: '13px',
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #8B6914, #C9A84C)',
                  border:     'none', cursor: 'pointer',
                  display:    'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  ...FONT, fontSize: 14, fontWeight: 700, color: '#1C1609',
                  boxShadow: '0 4px 20px rgba(201,168,76,0.25)',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <LogIn style={{ width: 16, height: 16 }} />
                Sign In Again
              </button>
            ) : (
              <>
                {/* Primary — extend */}
                <button
                  ref={btnRef}
                  onClick={onExtend}
                  disabled={extending}
                  style={{
                    width:      '100%', padding: '13px',
                    borderRadius: 12,
                    background: extending ? 'rgba(201,168,76,0.4)' : 'linear-gradient(135deg, #8B6914, #C9A84C)',
                    border:     'none', cursor: extending ? 'not-allowed' : 'pointer',
                    display:    'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    ...FONT, fontSize: 14, fontWeight: 700, color: '#1C1609',
                    opacity:    extending ? 0.7 : 1,
                    boxShadow:  '0 4px 20px rgba(201,168,76,0.25)',
                    transition: 'opacity 0.2s',
                  }}
                >
                  {extending
                    ? <><Loader style={{ width: 15, height: 15, animation: 'jk-spin 0.8s linear infinite' }} /> Extending session...</>
                    : <><RefreshCw style={{ width: 15, height: 15 }} /> Stay Logged In</>
                  }
                </button>

                {/* Secondary — logout */}
                <button
                  onClick={onLogout}
                  disabled={extending}
                  style={{
                    width:        '100%', padding: '11px',
                    borderRadius: 12,
                    background:   'transparent',
                    border:       `1px solid ${G.goldDim}`,
                    cursor:       extending ? 'not-allowed' : 'pointer',
                    ...FONT, fontSize: 13, fontWeight: 600, color: G.textMuted,
                    opacity:      extending ? 0.5 : 1,
                    transition:   'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (!extending) {
                      e.currentTarget.style.background = 'rgba(248,113,113,0.06)';
                      e.currentTarget.style.borderColor = 'rgba(248,113,113,0.25)';
                      e.currentTarget.style.color = '#f87171';
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = G.goldDim;
                    e.currentTarget.style.color = G.textMuted;
                  }}
                >
                  Log Out
                </button>
              </>
            )}
          </div>

          {/* Bottom note */}
          <p style={{
            ...FONT,
            fontSize: 11, color: 'rgba(168,136,72,0.4)',
            textAlign: 'center', marginTop: 16,
          }}>
            {isExpired
              ? 'JK Motors — Your security is our priority'
              : 'Your data is safe. This is just a security timeout.'
            }
          </p>
        </div>
      </div>

      <style>{`@keyframes jk-spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}