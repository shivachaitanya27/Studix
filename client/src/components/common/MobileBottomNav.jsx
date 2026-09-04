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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-3 py-1.5 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <nav className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all relative ${
                isActive
                  ? item.highlight
                    ? 'text-amber-400 font-extrabold'
                    : item.adminOnly
                    ? 'text-purple-400 font-extrabold'
                    : 'text-brand-400 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive
                    ? item.highlight
                      ? 'bg-amber-400/15 shadow-glow'
                      : item.adminOnly
                      ? 'bg-purple-500/20'
                      : 'bg-brand-500/20 shadow-glow'
                    : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">
                {item.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    item.highlight
                      ? 'bg-amber-400'
                      : item.adminOnly
                      ? 'bg-purple-400'
                      : 'bg-brand-400'
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
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl text-slate-400 hover:text-slate-200 transition-all font-medium"
        >
          <div className="p-1 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default MobileBottomNav;
