import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  X,
  Heart,
  Sparkles,
  Send,
  ThumbsUp,
  CheckCircle2,
  MessageSquareHeart
} from 'lucide-react';
import api from '../../services/api.js';

const RATING_DESCRIPTIONS = {
  5: '😍 Absolutely loved it! Invaluable for campus.',
  4: '😊 Great experience, very helpful materials.',
  3: '🙂 Decent platform, good foundation.',
  2: '😐 Needs improvement in some areas.',
  1: '😞 Hard to navigate / found issues.',
};

const SUGGESTED_TAGS = [
  '⚡ Fast & Smooth',
  '📚 Quality Notes',
  '📑 Need More Model Papers',
  '🎨 Sleek Neumorphic UI',
  '🤖 AI Assistant is Helpful',
  '🔍 Easy to Find Syllabus',
  '📱 Works Great on Mobile',
  '💡 Add Video Lectures',
];

export const ExitFeedbackModal = ({ isOpen, onClose, user }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['⚡ Fast & Smooth', '📚 Quality Notes']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const markDoneAndClose = () => {
    localStorage.setItem('studix_feedback_done', 'true');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/feedback', {
        rating,
        tags: selectedTags,
        comment: comment.trim(),
        collegeName: user?.colleges?.name || user?.college?.name || '',
        departmentName: user?.departments?.name || user?.department?.name || '',
      });
      setIsSubmitted(true);
      localStorage.setItem('studix_feedback_done', 'true');
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2500);
    } catch (err) {
      console.warn('Feedback submit notice:', err);
      // Still allow graceful close so user isn't blocked
      localStorage.setItem('studix_feedback_done', 'true');
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg bg-white dark:bg-[#111625] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
      >
        {/* Glow decoration */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-accent-violet to-emerald-400" />

        {isSubmitted ? (
          <div className="p-8 sm:p-10 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Thank You for Your Feedback!
            </h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Your feedback goes directly to developer <span className="text-brand-400 font-bold">Shiva Chaitanya</span> to help make Studix the best campus app for you and your friends.
            </p>
          </div>
        ) : (
          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center border border-brand-500/30">
                  <MessageSquareHeart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    First-Time Experience Feedback
                  </h3>
                  <p className="text-xs text-slate-400">
                    Before you leave, tell us how your first visit was!
                  </p>
                </div>
              </div>

              <button
                onClick={markDoneAndClose}
                className="p-2 rounded-xl neu-button text-slate-400 hover:text-rose-400 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Rate your initial experience:
                </span>
                <div className="flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="p-1 transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            active
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400 mt-2 block min-h-[16px]">
                  {RATING_DESCRIPTIONS[hoverRating || rating]}
                </span>
              </div>

              {/* Multi-select Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">
                  What stood out to you? (Select all that apply)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all ${
                          isSelected
                            ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                            : 'neu-button text-slate-400 hover:text-white'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions / Notes Textarea */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Any suggestions or ideas for Shiva to add? (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="e.g. Please add 2024 model question papers for CSE..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={markDoneAndClose}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Skip for now
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 disabled:opacity-50 transition-all active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ExitFeedbackModal;
