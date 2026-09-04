import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/authSlice.js';

export const SplashScreen = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigate('/dashboard');
      } else {
        navigate('/welcome');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigate, isAuthenticated]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-dark-base relative overflow-hidden text-white">
      {/* Ambient background lighting */}
      <div className="absolute w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute w-80 h-80 bg-accent-violet/15 rounded-full blur-[140px] -bottom-10" />

      {/* Center Logo with Framer Motion Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-brand-600 via-brand-500 to-accent-violet flex items-center justify-center shadow-glow-lg p-5">
          <GraduationCap className="w-full h-full text-white drop-shadow-md" />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mt-6 text-4xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-brand-400 bg-clip-text text-transparent"
        >
          STUDIX
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-2 text-xs font-semibold tracking-widest text-slate-400 uppercase flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Academic Resource Intelligence</span>
        </motion.p>
      </motion.div>

      {/* Progress Bar Loader */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 140 }}
        transition={{ delay: 0.7, duration: 1.2 }}
        className="mt-12 h-1 bg-dark-border rounded-full overflow-hidden relative z-10"
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="h-full w-full bg-gradient-to-r from-transparent via-brand-500 to-accent-cyan"
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
