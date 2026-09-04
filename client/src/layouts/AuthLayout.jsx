import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles, BookOpen, ShieldCheck, Cpu } from 'lucide-react';
import ThemeSwitcher from '../components/common/ThemeSwitcher.jsx';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row auth-page-bg bg-dark-base text-slate-100 relative overflow-hidden transition-colors duration-300">
      {/* Dynamic Background Glow Spots */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-accent-violet/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[128px] pointer-events-none" />

      {/* Left Column: Brand Showcase (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12 auth-brand-side bg-gradient-to-br from-dark-card/60 via-dark-base to-dark-card/40 border-r border-dark-border/60 transition-colors duration-300">
        <div>
          {/* Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight brand-title-text">
                STUDIX
              </h1>
              <p className="text-xs text-slate-400 font-medium tracking-wide">
                ACADEMIC RESOURCE INTELLIGENCE
              </p>
            </div>
          </Link>

          {/* Hero Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mt-16 space-y-6"
          >
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
              <span>Multi-Tenant Academic Platform</span>
            </div>
            <h2 className="text-4xl font-black tracking-tight text-white leading-tight">
              Curated Past Papers, Lecture Notes & AI-Powered Exam Solutions.
            </h2>
            <p className="text-slate-400 text-base leading-relaxed">
              Personalized directly to your university, engineering department, academic year, and semester. Share verified resources and solve complex questions with Gemini 2.0.
            </p>
          </motion.div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 gap-4 my-8">
          <div className="p-4 rounded-xl auth-highlight-card bg-dark-card/80 border border-dark-border/80 backdrop-blur-sm transition-all">
            <BookOpen className="w-5 h-5 text-brand-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Hierarchical Taxonomy</h4>
            <p className="text-xs text-slate-400 mt-1">
              Colleges, departments, and semesters strictly segmented.
            </p>
          </div>
          <div className="p-4 rounded-xl auth-highlight-card bg-dark-card/80 border border-dark-border/80 backdrop-blur-sm transition-all">
            <Cpu className="w-5 h-5 text-accent-violet mb-2" />
            <h4 className="text-sm font-semibold text-white">AI Vision Moderation</h4>
            <p className="text-xs text-slate-400 mt-1">
              Automated document validation and duplicate hash checks.
            </p>
          </div>
          <div className="p-4 rounded-xl auth-highlight-card bg-dark-card/80 border border-dark-border/80 backdrop-blur-sm transition-all">
            <ShieldCheck className="w-5 h-5 text-accent-emerald mb-2" />
            <h4 className="text-sm font-semibold text-white">Supabase RLS Enforced</h4>
            <p className="text-xs text-slate-400 mt-1">
              Fine-grained row security for verified student & admin data.
            </p>
          </div>
          <div className="p-4 rounded-xl auth-highlight-card bg-dark-card/80 border border-dark-border/80 backdrop-blur-sm transition-all">
            <Sparkles className="w-5 h-5 text-amber-400 mb-2" />
            <h4 className="text-sm font-semibold text-white">Repository RAG</h4>
            <p className="text-xs text-slate-400 mt-1">
              Ask questions directly against your syllabus materials.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-400 flex items-center justify-between border-t border-dark-border/40 pt-4">
          <span>© 2026 Studix • Developed by <strong className="text-brand-400">Shiva Chaitanya</strong></span>
          <div className="flex space-x-3">
            <span className="hover:text-slate-300 cursor-pointer">Security</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="text-brand-400 font-medium">Verified Platform</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container with Top Header & Switcher */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative z-10">
        {/* Top Floating Control Bar */}
        <div className="w-full flex items-center justify-between mb-4">
          {/* Mobile Logo Only */}
          <div className="lg:hidden">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight brand-title-text">
                STUDIX
              </span>
            </Link>
          </div>
          <div className="hidden lg:block"></div>

          {/* Theme Switcher */}
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Center: Auth Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-4">
          <Outlet />
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden text-center text-[11px] text-slate-400 pt-4">
          <span>© 2026 Studix • Developed by <strong className="text-brand-400">Shiva Chaitanya</strong></span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
