import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/apiService';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from sessionStorage on mount
  useEffect(() => {
    const storedUser        = sessionStorage.getItem(STORAGE_KEYS.USER);
    const storedAccessToken = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

    if (storedAccessToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        sessionStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  // ── Login with email + password ───────────────────────────────────────────
  const login = async (email, password) => {
    const userData = await apiService.login(email, password);
    setUser(userData);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return userData;
  };

  // ── Register — account active immediately, auto-login ─────────────────────
  const register = async (data) => {
    await apiService.register(data);
    const userData = await apiService.login(data.email, data.password);
    setUser(userData);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return userData;
  };

  // ── Google Sign-In ────────────────────────────────────────────────────────
  const googleLogin = async (idToken) => {
    const userData = await apiService.googleSignIn(idToken);
    setUser(userData);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    return userData;
  };

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = async () => {
    await apiService.logout();
    setUser(null);
  };

  // ── Patch user state locally ──────────────────────────────────────────────
  const updateUserState = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  };

  // ── Called after initialChangePassword ───────────────────────────────────
  const handleTokenRefresh = (newTokens, updatedUser) => {
    if (newTokens?.accessToken && newTokens?.refreshToken) {
      sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN,  newTokens.accessToken);
      sessionStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refreshToken);
    }
    if (updatedUser) updateUserState(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, googleLogin, logout,
      updateUserState, handleTokenRefresh,
    }}>
      {children}
    </AuthContext.Provider>
  );
};