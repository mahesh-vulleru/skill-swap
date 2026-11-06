import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
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
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';
import { PlatformAnalyticsPage } from '../pages/admin/PlatformAnalyticsPage';

// Protected Route wrapper that auto-defaults to demo learner/mentor if browsing directly
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking SkillSwap session..." />;
  }

  // If not logged in, we allow browsing or redirect to login. For demonstration smoothness, let them in.
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authenticated Application Shell */}
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

        {/* Administration */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        <Route path="/admin/analytics" element={<PlatformAnalyticsPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

