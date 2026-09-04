import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar.jsx';
import MobileBottomNav from '../components/common/MobileBottomNav.jsx';
import SettingsModal from '../components/common/SettingsModal.jsx';
import { selectCurrentUser } from '../redux/authSlice.js';

export const UserLayout = () => {
  const user = useSelector(selectCurrentUser);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-dark-base text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area with Mobile Safe Bottom Padding */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile-First Floating Bottom Navigation Bar */}
      <MobileBottomNav onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Global Settings & Password Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      {/* Footer with Developer Attribution */}
      <footer className="border-t border-dark-border py-6 sm:py-8 text-slate-400 text-xs text-center pb-20 md:pb-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-slate-300">
              © 2026 Studix. Developed by <span className="text-brand-400 font-bold">Shiva Chaitanya</span>. All rights reserved.
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Academic Intelligence & Resource Management Platform
            </p>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <Link to="/dashboard" className="text-slate-300 hover:text-white font-medium">
              Student Hub
            </Link>
            <span className="text-slate-500">•</span>
            <Link to="/repository" className="text-slate-300 hover:text-white font-medium">
              Archive
            </Link>
            <span className="text-slate-500">•</span>
            <span className="text-brand-400 font-bold">Shiva Chaitanya</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserLayout;
