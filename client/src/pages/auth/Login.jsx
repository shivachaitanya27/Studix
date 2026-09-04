import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle, GraduationCap, KeyRound, Check } from 'lucide-react';

import { loginUser, clearError, selectAuthLoading, selectAuthError } from '../../redux/authSlice.js';
import { syncFromUser } from '../../redux/academicSlice.js';
import { supabase } from '../../services/supabaseClient.js';
import { isCollegeEmail, getCollegeEmailErrorMessage, SUPER_ADMIN_EMAIL } from '../../utils/emailValidation.js';

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [loginRole, setLoginRole] = useState('STUDENT'); // 'STUDENT' | 'ADMIN'
  const [formData, setFormData] = useState(() => {
    try {
      const remembered = localStorage.getItem('studix_remembered_creds');
      if (remembered) {
        const parsed = JSON.parse(remembered);
        return {
          email: parsed.email || '',
          password: parsed.password || '',
          rememberMe: true,
        };
      }
    } catch (e) {
      // ignore
    }
    return {
      email: '',
      password: '',
      rememberMe: true,
    };
  });
  const [hasSavedCreds, setHasSavedCreds] = useState(() => {
    return Boolean(localStorage.getItem('studix_remembered_creds'));
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleClearSavedCreds = () => {
    localStorage.removeItem('studix_remembered_creds');
    setFormData({ email: '', password: '', rememberMe: false });
    setHasSavedCreds(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationError) setValidationError('');
    if (authError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setValidationError('Please enter both email and password.');
      return;
    }

    const cleanEmail = (formData.email || '').toLowerCase().trim();
    const isSuperAdmin = cleanEmail === SUPER_ADMIN_EMAIL;

    // Strict institutional domain gating
    if (!isSuperAdmin && !isCollegeEmail(cleanEmail)) {
      setValidationError(getCollegeEmailErrorMessage());
      return;
    }

    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      // Save credentials if rememberMe is enabled
      if (formData.rememberMe) {
        try {
          localStorage.setItem(
            'studix_remembered_creds',
            JSON.stringify({
              email: formData.email,
              password: formData.password,
            })
          );
        } catch (err) {
          console.warn('Could not save login credentials', err);
        }
      } else {
        localStorage.removeItem('studix_remembered_creds');
      }

      const user = result.payload.user;
      dispatch(syncFromUser(user));

      const isAuthorizedAdmin =
        (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
        (user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

      if (loginRole === 'ADMIN') {
        if (isAuthorizedAdmin) {
          navigate('/admin');
          return;
        } else {
          setValidationError(
            'Access Restricted: Only the authorized administrator (vshivachaitanya7@gmail.com) can access the Admin Portal.'
          );
          return;
        }
      }

      if (isAuthorizedAdmin) {
        navigate('/admin');
      } else if (!user.isOnboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full auth-card bg-dark-card/90 border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
    >
      {/* Role Portal Selector Tabs */}
      <div className="grid grid-cols-2 gap-2 p-1.5 auth-tab-container bg-dark-base/90 border border-dark-border rounded-2xl mb-6 shadow-inner">
        <button
          type="button"
          id="tab-student-login"
          onClick={() => {
            setLoginRole('STUDENT');
            if (validationError) setValidationError('');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            loginRole === 'STUDENT'
              ? 'bg-brand-600 text-white shadow-glow'
              : 'text-slate-400 hover:text-slate-200 auth-inactive-student-tab'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Portal</span>
        </button>

        <button
          type="button"
          id="tab-admin-login"
          onClick={() => {
            setLoginRole('ADMIN');
            if (validationError) setValidationError('');
          }}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
            loginRole === 'ADMIN'
              ? 'bg-purple-600 text-white shadow-glow border border-purple-400/40'
              : 'text-purple-400/80 hover:text-purple-300 auth-inactive-admin-tab'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-300" />
          <span>Admin Portal</span>
        </button>
      </div>

      <div className="mb-6">
        {loginRole === 'ADMIN' ? (
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full auth-admin-badge bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Restricted Admin Portal • Faculty & Deans</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white auth-heading">Admin Operating Sign In</h2>
            <p className="text-sm text-slate-400 auth-subtext mt-1">
              Enter your verified administrator credentials to access the moderation console.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white auth-heading">Welcome Back</h2>
            <p className="text-sm text-slate-400 auth-subtext mt-1">
              Sign in to access your college repository and AI tools.
            </p>
          </div>
        )}
      </div>

      {/* First-time registration banner */}
      <div className="mb-5 p-3 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-between text-xs text-slate-300">
        <span className="text-[11px] text-slate-300">
          First time here? <strong className="text-white">Create an account first</strong> before logging in.
        </span>
        <Link
          to="/signup"
          state={{ email: formData.email }}
          className="text-xs font-bold text-brand-300 hover:text-white px-3 py-1.5 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 transition-all flex items-center space-x-1 flex-shrink-0 ml-2"
        >
          <span>Sign Up</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Account Not Found Notice with Direct Sign Up CTA */}
      {authError && (authError.toLowerCase().includes('create an account first') || authError.toLowerCase().includes('no account found')) ? (
        <div className="mb-5 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs space-y-3 shadow-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-amber-300 block text-sm mb-0.5">Account Not Found</span>
              <p className="text-slate-300 leading-relaxed">
                No registered account exists for <span className="font-mono text-amber-200 font-bold">{formData.email}</span>. First-time users must create an account first before logging in.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/signup', { state: { email: formData.email } })}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-glow transition-all cursor-pointer"
          >
            <span>Create Account First (Sign Up)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (authError || validationError) ? (
        <div className="mb-5 p-3.5 rounded-xl auth-error-banner bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{authError || validationError}</span>
        </div>
      ) : null}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-2">
            Campus Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              id="login-email-input"
              value={formData.email}
              onChange={handleChange}
              placeholder={loginRole === 'ADMIN' ? 'vshivachaitanya7@gmail.com' : 'yourname@dsuniversity.ac.in'}
              required
              className="w-full pl-10 pr-4 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400 flex items-center space-x-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-400"></span>
            <span>
              {loginRole === 'ADMIN'
                ? 'Designated Super Admin sign-in'
                : 'Exclusively for verified university accounts (@dsuniversity.ac.in)'}
            </span>
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-brand-400 hover:text-brand-300 auth-link font-semibold transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="login-password-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 auth-input-icon"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-dark-border bg-dark-base text-brand-500 auth-checkbox focus:ring-brand-500 focus:ring-offset-0"
            />
            <span className="text-xs text-slate-400 auth-checkbox-label font-medium">Remember my credentials</span>
          </label>

          {hasSavedCreds && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-bold">
              <KeyRound className="w-3 h-3" />
              <span>Saved Login Active</span>
              <button
                type="button"
                onClick={handleClearSavedCreds}
                className="text-rose-400 hover:text-rose-300 ml-1 underline cursor-pointer"
                title="Forget saved credentials"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          id="login-submit-btn"
          disabled={isLoading}
          className={`w-full mt-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 ${
            loginRole === 'ADMIN'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-900/30'
              : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400'
          }`}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {loginRole === 'ADMIN' && <ShieldCheck className="w-4 h-4 text-purple-200" />}
              <span>{loginRole === 'ADMIN' ? 'Access Admin Operating Panel' : 'Sign In to Studix'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 auth-footer-text">
        Don&apos;t have an account yet?{' '}
        <Link to="/signup" className="text-brand-400 hover:text-brand-300 auth-link font-bold ml-1">
          Create Account
        </Link>
      </div>
    </motion.div>
  );
};

export default Login;
