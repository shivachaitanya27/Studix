import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { getAdminUser } from './services/api.js';

const AdminRoute = ({ children }) => {
  const user = getAdminUser();
  const isAdmin =
    user &&
    (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
    (user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const App = () => {
  const user = getAdminUser();
  const isAuthenticated = Boolean(user && user.role === 'ADMIN');

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
};

export default App;
