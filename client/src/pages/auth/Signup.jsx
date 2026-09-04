import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { signupUser, clearError, selectAuthLoading, selectAuthError } from '../../redux/authSlice.js';
import { supabase } from '../../services/supabaseClient.js';
import { isCollegeEmail, getCollegeEmailErrorMessage } from '../../utils/emailValidation.js';

export const Signup = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError('');
    if (authError) dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password) {
      setValidationError('Please fill in all required fields.');
      return;
    }
    if (!isCollegeEmail(formData.email)) {
      setValidationError(getCollegeEmailErrorMessage());
      return;
    }
    if (formData.password.length < 6) {

      setValidationError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    const result = await dispatch(
      signupUser({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })
    );

    if (signupUser.fulfilled.match(result)) {
      // Direct user straight to Multi-Tenant Onboarding flow
      navigate('/onboarding');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full auth-card bg-dark-card/90 border border-dark-border rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all"
    >
      <div className="mb-6">
        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-brand-500/15 text-brand-300 text-[11px] font-semibold mb-2">
          <Sparkles className="w-3 h-3 text-brand-400" />
          <span>Quick 30-Second Setup</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white auth-heading">Create Studix Account</h2>
        <p className="text-sm text-slate-400 auth-subtext mt-1">
          Join thousands of engineering students sharing verified notes & exam papers.
        </p>
      </div>

      {/* Error Notice */}
      {(authError || validationError) && (
        <div className="mb-5 p-3.5 rounded-xl auth-error-banner bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{authError || validationError}</span>
        </div>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="fullName"
              id="signup-fullname-input"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Alex Rivera"
              required
              className="w-full pl-10 pr-4 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-1.5">
            University / College Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              name="email"
              id="signup-email-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. yourname@college.edu or .ac.in"
              required
              className="w-full pl-10 pr-4 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
          <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-1.5 flex items-center space-x-1 font-medium">
            <span>⚠️ Official college email required (.edu, .ac.in). Personal Gmail/Yahoo accounts are rejected.</span>
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-1.5">
            Password (min 6 characters)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              id="signup-password-input"
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

        <div>
          <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              id="signup-confirmpassword-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-4 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          id="signup-submit-btn"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Create Account & Continue to Stream Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400 auth-footer-text">
        Already have a Studix account?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 auth-link font-bold ml-1">
          Sign In
        </Link>
      </div>
    </motion.div>
  );
};

export default Signup;
