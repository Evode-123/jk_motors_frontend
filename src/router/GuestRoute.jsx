import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * GuestRoute — for pages like /login and /signup.
 * If the user is already authenticated, redirect them to /dashboard.
 */
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for session restore

  if (user) {
    // Already logged in — no point showing login/signup pages
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default GuestRoute;
