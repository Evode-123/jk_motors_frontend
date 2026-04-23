import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../utils/constants';

const ProtectedRoute = ({ children, allowedRoles, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still restoring session from sessionStorage
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#0A0A0A',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 52, height: 52,
            border: '3px solid rgba(255,107,0,0.2)',
            borderTop: '3px solid #FF6B00',
            borderRadius: '50%', margin: '0 auto',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ marginTop: 18, color: '#888', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            Loading...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 1. Not authenticated → send to login, save where they were trying to go
  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  // 2. Admin first-login: must change temp password
  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // 3. Customer profile not yet filled in
  if (!user.profileCompleted && location.pathname !== '/complete-profile' && location.pathname !== '/change-password') {
    return <Navigate to="/complete-profile" replace />;
  }

  // 4. Role check
  const roles = adminOnly ? [USER_ROLES.ADMIN] : allowedRoles;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
