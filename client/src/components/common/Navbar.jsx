import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  Pencil,
  Menu,
  X,
  Headphones,
  LayoutDashboard,
  Palette,
  Moon,
  Sun,
  Globe,
  Check,
  Building2,
  School,
} from 'lucide-react';
import { logout, selectCurrentUser, uploadUserAvatar } from '../../redux/authSlice.js';
import { resetAiState } from '../../redux/aiSlice.js';
import { supabase } from '../../services/supabaseClient.js';

import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
} from '../../redux/academicSlice.js';
import ThemeSwitcher, { THEMES } from './ThemeSwitcher.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import SettingsModal from './SettingsModal.jsx';

export const Navbar = ({ onOpenSupport }) => {
  const { t, i18n } = useTranslation();
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
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('stream');
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
    dispatch(resetAiState());
    navigate('/login', { replace: true });
  };


  const hasAcademicContext = Boolean(college && department && year && semester);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#111625]/95 backdrop-blur-md transition-colors border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl neu-button flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform shadow-md border border-brand-500/20">
              <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight brand-title-text">
                STUDIX
              </span>

              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-extrabold tracking-wider uppercase neu-pressed text-brand-300 rounded-lg">
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

            {/* Admin Operating System Launcher (Exclusively for authorized admin vshivachaitanya7@gmail.com) */}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
              (user?.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com' && (
                <a
                  href={import.meta.env.VITE_ADMIN_APP_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5175' : '/admin')}
                  target={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  id="nav-admin-link"
                  className="px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 neu-button text-purple-400 hover:text-white border-purple-500/40 bg-purple-500/10 hover:bg-purple-600/30 shadow-sm cursor-pointer"
                  title="Launch Dedicated Admin OS Command Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin OS ↗</span>
                </a>
              )}
          </nav>
        </div>

        {/* Desktop Right Controls: Language, Theme, Profile, Settings, and Logout (Hidden on mobile) */}
        <div className="hidden md:flex items-center space-x-2 sm:space-x-3">
          {/* Active Enrolled College Badge (Strictly Locked / Read-Only) */}
          {hasAcademicContext && (
            <div
              id="navbar-context-pill"
              className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-2xl neu-pressed text-xs text-slate-300 select-none"
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
                        alt={user?.full_name || 'Profile'}
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

            {/* Student Support & Help Button */}
            <button
              onClick={() => {
                if (onOpenSupport) onOpenSupport();
              }}
              id="navbar-open-support-btn"
              title="Help & Student Support (Chat with Admin)"
              className="p-2.5 rounded-xl neu-button text-slate-400 hover:text-brand-400 hover:border-brand-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-brand-400" />
              <span className="hidden xl:inline text-xs font-bold text-slate-300">Support</span>
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={() => {
                setSettingsInitialTab('security');
                setIsSettingsOpen(true);
              }}
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
                              alt={user?.full_name || 'Profile'}
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
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-amber-500 dark:text-amber-400">
                            Year {year}, Semester {semester}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsProfileMenuOpen(false);
                              setSettingsInitialTab('stream');
                              setIsSettingsOpen(true);
                            }}
                            className="p-1 rounded-lg neu-button text-amber-400 hover:text-white"
                            title="Edit Year & Semester"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Admin-Only: Change Department & Change College Controls */}
                  {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setSettingsInitialTab('stream');
                          setIsSettingsOpen(true);
                        }}
                        id="profile-dropdown-dept-btn"
                        className="py-2 px-2.5 rounded-xl neu-button text-[11px] font-bold text-brand-600 dark:text-brand-300 hover:text-white flex items-center justify-center space-x-1 border border-brand-500/30 transition-all bg-brand-500/5 hover:bg-brand-500/15 cursor-pointer"
                      >
                        <Building2 className="w-3 h-3 text-brand-400" />
                        <span>Change Dept</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          setSettingsInitialTab('stream');
                          setIsSettingsOpen(true);
                        }}
                        id="profile-dropdown-college-btn"
                        className="py-2 px-2.5 rounded-xl neu-button text-[11px] font-bold text-accent-cyan hover:text-white flex items-center justify-center space-x-1 border border-accent-cyan/30 transition-all bg-cyan-500/5 hover:bg-cyan-500/15 cursor-pointer"
                      >
                        <School className="w-3 h-3 text-accent-cyan" />
                        <span>Change College</span>
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setSettingsInitialTab('stream');
                      setIsSettingsOpen(true);
                    }}
                    id="profile-dropdown-stream-btn"
                    className="w-full py-2 px-3 rounded-xl neu-button text-xs font-bold text-amber-500 dark:text-amber-300 hover:text-white flex items-center justify-center space-x-2 border border-amber-500/40 transition-all bg-amber-500/5 hover:bg-amber-500/15 cursor-pointer"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Change Stream (Year & Sem)</span>
                  </button>

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

                  {/* Student Support & Admin Chat */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onOpenSupport) onOpenSupport();
                    }}
                    id="profile-dropdown-support-btn"
                    className="w-full py-2 px-3 rounded-xl neu-button text-xs font-semibold text-brand-600 dark:text-brand-300 hover:text-white flex items-center justify-center space-x-2 transition-all border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/15 cursor-pointer"
                  >
                    <Headphones className="w-3.5 h-3.5 text-brand-400" />
                    <span>Student Support & Admin Chat</span>
                  </button>

                  {/* Account & Security Settings */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setSettingsInitialTab('security');
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

        {/* Mobile Right Navigation Menu Trigger */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          id="mobile-top-nav-drawer-btn"
          className="flex md:hidden items-center space-x-2 px-3 py-1.5 rounded-2xl neu-button border border-brand-500/40 text-slate-800 dark:text-slate-100 hover:text-brand-500 dark:hover:text-brand-300 shadow-md transition-all cursor-pointer group"
          title="Open Navigation Menu"
        >
          <div className="relative w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center neu-pressed border border-brand-500/30">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-black text-xs">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            {(avatarPreview || user?.avatar_url) && (
              <img
                src={avatarPreview || user?.avatar_url}
                alt={user?.full_name || 'Profile'}
                className="relative z-10 w-full h-full object-cover rounded-xl"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex flex-col text-left mr-0.5">
            <span className="text-[11px] font-black text-slate-800 dark:text-slate-100 leading-none">Menu</span>
            <span className="text-[8px] font-extrabold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Studix</span>
          </div>
          <Menu className="w-4 h-4 text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Right-Side Mobile Navigation Slide-Over Drawer - Portaled directly to body to avoid header containing-block trap */}
      {typeof document !== 'undefined' && isMobileDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[99999] md:hidden">
          {/* Full Screen Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Full Height Drawer from Right with safe padding */}
          <div className="fixed inset-y-0 right-0 w-[86%] max-w-sm bg-white dark:bg-[#111625] text-slate-900 dark:text-slate-100 pt-7 pb-8 px-4 flex flex-col justify-between overflow-y-auto shadow-2xl border-l border-slate-200 dark:border-slate-800 animate-slide-left z-[100000] space-y-4">
            <div className="space-y-4">
              {/* Drawer Header - safe from notch & browser address bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 pt-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl neu-button text-brand-500 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">STUDIX</span>
                    <span className="block text-[10px] text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider">Navigation Menu</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  id="mobile-drawer-close-btn"
                  className="p-2 rounded-xl neu-button text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Profile Header in Drawer */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center space-x-3">
                <div
                  onClick={() => {
                    avatarInputRef.current?.click();
                  }}
                  className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 neu-button cursor-pointer border border-brand-500/30"
                  title="Change profile photo"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-black text-sm">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  {(avatarPreview || user?.avatar_url) && (
                    <img
                      src={avatarPreview || user?.avatar_url}
                      alt={user?.full_name || 'Profile'}
                      className="relative z-10 w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.full_name || 'Student'}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-300 border border-brand-500/20">
                    {user?.role === 'ADMIN' ? 'Admin Access' : 'Verified Campus Student'}
                  </span>
                </div>
              </div>

              {/* Academic Stream & Campus Controls Card (Change Department, College, Stream) */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Campus Stream</span>
                  <span className="text-[10px] font-bold text-accent-emerald flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                    Enrolled
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {college?.name || college?.code || 'University'}
                  </p>
                  <p className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold truncate mt-0.5">
                    {department?.name || department?.code || 'Academic Branch'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Year {year || 1} • Sem {semester || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      setSettingsInitialTab('stream');
                      setIsSettingsOpen(true);
                    }}
                    id="mobile-drawer-change-stream-btn"
                    className="px-2.5 py-1 rounded-lg neu-button text-[10px] font-bold text-amber-600 dark:text-amber-300 flex items-center space-x-1 border border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    <span>Change Stream</span>
                  </button>
                </div>

                {/* Admin-Only Quick Action Options: Change Department & Change College */}
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-700/60">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setSettingsInitialTab('stream');
                        setIsSettingsOpen(true);
                      }}
                      id="mobile-drawer-change-dept-btn"
                      className="px-2 py-1.5 rounded-xl neu-button text-[10px] font-bold text-brand-600 dark:text-brand-300 hover:text-brand-700 dark:hover:text-white flex items-center justify-center space-x-1 border border-brand-500/30 hover:bg-brand-500/10 cursor-pointer"
                    >
                      <Building2 className="w-3 h-3 text-brand-500 flex-shrink-0" />
                      <span className="truncate">Change Dept</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileDrawerOpen(false);
                        setSettingsInitialTab('stream');
                        setIsSettingsOpen(true);
                      }}
                      id="mobile-drawer-change-college-btn"
                      className="px-2 py-1.5 rounded-xl neu-button text-[10px] font-bold text-accent-cyan hover:text-cyan-600 dark:hover:text-white flex items-center justify-center space-x-1 border border-accent-cyan/30 hover:bg-accent-cyan/10 cursor-pointer"
                    >
                      <School className="w-3 h-3 text-accent-cyan flex-shrink-0" />
                      <span className="truncate">Change College</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links in Drawer */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">Pages</p>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
                    location.pathname === '/dashboard'
                      ? 'neu-tab-active text-brand-600 dark:text-brand-300 font-black'
                      : 'neu-button text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/repository"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
                    location.pathname === '/repository'
                      ? 'neu-tab-active text-brand-600 dark:text-brand-300 font-black'
                      : 'neu-button text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white'
                  }`}
                >
                  <FolderArchive className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                  <span>Academic Repository</span>
                </Link>
                <Link
                  to="/ai-assistant"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-all ${
                    location.pathname === '/ai-assistant'
                      ? 'neu-tab-active text-amber-600 dark:text-amber-300 font-black'
                      : 'neu-button text-slate-700 dark:text-slate-200 hover:text-amber-500 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  <span>AI Exam Solver</span>
                </Link>
                {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') &&
                  (user?.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com' && (
                    <a
                      href={import.meta.env.VITE_ADMIN_APP_URL || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5175' : '/admin')}
                      target={typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '_blank' : '_self'}
                      rel="noopener noreferrer"
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 neu-button text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-500" />
                      <span>Admin OS ↗</span>
                    </a>
                  )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    if (onOpenSupport) onOpenSupport();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 neu-button text-brand-600 dark:text-brand-300 hover:text-white"
                >
                  <Headphones className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                  <span>Student Support & Chat</span>
                </button>
              </div>

              {/* Multilingual & Theme Controls in Drawer */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-accent-cyan" />
                    <span>Language</span>
                  </p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { code: 'en', label: 'English' },
                      { code: 'te', label: 'తెలుగు' },
                      { code: 'ta', label: 'தமிழ்' },
                    ].map((lng) => {
                      const isSelected = i18n.language === lng.code;
                      return (
                        <button
                          key={lng.code}
                          type="button"
                          onClick={() => i18n.changeLanguage(lng.code)}
                          className={`py-1.5 px-2 rounded-xl text-[11px] font-bold text-center transition-all cursor-pointer ${
                            isSelected
                              ? 'neu-pressed text-brand-600 dark:text-brand-300 border border-brand-500/40 font-black'
                              : 'neu-button text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {lng.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />
                    <span>Theme & Colors</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {THEMES.map((th) => (
                      <button
                        key={th.id}
                        type="button"
                        onClick={() => {
                          const isLight = th.id === 'neu-soft-minimal';
                          document.documentElement.className = isLight ? 'neu-soft-minimal light' : `${th.id} dark`;
                          localStorage.setItem('studix_theme', th.id);
                        }}
                        className="py-1.5 px-2.5 rounded-xl neu-button text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center space-x-2 cursor-pointer"
                      >
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: th.color }} />
                        <span className="truncate">{th.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings & Logout in Drawer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setSettingsInitialTab('security');
                  setIsSettingsOpen(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl neu-button text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-brand-500 dark:hover:text-white flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Settings className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <span>Password & Settings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full py-2.5 px-3 rounded-xl neu-button text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center space-x-2 border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Account & App Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        initialTab={settingsInitialTab}
      />

      {/* Logout Confirmation Modal - Portaled to body */}
      {typeof document !== 'undefined' && showLogoutConfirm && createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#151926] p-6 z-10 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
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
        </div>,
        document.body
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
