import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// Pages
import { LandingPage } from '../pages/landing/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/user/DashboardPage';
import { ProfilePage } from '../pages/user/ProfilePage';
import { ExploreSkillsPage } from '../pages/user/ExploreSkillsPage';
import { FindPartnersPage } from '../pages/user/FindPartnersPage';
import { ExchangeRequestsPage } from '../pages/user/ExchangeRequestsPage';
import { ScheduleSessionPage } from '../pages/user/ScheduleSessionPage';
import { MySessionsPage } from '../pages/user/MySessionsPage';
import { ChatPage } from '../pages/user/ChatPage';
import { ReviewsPage } from '../pages/user/ReviewsPage';
import { CreditsPage } from '../pages/user/CreditsPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { PlatformAnalyticsPage } from '../pages/admin/PlatformAnalyticsPage';
import { AdminModerationPage } from '../pages/admin/AdminModerationPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

// Standard Protected Route: requires active authenticated session
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying SkillSwap session..." />;
  }

  if (!user) {
    // Redirect unauthenticated visitors to login, preserving intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Admin Route: strictly enforces administrator role authorization
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== 'admin') {
    // Non-admin users are strictly forbidden from admin pages and redirected to standard user dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* User Portal: 10 Standard Modules with AppLayout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/skills" element={<ExploreSkillsPage />} />
        <Route path="/matches" element={<FindPartnersPage />} />
        <Route path="/exchange-requests" element={<ExchangeRequestsPage />} />
        <Route path="/schedule" element={<ScheduleSessionPage />} />
        <Route path="/my-sessions" element={<MySessionsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
        <Route path="/reviews" element={<ReviewsPage />} />
        <Route path="/credits" element={<CreditsPage />} />
      </Route>

      {/* Dedicated Admin Portal: Strictly Protected with AdminLayout */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
