import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  FolderArchive,
  Sparkles,
  UserCheck,
  Pencil,
  Camera,
  Trash2,
  BookOpen,
  Settings,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

const NEW_USER_STEPS = [
  {
    id: 'stream',
    title: 'Academic Stream & Verified Subjects',
    subtitle: 'Step 1 of 4: Streamlined Campus Setup',
    icon: GraduationCap,
    iconBg: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    tag: 'Syllabus Aligned',
    description:
      'Select your department, academic year, and active semester. Studix instantly tailors verified study material specifically for your university and syllabus.',
    tip: 'You can update your year or semester anytime from Account Settings.',
  },
  {
    id: 'repository',
    title: 'Academic Repository & Question Bank',
    subtitle: 'Step 2 of 4: All Study Materials in One Place',
    icon: FolderArchive,
    iconBg: 'bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30',
    tag: 'New Question Bank',
    description:
      'Access previous semester papers, internal mid exams, study notes, and the brand-new Question Bank section curated for high-yield exam preparation.',
    tip: 'Use the real-time search bar to find questions by subject code or keyword.',
  },
  {
    id: 'ai-solver',
    title: 'Exam AI Assistant & Solver',
    subtitle: 'Step 3 of 4: Your 24/7 Campus Study Partner',
    icon: Sparkles,
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    tag: 'AI Powered',
    description:
      'Stuck on a tricky question or numerical? Upload or ask directly — Studix AI breaks down problems with step-by-step explanations and verified formulas.',
    tip: 'Click "Solve with Exam AI" directly from any document in the repository.',
  },
  {
    id: 'uploads',
    title: 'Full Control: Profile, Uploads & Deletions',
    subtitle: 'Step 4 of 4: Your Content & Profile',
    icon: UserCheck,
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    tag: 'Total Ownership',
    description:
      'Edit your display name right in the navbar, upload a profile photo (up to 2MB), share notes with classmates, and delete your uploaded files anytime.',
    tip: 'Both you and campus administrators can remove files whenever needed.',
  },
];

const WHATS_NEW_STEPS = [
  {
    id: 'edit-name',
    title: 'Edit Display Name from Navbar',
    subtitle: 'Feature Update 1 of 5',
    icon: Pencil,
    iconBg: 'bg-brand-500/20 text-brand-400 border-brand-500/30',
    tag: 'New in Navbar',
    description:
      'You can now edit and personalize your account name directly from the top navigation bar profile menu with instant saving.',
    tip: 'Click the pencil icon next to your name to change it anytime.',
  },
  {
    id: 'profile-photo',
    title: '2MB Profile Photo Uploads',
    subtitle: 'Feature Update 2 of 5',
    icon: Camera,
    iconBg: 'bg-accent-violet/20 text-accent-violet border-accent-violet/30',
    tag: 'Strict 2MB Limit',
    description:
      'Upload crisp profile pictures with strict image validation and a 2MB size cap to keep your app fast and lightweight.',
    tip: 'Supports JPG, PNG, and WebP photos with instant preview.',
  },
  {
    id: 'user-delete',
    title: 'Delete Your Uploaded Files',
    subtitle: 'Feature Update 3 of 5',
    icon: Trash2,
    iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    tag: 'Full Ownership',
    description:
      'Uploaded a file by mistake? You can now delete any documents or notes you personally uploaded, right from the card or preview modal.',
    tip: 'Administrators also retain moderation capabilities across all files.',
  },
  {
    id: 'question-bank',
    title: 'New Question Bank Section',
    subtitle: 'Feature Update 4 of 5',
    icon: BookOpen,
    iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    tag: 'Exam Preparation',
    description:
      'Check out the dedicated "Question Bank" tab in All Resources, featuring important questions and question banks for fast revision.',
    tip: 'You can also upload question banks to share with your branch.',
  },
  {
    id: 'settings-clean',
    title: 'Clean Settings & Smart Exit Feedback',
    subtitle: 'Feature Update 5 of 5',
    icon: Settings,
    iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    tag: 'Refined Experience',
    description:
      'Academic settings have been streamlined without duplicate save bars, and exiting now includes a helpful confirmation and first-time feedback.',
    tip: 'Your feedback goes directly to improving Studix for everyone.',
  },
];

export const FeatureGuideModal = ({ isOpen, onClose, forceMode = null }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Determine mode: 'onboarding' for new users or 'whats_new' for present users
  const isGuideSeen = typeof window !== 'undefined' && localStorage.getItem('studix_guide_seen') === 'true';
  const mode = forceMode || (!isGuideSeen ? 'onboarding' : 'whats_new');
  const steps = mode === 'whats_new' ? WHATS_NEW_STEPS : NEW_USER_STEPS;

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('studix_guide_seen', 'true');
      localStorage.setItem('studix_v2_features_seen', 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep] || steps[0];
  const StepIcon = step.icon;
  const isLastStep = currentStep === steps.length - 1;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999999] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="fixed inset-0" onClick={handleDismiss} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-lg bg-white dark:bg-[#121624] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        {/* Glowing top header bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand-500 via-accent-violet to-emerald-400" />

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-500/10 text-brand-500 dark:text-brand-300 border border-brand-500/20">
              {mode === 'whats_new' ? "What's New in Studix" : 'Studix Guide & Walkthrough'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            id="guide-modal-skip-top-btn"
            className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded-lg cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Step Body with slide animation */}
        <div className="p-6 sm:p-7 space-y-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Icon & Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${step.iconBg}`}
                >
                  <StepIcon className="w-7 h-7" />
                </div>

                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {step.tag}
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-brand-500 dark:text-brand-400 uppercase tracking-wide">
                  {step.subtitle}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {step.description}
              </p>

              {/* Helpful Tip Box */}
              <div className="p-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/15 border border-brand-500/25 flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-brand-600 dark:text-brand-300 font-medium">
                  <span className="font-bold">Tip: </span>
                  {step.tip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center space-x-2 pt-2">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${idx + 1}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-6 bg-brand-500'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0f121d]/90">
          <button
            type="button"
            onClick={handleDismiss}
            id="guide-modal-skip-footer-btn"
            className="py-2.5 px-4 rounded-xl neu-button text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            Skip
          </button>

          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                id="guide-modal-prev-btn"
                className="py-2.5 px-3.5 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-white flex items-center space-x-1 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              id="guide-modal-next-btn"
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs font-black shadow-glow transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <span>{isLastStep ? (mode === 'whats_new' ? 'Got It!' : 'Get Started!') : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default FeatureGuideModal;
