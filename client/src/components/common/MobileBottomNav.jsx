import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard,
  FolderArchive,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const MobileBottomNav = ({ onOpenSettings }) => {
  const location = useLocation();
  const user = useSelector(selectCurrentUser);

  const isAuthorizedAdmin =
    (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
    (user?.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

  const navItems = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      id: 'mobile-nav-dashboard',
    },
    {
      to: '/repository',
      label: 'Repository',
      icon: FolderArchive,
      id: 'mobile-nav-repository',
    },
    {
      to: '/ai-assistant',
      label: 'AI Solver',
      icon: Sparkles,
      highlight: true,
      id: 'mobile-nav-ai',
    },
  ];

  if (isAuthorizedAdmin) {
    navItems.push({
      to: '/admin',
      label: 'Admin',
      icon: ShieldCheck,
      adminOnly: true,
      id: 'mobile-nav-admin',
    });
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-bg/95 dark:bg-[#111625]/95 bg-white/95 backdrop-blur-xl border-t border-dark-border/80 px-2 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.3)] dark:shadow-[0_-8px_25px_rgba(0,0,0,0.7)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              className={`group flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative cursor-pointer active:scale-95 ${
                isActive
                  ? item.highlight
                    ? 'text-amber-400 font-extrabold'
                    : item.adminOnly
                    ? 'text-purple-400 font-extrabold'
                    : 'text-brand-400 font-extrabold'
                  : 'text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 font-semibold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 group-hover:scale-110 ${
                  isActive
                    ? item.highlight
                      ? 'bg-amber-400/20 shadow-glow text-amber-300 neu-pressed'
                      : item.adminOnly
                      ? 'bg-purple-500/20 text-purple-300 neu-pressed'
                      : 'bg-brand-500/20 shadow-glow text-brand-300 neu-pressed'
                    : 'group-hover:text-brand-400'
                }`}
              >
                <Icon className="w-5 h-5 transition-transform" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-bold">
                {item.label}
              </span>

              {/* Theme-Aware Active Glow Dot */}
              {isActive && (
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-0.5 animate-pulse ${
                    item.highlight
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                      : item.adminOnly
                      ? 'bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
                      : 'bg-brand-400 shadow-[0_0_8px_rgba(92,115,248,0.8)]'
                  }`}
                />
              )}
            </NavLink>
          );
        })}

        {/* Profile / Settings Button */}
        <button
          type="button"
          id="mobile-nav-profile-settings"
          onClick={onOpenSettings}
          className="group flex flex-col items-center justify-center py-1 px-3 rounded-2xl text-slate-400 hover:text-brand-400 hover:bg-brand-500/10 transition-all duration-200 font-semibold active:scale-95 cursor-pointer"
        >
          <div className="p-1.5 rounded-xl transition-all duration-200 group-hover:scale-110 group-hover:text-brand-400">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
