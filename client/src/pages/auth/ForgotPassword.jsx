import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { forgotPasswordAction, clearError, selectAuthLoading, selectAuthError } from '../../redux/authSlice.js';

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    const result = await dispatch(forgotPasswordAction(email));
    if (forgotPasswordAction.fulfilled.match(result)) {
      setIsSubmitted(true);
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
        <Link
          to="/login"
          onClick={() => dispatch(clearError())}
          className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white auth-link mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
        <h2 className="text-2xl font-black tracking-tight text-white auth-heading">Reset Password</h2>
        <p className="text-sm text-slate-400 auth-subtext mt-1">
          Enter your registered university email to receive a password reset recovery link.
        </p>
      </div>

      {authError && (
        <div className="mb-5 p-3.5 rounded-xl auth-error-banner bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      {isSubmitted ? (
        <div className="p-6 rounded-2xl bg-dark-base auth-tab-container border border-dark-border text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white auth-heading">Check Your Inbox</h3>
            <p className="text-xs text-slate-400 auth-subtext mt-1">
              We have dispatched recovery instructions to <span className="text-slate-200 font-semibold">{email}</span>.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-block px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-glow"
          >
            Return to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 auth-label uppercase tracking-wider mb-2">
              University Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 auth-input-icon">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                required
                className="w-full pl-10 pr-4 py-3 auth-input bg-dark-base border border-dark-border rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-glow disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Send Reset Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPassword;
