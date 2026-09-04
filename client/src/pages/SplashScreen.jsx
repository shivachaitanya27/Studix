import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

    // Celestial crystal sparkle notes (Ascending Pentatonic Chime: C6, E6, G6, B6, C7, E7, G7, C8)
    const frequencies = [1046.5, 1318.51, 1567.98, 1975.53, 2093.0, 2637.02, 3135.96, 4186.01];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.055);

      // Micro pitch-bend upward for crystalline shimmer
      osc.frequency.exponentialRampToValueAtTime(freq * 1.018, now + index * 0.055 + 0.12);

      // Smooth attack & exponential decay
      gain.gain.setValueAtTime(0.0001, now + index * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.25, now + index * 0.055 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.055 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.055);
      osc.stop(now + index * 0.055 + 0.55);
    });

    // Secondary fairy dust shimmer layer
    const shimmerNotes = [2349.32, 2793.83, 3520.0, 4698.63];
    shimmerNotes.forEach((freq, idx) => {
      const sOsc = ctx.createOscillator();
      const sGain = ctx.createGain();

      sOsc.type = 'sine';
      sOsc.frequency.setValueAtTime(freq, now + 0.14 + idx * 0.045);

      sGain.gain.setValueAtTime(0.0001, now + 0.14 + idx * 0.045);
      sGain.gain.exponentialRampToValueAtTime(0.14, now + 0.14 + idx * 0.045 + 0.01);
      sGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14 + idx * 0.045 + 0.4);

      sOsc.connect(sGain);
      sGain.connect(ctx.destination);

      sOsc.start(now + 0.14 + idx * 0.045);
      sOsc.stop(now + 0.14 + idx * 0.045 + 0.45);
    });
  } catch (err) {
    console.warn('Sparkle audio playback notice:', err.message);
  }
}

export const SplashScreen = ({ onFinish }) => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('studix_splash_seen', 'true');
    } catch (e) {}

    if (onFinish) {
      onFinish();
    } else if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/welcome', { replace: true });
    }
  };

  useEffect(() => {
    // 1. Play the sparkle sound on load
    playSparkleSound();

    // 2. Fallback gesture listener in case browser blocks unprompted autoplay
    const handleGesture = () => {
      playSparkleSound();
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
    window.addEventListener('pointerdown', handleGesture, { once: true });
    window.addEventListener('keydown', handleGesture, { once: true });

    // 3. Exactly 3 seconds duration before going directly into the app
    const timer = setTimeout(() => {
      handleFinish();
    }, 3000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleGesture);
      window.removeEventListener('keydown', handleGesture);
    };
  }, []);

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-50 flex items-center justify-center bg-dark-base relative overflow-hidden text-white cursor-pointer select-none"
    >
      {/* Ambient background glow in center */}
      <div className="absolute w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute w-[380px] h-[380px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Dead-Center Container: Logo & STUDIX only */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center justify-center text-center"
      >
        {/* Glowing Logo Frame */}
        <div className="relative group mb-6">
          <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-brand-500 via-purple-500 to-accent-cyan opacity-75 blur-xl group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-dark-card/95 border border-brand-500/40 flex items-center justify-center p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
            <img
              src="/logo.svg"
              alt="Studix Logo"
              className="w-full h-full object-contain filter drop-shadow-[0_0_24px_rgba(79,70,229,0.7)]"
            />
          </div>
        </div>

        {/* STUDIX Name Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent drop-shadow-lg"
        >
          STUDIX
        </motion.h1>
      </motion.div>
    </div>
  );
};

export default SplashScreen;
