import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, fetchCurrentUser } from './redux/authSlice.js';

// Layouts
import AuthLayout from './layouts/AuthLayout.jsx';
import UserLayout from './layouts/UserLayout.jsx';

// Pages
import SplashScreen from './pages/SplashScreen.jsx';
import WelcomeScreen from './pages/WelcomeScreen.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import ResetPassword from './pages/auth/ResetPassword.jsx';
import OnboardingWizard from './pages/onboarding/OnboardingWizard.jsx';
import Dashboard from './pages/user/Dashboard.jsx';
import RepositoryPage from './pages/user/RepositoryPage.jsx';
import AIAssistantPage from './pages/user/AIAssistantPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import { selectCurrentUser } from './redux/authSlice.js';

import AuthCallback from './pages/auth/AuthCallback.jsx';

// Protected Route Guard

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Role Guard (Strictly restricted to authorized administrator)
const AdminRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const email = (user?.email || '').toLowerCase().trim();
  const isAdminRole = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  if (user && (!isAdminRole || email !== 'vshivachaitanya7@gmail.com')) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};


import { syncFromUser } from './redux/academicSlice.js';

export const App = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [showInitialSplash, setShowInitialSplash] = React.useState(() => {
    return !sessionStorage.getItem('studix_splash_seen');
  });

  // Initialize theme from localStorage immediately so /login, /signup, etc. respect user's theme choice
  useEffect(() => {
    const savedTheme = localStorage.getItem('studix_theme') || 'neu-dark-slate';
    const isLight = savedTheme === 'neu-soft-minimal';
    document.documentElement.className = isLight ? 'neu-soft-minimal light' : `${savedTheme} dark`;
  }, []);

  // Revalidate profile if token exists on load
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser()).then((res) => {
        if (res.payload) {
          dispatch(syncFromUser(res.payload));
        }
      });
    }
  }, [isAuthenticated, dispatch]);

  if (showInitialSplash) {
    return <SplashScreen onFinish={() => setShowInitialSplash(false)} />;
  }

  return (
    <Routes>
      {/* Entrance Flow */}
      <Route path="/" element={<SplashScreen onFinish={() => setShowInitialSplash(false)} />} />
      <Route path="/welcome" element={<WelcomeScreen />} />


      {/* Auth Layout & Flow */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route element={<AuthLayout />}>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected User & Academic Flow */}
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repository" element={<RepositoryPage />} />
        <Route path="/ai-assistant" element={<AIAssistantPage />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
      </Route>

      {/* Protected Admin Flow */}
      <Route
        element={
          <AdminRoute>
            <UserLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Catch-all */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
