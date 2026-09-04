import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../redux/authSlice.js';

/**
 * Synthesizes a celestial sparkle chime using the Web Audio API.
 * High-pitched crystalline arpeggio with subtle shimmer harmonics.
 */
export function playSparkleSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Celestial crystal sparkle notes (Pentatonic chime: C6, E6, G6, B6, C7, E7, G7, C8)
    const frequencies = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0, 2637.02, 3135.96, 4186.01];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Alternate waveforms for rich metallic bell timbre
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.05);

      // Micro pitch-bend upward for shimmering sparkle
      osc.frequency.exponentialRampToValueAtTime(freq * 1.018, now + index * 0.05 + 0.12);

      // Smooth attack & exponential decay
      gain.gain.setValueAtTime(0.0001, now + index * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.24, now + index * 0.05 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.05 + 0.48);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.52);
    });

    // Secondary shimmer dust overtone layer
    const shimmerNotes = [2349.32, 2793.83, 3520.0, 4698.63];
    shimmerNotes.forEach((freq, idx) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();

      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.04);

      sGain.gain.setValueAtTime(0.0001, now + 0.12 + idx * 0.04);
      sGain.gain.exponentialRampToValueAtTime(0.12, now + 0.12 + idx * 0.04 + 0.01);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12 + idx * 0.04 + 0.38);

      sOsc.connect(sGain);
      sGain.connect(ctx.destination);

      sOsc.start(now + 0.12 + idx * 0.04);
      sOsc.stop(now + 0.12 + idx * 0.04 + 0.42);
    });
  } catch (err) {
    console.warn('Sparkle audio playback notice:', err.message);
  }
}

export const SplashScreen = ({ onFinish }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [hasPlayedSound, setHasPlayedSound] = useState(false);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('studix_splash_seen', 'true');
    } catch (e) {}

    if (onFinish) {
      onFinish();
    } else if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/welcome');
    }
  };

  useEffect(() => {
    // 1. Attempt immediate audio synthesis
    playSparkleSound();
    setHasPlayedSound(true);

    // 2. Gesture listener fallback in case browser blocks immediate autoplay
    const handleGesture = () => {
      playSparkleSound();
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    // 3. Auto-transition into app after 2.8s
    const timer = setTimeout(() => {
      handleFinish();
    }, 2800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-base relative overflow-hidden text-white cursor-pointer select-none"
    >
      {/* Dynamic Aurora Ambient Background Orbs */}
      <div className="absolute w-[500px] h-[500px] bg-brand-600/25 rounded-full blur-[140px] animate-pulse pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[160px] -bottom-10 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-accent-cyan/15 rounded-full blur-[120px] -top-10 pointer-events-none" />

      {/* Center Branding Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        {/* Glowing Logo Frame with Official Logo */}
        <div className="relative group">
          <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-brand-500 via-purple-500 to-accent-cyan opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-dark-card/90 border border-brand-500/40 flex items-center justify-center p-5 shadow-2xl backdrop-blur-xl">
            <img
              src="/logo.svg"
              alt="Studix Official Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(79,70,229,0.6)]"
            />
          </div>
        </div>

        {/* Brand Name Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6 }}
          className="mt-7 text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent drop-shadow-md"
        >
          STUDIX
        </motion.h1>

        {/* Institution Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
          className="mt-3 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/35 text-brand-300 text-xs font-bold shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>Dhanalakshmi Srinivasan University</span>
          <span className="px-1.5 py-0.2 rounded bg-brand-500/30 text-[10px] font-mono font-extrabold text-white">
            DSU
          </span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="mt-2 text-xs font-semibold tracking-wider text-slate-400 uppercase"
        >
          Academic Intelligence & Resource Hub
        </motion.p>
      </motion.div>

      {/* Sparkle Sound Indicator Badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85, duration: 0.5 }}
        className="mt-10 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-dark-card/80 border border-slate-700/50 text-[11px] text-slate-400 relative z-10"
      >
        <Volume2 className="w-3.5 h-3.5 text-brand-400 animate-bounce" />
        <span>✨ Sparkle chime enabled • Tap anywhere to continue</span>
        <ArrowRight className="w-3 h-3 text-slate-500" />
      </motion.div>

      {/* Progress Bar Loader */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: 160 }}
        transition={{ delay: 0.7, duration: 1.2 }}
        className="mt-6 h-1 bg-dark-border/80 rounded-full overflow-hidden relative z-10"
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
          className="h-full w-full bg-gradient-to-r from-transparent via-brand-500 to-accent-cyan"
        />
      </motion.div>
    </div>
  );
};

export default SplashScreen;
