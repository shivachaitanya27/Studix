import React, { useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap,
  LogOut,
  Sliders,
  User,
  Sparkles,
  BookOpen,
  FileText,
  Bookmark,
  FolderArchive,
  Upload,
  ShieldCheck,
  Camera,
  Loader2,
  ChevronDown,
  Mail,
  Building,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { logout, selectCurrentUser, uploadUserAvatar } from '../../redux/authSlice.js';
import { supabase } from '../../services/supabaseClient.js';

import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
} from '../../redux/academicSlice.js';
import ThemeSwitcher from './ThemeSwitcher.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import SettingsModal from './SettingsModal.jsx';

export const Navbar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector(selectCurrentUser);
  const college = useSelector(selectSelectedCollege);
  const department = useSelector(selectSelectedDepartment);
  const year = useSelector(selectSelectedYear);
  const semester = useSelector(selectSelectedSemester);

  const avatarInputRef = useRef(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarToast, setAvatarToast] = useState('');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant optimistic preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setIsAvatarUploading(true);
      await dispatch(uploadUserAvatar(file)).unwrap();
      setAvatarToast('Profile photo updated successfully!');
      setTimeout(() => setAvatarToast(''), 3500);
    } catch (err) {
      setAvatarPreview(null);
      setAvatarToast(typeof err === 'string' ? err : (err?.message || 'Failed to update photo'));
      setTimeout(() => setAvatarToast(''), 4500);
    } finally {
      setIsAvatarUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const confirmLogout = async () => {
    setShowLogoutConfirm(false);
    setIsProfileMenuOpen(false);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase logout notice:', err);
    }
    dispatch(logout());
    navigate('/login', { replace: true });
  };


  const hasAcademicContext = Boolean(college && department && year && semester);

  return (
    <header className="sticky top-0 z-40 w-full neu-flat backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3 sm:space-x-5">
          <Link to="/dashboard" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl neu-button flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-black tracking-tight brand-title-text">
                STUDIX
              </span>

              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wider uppercase neu-pressed text-brand-300 rounded">
                NEU
              </span>
            </div>
          </Link>

          {/* Nav links with tactile states */}
          <nav className="hidden md:flex items-center space-x-1.5">
            <Link
              to="/dashboard"
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                location.pathname === '/dashboard'
                  ? 'neu-tab-active text-white'
                  : 'neu-button text-slate-400 hover:text-white'
              }`}
            >
              {t('nav.dashboard')}
            </Link>

            <Link
              to="/repository"
              id="nav-repository-link"
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                location.pathname === '/repository'
                  ? 'neu-tab-active text-brand-300'
                  : 'neu-button text-slate-400 hover:text-white'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-brand-400" />
              <span>{t('nav.repository')}</span>
            </Link>

            <Link
              to="/ai-assistant"
              id="nav-ai-assistant-link"
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                location.pathname === '/ai-assistant'
                  ? 'neu-tab-active text-amber-300'
                  : 'neu-button text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('nav.aiSolver')}</span>
            </Link>

            {/* Admin Operating System Link (Exclusively for authorized admin vshivachaitanya7@gmail.com) */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
              (user?.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com' && (
                <Link
                  to="/admin"
                  id="nav-admin-link"
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 ${
                    location.pathname === '/admin'
                      ? 'neu-tab-active text-purple-300'
                      : 'neu-button text-purple-400 hover:text-white border-purple-500/40'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{t('nav.admin')}</span>
                </Link>
              )}
          </nav>
        </div>

        {/* Right: Academic Context Pill, Language Switcher, Theme Switcher, and Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Active Enrolled College Badge (Strictly Locked / Read-Only) */}
          {hasAcademicContext && (
            <div
              id="navbar-context-pill"
              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl neu-pressed text-xs text-slate-300 select-none"
              title="Verified Enrolled Institution (Permanent)"
            >
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span className="font-extrabold text-brand-300">{college.code}</span>
              <span className="text-slate-500">•</span>
              <span className="font-semibold">{department.code}</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">
                Y{year} S{semester}
              </span>
            </div>
          )}

          {/* Multilingual Switcher (English, Telugu, Tamil) */}
          <LanguageSwitcher />


          {/* User-Defined Neumorphic Theme Switcher */}
          <ThemeSwitcher />


          {/* User Profile Capsule with Interactive Settings & Logout Menu */}
          <div className="relative flex items-center space-x-2">
            <input
              type="file"
              ref={avatarInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
              id="user-avatar-file-input"
            />

            {/* Profile Capsule Trigger */}
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl neu-pressed cursor-pointer hover:border-brand-500/40 transition-all select-none group"
              title="Account Profile & Settings"
            >
              <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center neu-button border border-brand-500/20">
                {isAvatarUploading ? (
                  <div className="w-full h-full bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 text-brand-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-black text-[11px]">
                      {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                    </div>
                    {(avatarPreview || user?.avatar_url) && (
                      <img
                        src={avatarPreview || user?.avatar_url}
                        alt={user.full_name || 'Profile'}
                        className="relative z-10 w-full h-full object-cover rounded-lg"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col text-left">
                <span className="hidden sm:inline text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[90px] truncate leading-tight">
                  {user?.full_name || 'Student'}
                </span>
                <span className="hidden sm:inline text-[9px] font-extrabold text-brand-400">
                  {user?.role === 'ADMIN' ? 'Admin' : 'Verified'}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  isProfileMenuOpen ? 'rotate-180 text-brand-400' : ''
                }`}
              />
            </div>

            {/* Settings Modal Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              id="navbar-open-settings-btn"
              title="Account & System Settings"
              className="p-2.5 rounded-xl neu-button text-slate-400 hover:text-brand-400 hover:border-brand-500/30 transition-all"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              id="navbar-quick-logout-btn"
              title="Log Out"
              className="p-2.5 rounded-xl neu-button text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Full User Profile & Logout Settings Popover */}
            {isProfileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileMenuOpen(false)}
                />
                <div className="absolute right-0 top-12 w-72 p-4 rounded-2xl neu-flat z-50 animate-fade-in space-y-3.5 shadow-2xl border border-slate-200 dark:border-slate-800">
                  {/* User Profile Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div
                      onClick={() => avatarInputRef.current?.click()}
                      title="Click to change profile photo"
                      className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 neu-button cursor-pointer group border-2 border-brand-500/30"
                    >
                      {isAvatarUploading ? (
                        <div className="w-full h-full bg-black/60 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-black text-lg">
                            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                          </div>
                          {(avatarPreview || user?.avatar_url) && (
                            <img
                              src={avatarPreview || user?.avatar_url}
                              alt={user.full_name || 'Profile'}
                              className="relative z-10 w-full h-full object-cover rounded-xl"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                        </>
                      )}
                      <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {user?.full_name || 'Scholar'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{user?.email}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          {user?.role === 'ADMIN' ? 'Admin Access' : 'Verified Student'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Academic Context Details */}
                  <div className="p-2.5 rounded-xl neu-pressed text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Campus:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {college?.name || college?.code || 'Enrolled Campus'}
                      </span>
                    </div>
                    {department?.name && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Department:</span>
                        <span className="font-semibold text-brand-500 dark:text-brand-300">
                          {department.name}
                        </span>
                      </div>
                    )}
                    {year && semester && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400">Class:</span>
                        <span className="font-bold text-amber-500 dark:text-amber-400">
                          Year {year}, Semester {semester}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Action: Change Photo */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={isAvatarUploading}
                    className="w-full py-2 px-3 rounded-xl neu-button text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-400 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-brand-400" />
                    <span>{isAvatarUploading ? 'Uploading...' : 'Change Profile Photo'}</span>
                  </button>

                  {/* Account & Security Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    id="profile-dropdown-settings-btn"
                    className="w-full py-2 px-3 rounded-xl neu-button text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-400 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Settings className="w-3.5 h-3.5 text-brand-400" />
                    <span>Change Password & Settings</span>
                  </button>

                  {/* Improved Logout Setting */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                      id="navbar-profile-logout-btn"
                      className="w-full py-2.5 px-3 rounded-xl neu-button text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all flex items-center justify-center space-x-2 border border-rose-500/30 group cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                      <span>Log Out of Account</span>
                    </button>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center mt-1.5">
                      Session and permissions will be securely terminated.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Account & App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
      />

      {/* Logout Confirmation Permission Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl neu-flat bg-white dark:bg-[#151926] p-6 z-10 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto neu-button flex items-center justify-center text-rose-500 border border-rose-500/30 bg-rose-500/10">
              <LogOut className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Log Out of Studix?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Are you sure you want to log out? You will need to sign in again to access verified campus streams.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                id="logout-cancel-btn"
                className="py-2.5 px-4 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                id="logout-confirm-btn"
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Photo Toast Notification */}
      {avatarToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-brand-500/40 flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{avatarToast}</span>
        </div>
      )}
    </header>
  );
};

export default Navbar;
