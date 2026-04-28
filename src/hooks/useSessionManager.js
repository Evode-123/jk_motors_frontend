import { useState, useEffect, useRef, useCallback } from 'react';

// ── Configurable timeouts ──────────────────────────────────────────────────────
const IDLE_TIMEOUT_MS   = 30 * 60 * 1000;  // 30 min of inactivity → force logout
const WARNING_BEFORE_MS =  5 * 60 * 1000;  //  5 min warning before logout
const ACTIVITY_EVENTS   = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'pointermove'];

// ── State machine: active → warning → expired ─────────────────────────────────
// 'active'  — session is live, user is active
// 'warning' — idle too long, countdown running, user can extend
// 'expired' — countdown hit 0 OR API returned 401 with no valid refresh token

export function useSessionManager({ onExtend, onExpire, isAuthenticated }) {
  const [phase,     setPhase]     = useState('active');
  const [countdown, setCountdown] = useState(0); // seconds remaining in warning phase

  const warningTimerRef   = useRef(null);
  const countdownTimerRef = useRef(null);
  const phaseRef          = useRef('active'); // sync ref for event listeners

  // Keep ref in sync so event handlers always read current phase
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // ── Clear all running timers ───────────────────────────────────────────────
  const clearAll = useCallback(() => {
    clearTimeout(warningTimerRef.current);
    clearInterval(countdownTimerRef.current);
  }, []);

  // ── Start (or restart) the idle countdown ─────────────────────────────────
  const startIdleTimer = useCallback(() => {
    clearAll();
    if (!isAuthenticated) return;

    // After (IDLE_TIMEOUT - WARNING_BEFORE) of silence → enter warning phase
    warningTimerRef.current = setTimeout(() => {
      setPhase('warning');
      setCountdown(Math.floor(WARNING_BEFORE_MS / 1000));

      // Tick every second
      countdownTimerRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimerRef.current);
            setPhase('expired');
            onExpire?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1_000);

    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS); // 25 min silence → show warning
  }, [isAuthenticated, clearAll, onExpire]);

  // ── Activity listener — reset timer, but NOT if warning/expired is showing ─
  const handleActivity = useCallback(() => {
    if (phaseRef.current === 'warning' || phaseRef.current === 'expired') return;
    startIdleTimer();
  }, [startIdleTimer]);

  // ── Boot / teardown on auth change ────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      clearAll();
      setPhase('active');
      return;
    }

    startIdleTimer();

    ACTIVITY_EVENTS.forEach(evt =>
      document.addEventListener(evt, handleActivity, { passive: true })
    );

    return () => {
      clearAll();
      ACTIVITY_EVENTS.forEach(evt =>
        document.removeEventListener(evt, handleActivity)
      );
    };
  }, [isAuthenticated, startIdleTimer, handleActivity, clearAll]);

  // ── Listen for API-driven expiry (fired by apiService when refresh fails) ──
  useEffect(() => {
    const handler = () => {
      clearAll();
      setPhase('expired');
      // Don't call onExpire here — the modal will handle the redirect
    };
    window.addEventListener('auth:session-expired', handler);
    return () => window.removeEventListener('auth:session-expired', handler);
  }, [clearAll]);

  // ── User clicked "Stay logged in" ─────────────────────────────────────────
  const extend = useCallback(async () => {
    clearAll();
    setPhase('active');
    setCountdown(0);
    await onExtend?.();
    startIdleTimer();
  }, [clearAll, onExtend, startIdleTimer]);

  // ── User clicked "Log out" or "OK" on expired modal ───────────────────────
  const dismiss = useCallback(() => {
    clearAll();
    setPhase('active');
    setCountdown(0);
  }, [clearAll]);

  return { phase, countdown, extend, dismiss };
}