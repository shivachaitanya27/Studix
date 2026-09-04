import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileCheck2,
  BrainCircuit,
  Lock,
  Compass,
} from 'lucide-react';

export const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-base text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-accent-violet/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight brand-title-text">
            STUDIX
          </span>

        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6"
        >
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Gen Multi-Tenant Academic Repository</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
        >
          Your College Resources.{' '}
          <span className="bg-gradient-to-r from-brand-400 via-accent-violet to-accent-cyan bg-clip-text text-transparent">
            AI-Enhanced.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed"
        >
          Access verified past question papers, faculty & student notes, and multi-turn AI exam
          solving customized exclusively for your university, department, and semester.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <button
            onClick={() => navigate('/signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-base shadow-glow flex items-center justify-center space-x-2 group transition-all"
          >
            <span>Start Free Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-dark-card border border-dark-border hover:border-slate-600 text-slate-200 hover:text-white font-semibold text-base transition-all flex items-center justify-center space-x-2"
          >
            <Compass className="w-5 h-5 text-brand-400" />
            <span>Sign In to Your Campus</span>
          </button>
        </motion.div>

        {/* 3 Pillars Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-2xl bg-dark-card/60 border border-dark-border/80 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Previous Question Papers</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Mid-1, Mid-2, and Semester final examination papers indexed by university and branch.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card/60 border border-dark-border/80 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center text-accent-violet mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Gemini 2.0 Exam Solver</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Step-by-step solutions with customizable mark formats (2/5/10/16 marks) and diagrams.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-dark-card/60 border border-dark-border/80 backdrop-blur-md">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 border border-accent-emerald/20 flex items-center justify-center text-accent-emerald mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Strict Multi-Tenancy</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Row Level Security guarantees your academic stream is clean, authentic, and organized.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom info */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-slate-500 z-10 border-t border-dark-border/40">
        Studix Architecture Spec v1.0 • React 19 + Express + Supabase RLS
      </footer>
    </div>
  );
};

export default WelcomeScreen;
