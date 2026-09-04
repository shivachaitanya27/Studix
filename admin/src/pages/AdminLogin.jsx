import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Activity,
  AlertCircle
} from 'lucide-react';
import api, { setAdminSession } from '../services/api.js';

export const AdminLogin = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('vshivachaitanya7@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail !== 'vshivachaitanya7@gmail.com') {
      setErrorMsg('Access Denied: This administrative terminal is strictly restricted to master administrator Shiva Chaitanya.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your administrative security password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: cleanEmail,
        password,
      });

      if (res.data?.success && res.data?.data?.token) {
        const user = res.data.data.user;
        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          setErrorMsg('Unauthorized: Your account does not possess administrator role permissions.');
          return;
        }

        setAdminSession(res.data.data.token, user);
        if (onLoginSuccess) onLoginSuccess(user);
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg('Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Server connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#0B0F19] text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-6 sm:p-8 rounded-3xl neu-flat relative z-10 border border-slate-800"
      >
        {/* Terminal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-7 h-7 text-purple-400" />
          </div>
          <div className="flex items-center justify-center space-x-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
              Admin OS Terminal
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            STUDIX ADMIN
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Academic Governance & Moderation Command Center
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start space-x-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Authorized Master Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vshivachaitanya7@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Master Security Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-600/30 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying Terminal...' : 'Authenticate & Enter Command Center'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500">
            Encrypted End-to-End • Restricted to Shiva Chaitanya
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
