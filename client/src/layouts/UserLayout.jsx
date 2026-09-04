import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.jsx';
import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
} from '../redux/academicSlice.js';
export const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-dark-base text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border py-8 text-slate-500 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Studix Academic Intelligence Platform. Powered by Supabase & OpenRouter AI.</p>
          <div className="flex space-x-4">
            <Link to="/dashboard" className="hover:text-slate-300">
              User Panel
            </Link>
            <span className="text-slate-600">|</span>
            <span className="text-brand-400 font-medium">Enterprise SDD Core</span>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
