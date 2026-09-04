import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/authSlice.js';

export const SplashScreen = ({ onFinish }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('studix_splash_seen', 'true');
    } catch (e) {}

    if (typeof onFinish === 'function') {
      onFinish();
    }

    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/welcome', { replace: true });
    }
  };

  useEffect(() => {
    // Exactly 3 seconds splash screen before automatically opening into app
    const timer = setTimeout(() => {
      handleFinish();
    }, 3000);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-base overflow-hidden text-white cursor-pointer select-none"
    >
      {/* 9:16 Aspect Ratio Centered Mobile Canvas */}
      <div className="relative w-full max-w-[420px] h-full sm:h-[88vh] sm:max-h-[820px] sm:aspect-[9/16] flex flex-col items-center justify-center px-6 overflow-hidden sm:rounded-3xl sm:border sm:border-dark-border sm:shadow-2xl bg-dark-base">
        {/* Ambient subtle glow centered in 9:16 area */}
        <div className="absolute w-72 h-72 bg-brand-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute w-60 h-60 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Center Logo & Name */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center justify-center text-center"
        >
          {/* Logo container */}
          <div className="relative mb-6">
            <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-500 via-purple-500 to-accent-cyan opacity-70 blur-lg animate-pulse" />
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-dark-card/95 border border-brand-500/40 flex items-center justify-center p-5 shadow-2xl backdrop-blur-xl">
              <img
                src="/logo.svg"
                alt="Studix Logo"
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(79,70,229,0.7)]"
              />
            </div>
          </div>

          {/* STUDIX Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent drop-shadow-lg"
          >
            STUDIX
          </motion.h1>
        </motion.div>
      </div>
    </div>
  );
};

export default SplashScreen;
