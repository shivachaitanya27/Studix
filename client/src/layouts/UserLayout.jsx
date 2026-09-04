import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Headphones, MessageSquareHeart } from 'lucide-react';
import { Navbar } from '../components/common/Navbar.jsx';
import MobileBottomNav from '../components/common/MobileBottomNav.jsx';
import SettingsModal from '../components/common/SettingsModal.jsx';
import SupportModal from '../components/common/SupportModal.jsx';
import ExitFeedbackModal from '../components/common/ExitFeedbackModal.jsx';
import { selectCurrentUser } from '../redux/authSlice.js';

export const UserLayout = () => {
  const user = useSelector(selectCurrentUser);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const location = useLocation();
  const isAiPage = location.pathname.startsWith('/ai-assistant');

  // Exit-intent detection for first-time users before leaving the app
  useEffect(() => {
    // Only prompt if not previously submitted or dismissed
    const isFeedbackDone = localStorage.getItem('studix_feedback_done') === 'true';
    if (isFeedbackDone) return;

    let hasPrompted = false;

    // Desktop exit-intent detection: cursor moving towards window top / tab bar
    const handleMouseLeave = (e) => {
      if (hasPrompted) return;
      if (e.clientY <= 15) {
        hasPrompted = true;
        setIsFeedbackOpen(true);
      }
    };

    document.documentElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className={`min-h-screen flex flex-col bg-dark-base text-slate-100 selection:bg-brand-500 selection:text-white ${isAiPage ? 'h-screen h-[100dvh] overflow-hidden' : ''}`}>
      {/* Top Navigation */}
      <Navbar onOpenSupport={() => setIsSupportOpen(true)} />

      {/* Main Content Area with Mobile Safe Bottom Padding */}
      <main className={`flex-1 w-full mx-auto ${isAiPage ? 'max-w-7xl px-2 sm:px-4 py-1 sm:py-2 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-2' : 'max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 md:pb-8'}`}>
        <Outlet />
      </main>

      {/* Floating Quick Support Launcher (Discreet & accessible across pages) */}
      {!isAiPage && (
        <aside aria-label="Support and feedback quick actions" className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30 flex flex-col items-end space-y-2">
          {/* Quick First-Time Feedback Pill (Only if not done yet) */}
          {localStorage.getItem('studix_feedback_done') !== 'true' && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold shadow-lg backdrop-blur-md flex items-center space-x-1.5 transition-transform hover:scale-105 cursor-pointer animate-fade-in"
              title="Leave quick feedback"
            >
              <MessageSquareHeart className="w-3.5 h-3.5 text-amber-400" />
              <span>Feedback</span>
            </button>
          )}

          {/* Student Support Chat Floating Trigger */}
          <button
            onClick={() => setIsSupportOpen(true)}
            id="floating-support-btn"
            className="group px-3.5 py-2 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-brand-500/25 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 border border-brand-400/30 cursor-pointer"
            title="Chat with Admin Shiva Chaitanya"
          >
            <div className="relative">
              <Headphones className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse ring-2 ring-brand-700" />
            </div>
            <span className="hidden sm:inline">Student Support</span>
          </button>
        </aside>
      )}

      {/* Mobile-First Floating Bottom Navigation Bar */}
      <MobileBottomNav onOpenSettings={() => setIsSettingsOpen(true)} />

      {/* Global Settings & Password Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      {/* Student Support & Admin Live Chat Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        user={user}
      />

      {/* First-Time User Exit Feedback Modal */}
      <ExitFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        user={user}
      />

      {/* Footer with Developer Attribution (Hidden on AI Chat to provide rock-solid full-height stable chat) */}
      {!isAiPage && (
        <footer className="border-t border-dark-border py-6 sm:py-8 text-slate-400 text-xs text-center pb-20 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-300">
                © 2026 Studix. Developed by <span className="text-brand-400 font-bold">Shiva Chaitanya</span>. All rights reserved.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <button
                onClick={() => setIsSupportOpen(true)}
                className="text-brand-400 hover:text-brand-300 font-bold cursor-pointer transition-colors"
              >
                Help & Support
              </button>
              <span className="text-slate-500">•</span>
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
      )}
    </div>
  );
};

export default UserLayout;
