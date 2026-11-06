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
import { MentorDashboardPage } from '../pages/mentor/MentorDashboardPage';
import { LearnerDashboardPage } from '../pages/learner/LearnerDashboardPage';
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

// Helper to determine a user's isolated role dashboard
const getRoleDashboard = (role?: string) => {
  if (role === 'admin') return '/admin';
  if (role === 'mentor') return '/mentor/dashboard';
  return '/learner/dashboard';
};

// Generic Role-based Route Guard: strictly enforces role boundaries
interface RoleRouteProps {
  allowedRoles: string[];
  children: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying role permissions..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect unauthorized user strictly to their own assigned dashboard
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <>{children}</>;
};

// Standard Protected Route for User Portal: strictly excludes Admin users
const ProtectedUserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Verifying session credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role === 'admin') {
    // Admins are strictly confined to the Admin Portal
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

// Automatic role-based dashboard router
const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Routing to your dashboard..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDashboard(user.role)} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Role-Aware Dashboard Redirection */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* User Portal: Modules with AppLayout (Only Mentors & Learners) */}
      <Route
        element={
          <ProtectedUserRoute>
            <AppLayout />
          </ProtectedUserRoute>
        }
      >
        {/* Mentor Isolated Dashboard Route (Mentors ONLY) */}
        <Route
          path="/mentor/dashboard"
          element={
            <RoleRoute allowedRoles={['mentor']}>
              <MentorDashboardPage />
            </RoleRoute>
          }
        />

        {/* Learner Isolated Dashboard Route (Learners ONLY) */}
        <Route
          path="/learner/dashboard"
          element={
            <RoleRoute allowedRoles={['learner', 'learner_mentor']}>
              <LearnerDashboardPage />
            </RoleRoute>
          }
        />

        {/* User Portal Modules */}
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

      {/* Admin Isolated Portal (Admins ONLY) */}
      <Route
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
        <Route path="/admin/moderation" element={<AdminModerationPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Catch-all: Route unrecognized paths to Role Dashboard or Home */}
      <Route path="*" element={<DashboardRedirect />} />
    </Routes>
  );
};
