import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }  from './context/AuthContext';
import ProtectedRoute             from './router/ProtectedRoute';
import GuestRoute                 from './router/GuestRoute';
import { USER_ROLES }             from './utils/constants';
import { usePageTracker }         from './hooks/usePageTracker';

// ── Public pages ──────────────────────────────────────────────────────────────
import LandingPage        from './pages/LandingPage';
import AboutPage          from './pages/AboutPage';
import ServicesPage       from './pages/ServicesPage';
import ContactPage        from './pages/ContactPage';
import UnauthorizedPage   from './pages/UnauthorizedPage';

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage           from './components/auth/LoginPage';
import SignupPage          from './components/auth/SignupPage';
import ForgotPasswordPage  from './components/auth/ForgotPasswordPage';
import ResetPasswordPage   from './components/auth/ResetPasswordPage';
import ChangePasswordPage  from './components/auth/ChangePasswordPage';
import CompleteProfilePage from './components/auth/CompleteProfilePage';

// ── Layout ────────────────────────────────────────────────────────────────────
import DashboardLayout    from './components/layout/DashboardLayout';

// ── Shared dashboard pages ────────────────────────────────────────────────────
import DashboardContent      from './components/dashboard/DashboardContent';
import DashboardServicesPage from './components/dashboard/DashboardServicesPage';
import NotificationsPage     from './components/notifications/NotificationsPage';
import ProfilePage           from './components/profile/ProfilePage';

// ── Client pages ──────────────────────────────────────────────────────────────
import OrderForm from './components/orders/OrderForm';
import MyOrders  from './components/orders/MyOrders';

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminUserManagement    from './components/admin/AdminUserManagement';
import AdminCatalogManagement from './components/admin/AdminCatalogManagement';
import AdminOrderManagement   from './components/admin/AdminOrderManagement';
import AdminAnalytics         from './components/admin/AdminAnalytics';
import AdminContactMessages   from './components/admin/AdminContactMessages';

import FeedbackPage       from './components/feedback/FeedbackPage';
import AdminFeedbackPage  from './components/admin/AdminFeedbackPage';

// ── PageTracker — fires analytics event on every route change ─────────────────
function PageTracker() {
  usePageTracker();
  return null;
}

// ── SmartServicesRoute ────────────────────────────────────────────────────────
const SmartServicesRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;

  if (user) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardServicesPage />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return <ServicesPage />;
};

// ── App ───────────────────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <PageTracker />

      <Routes>

        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/"        element={<LandingPage />} />
        <Route path="/about"   element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/services" element={<SmartServicesRoute />} />

        <Route path="/login" element={
          <GuestRoute><LoginPage /></GuestRoute>
        } />
        <Route path="/signup" element={
          <GuestRoute><SignupPage /></GuestRoute>
        } />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />

        {/* ── First-login gates ─────────────────────────────────────────── */}
        <Route path="/change-password" element={
          <ProtectedRoute><ChangePasswordPage /></ProtectedRoute>
        } />
        <Route path="/complete-profile" element={
          <ProtectedRoute><CompleteProfilePage /></ProtectedRoute>
        } />

        {/* ── Shared protected ──────────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><DashboardContent /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <DashboardLayout><NotificationsPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><ProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Client routes ─────────────────────────────────────────────── */}
        <Route path="/order/new" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT, USER_ROLES.ADMIN]}>
            <DashboardLayout><OrderForm /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/my-orders" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
            <DashboardLayout><MyOrders /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Client: Feedback ──────────────────────────────────────────── */}
        <Route path="/feedback" element={
          <ProtectedRoute allowedRoles={[USER_ROLES.CLIENT]}>
            <DashboardLayout>
              <FeedbackPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Admin: Feedback management ────────────────────────────────── */}
        <Route path="/admin/feedback" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout>
              <AdminFeedbackPage />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Admin routes ──────────────────────────────────────────────── */}
        <Route path="/admin/orders" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminOrderManagement /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/catalog" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminCatalogManagement /></DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminUserManagement /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Analytics ─────────────────────────────────────────────────── */}
        <Route path="/admin/analytics" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminAnalytics /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Contact Messages ──────────────────────────────────────────── */}
        <Route path="/admin/contacts" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminContactMessages /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* ── Misc ──────────────────────────────────────────────────────── */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*"             element={<Navigate to="/" replace />} />

      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;