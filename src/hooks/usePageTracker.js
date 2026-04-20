import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/constants";

// Generate/persist a session ID per browser tab
const getSessionId = () => {
  let id = sessionStorage.getItem("_jk_sid");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem("_jk_sid", id);
  }
  return id;
};

export function usePageTracker() {
  const location  = useLocation();
  const { user }  = useAuth();
  const lastPath  = useRef(null);

  useEffect(() => {
    // Don't double-track if the path hasn't changed
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;

    // Fire and forget — never block navigation
    fetch(`${API_BASE_URL}/analytics/track`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path:      location.pathname,
        referrer:  document.referrer || null,
        userId:    user?.id || null,
        sessionId: getSessionId(),
      }),
    }).catch(() => {});
  }, [location.pathname, user?.id]);
}