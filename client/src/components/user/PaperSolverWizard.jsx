import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  X,
  FileText,
  CheckCircle2,
  Cpu,
  Award,
  Layers,
  HelpCircle,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  analyzePaper,
  solvePaperQuestion,
  clearPaperAnalysis,
  selectPaperAnalysis,
  selectPaperSolution,
  selectIsAnalyzing,
  selectIsSolving,
} from '../../redux/aiSlice.js';
import { selectResources } from '../../redux/resourceSlice.js';

export const PaperSolverWizard = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const resources = useSelector(selectResources);
  const paperAnalysis = useSelector(selectPaperAnalysis);
  const paperSolution = useSelector(selectPaperSolution);
  const isAnalyzing = useSelector(selectIsAnalyzing);
  const isSolving = useSelector(selectIsSolving);

  // Available papers from repository
  const availablePapers = resources.filter((r) =>
    ['SEMESTER_PAPER', 'PREVIOUS_PAPER', 'MID_1', 'MID_2'].includes(r.resource_type)
  );

  const [selectedResourceId, setSelectedResourceId] = useState(
    availablePapers[0]?.id || ''
  );
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [marks, setMarks] = useState(10);
  const [format, setFormat] = useState('university style');
  const [explanationStyle, setExplanationStyle] = useState('step-by-step');
  const [isCopied, setIsCopied] = useState(false);

  // Trigger Turn 1: Analyze paper
  const handleAnalyze = () => {
    if (!selectedResourceId) return;
    dispatch(analyzePaper({ resourceId: selectedResourceId }));
  };

  // Trigger Turn 2: Synthesize solution with preferences
  const handleSolve = () => {
    if (!selectedQuestion) return;
    dispatch(
      solvePaperQuestion({
        resourceId: selectedResourceId,
        questionSelection: selectedQuestion,
        marks,
        format,
        explanationStyle,
      })
    );
  };

  const handleCopy = () => {
    if (paperSolution?.solution) {
      navigator.clipboard.writeText(paperSolution.solution);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleReset = () => {
    dispatch(clearPaperAnalysis());
    setSelectedQuestion('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl rounded-3xl neu-flat p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl neu-button flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Interactive Exam Paper Solver
              </h3>
              <p className="text-[11px] text-slate-400">
                Gemini 2.0 multi-turn question extraction & university standard synthesis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-button text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: Paper Selection (If not analyzed yet) */}
        {!paperAnalysis && !paperSolution && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Choose Exam Paper to Analyze
              </label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl neu-pressed text-xs text-slate-100 focus:outline-none"
              >
                {availablePapers.map((paper) => (
                  <option key={paper.id} value={paper.id}>
                    [{paper.resource_type}] {paper.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl neu-pressed text-xs text-slate-400 space-y-2">
              <p className="font-bold text-slate-200">How Multi-Turn Analysis Works:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Gemini extracts all major exam questions from the paper.</li>
                <li>You configure your scoring criteria (2, 5, 10, or 16 Marks).</li>
                <li>AI synthesizes step-by-step solutions with diagram schemas.</li>
              </ol>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !selectedResourceId}
              id="start-paper-analysis-btn"
              className="w-full py-3.5 rounded-xl neu-button text-white font-bold text-xs shadow-glow flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2 text-brand-300">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Analyzing exam paper questions with Gemini 2.0...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Analyze Paper & Load Questions</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Follow-Up Preference Inquiry (Turn 1 Result) */}
        {paperAnalysis && !paperSolution && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-3.5 rounded-2xl neu-pressed flex items-center justify-between text-xs">
              <span className="text-slate-400">Paper: <span className="text-white font-bold">{paperAnalysis.paperTitle}</span></span>
              <button
                onClick={handleReset}
                className="text-[11px] text-brand-400 hover:underline"
              >
                Change Paper
              </button>
            </div>

            {/* Questions Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Select Question to Solve
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {paperAnalysis.extractedQuestions?.map((q, idx) => {
                  const isSelected = selectedQuestion === q;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuestion(q)}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start space-x-2.5 ${
                        isSelected
                          ? 'neu-tab-active border-brand-500 text-white font-bold'
                          : 'neu-button text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="font-extrabold text-brand-400 flex-shrink-0">Q{idx + 1}:</span>
                      <span>{q}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preference 1: Marks Allocation */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                2. Target Exam Marks Allocation
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { val: 2, desc: 'Definition' },
                  { val: 5, desc: 'Short Notes' },
                  { val: 10, desc: 'Standard' },
                  { val: 16, desc: 'Full Mastery' },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMarks(m.val)}
                    className={`p-2.5 rounded-xl text-center transition-all ${
                      marks === m.val
                        ? 'neu-pressed text-amber-400 font-black border border-amber-500/40'
                        : 'neu-button text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-black block">{m.val} M</span>
                    <span className="text-[10px] block opacity-70">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preference 2 & 3: Format and Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Output Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                >
                  <option value="university style">University Style (Standard)</option>
                  <option value="diagram">Diagram-Oriented (Mermaid/ASCII)</option>
                  <option value="bullet">Bullet Points</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Explanation Style
                </label>
                <select
                  value={explanationStyle}
                  onChange={(e) => setExplanationStyle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                >
                  <option value="step-by-step">Step-by-Step</option>
                  <option value="academic">Rigorous Academic</option>
                  <option value="beginner friendly">Beginner Friendly</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSolve}
              disabled={isSolving || !selectedQuestion}
              id="synthesize-solution-btn"
              className="w-full py-3.5 rounded-xl neu-button text-white font-bold text-xs shadow-glow flex items-center justify-center space-x-2"
            >
              {isSolving ? (
                <div className="flex items-center space-x-2 text-brand-300">
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Synthesizing {marks} marks model solution...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  <span>Synthesize {marks}-Mark Solution</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: Synthesized Solution (Turn 2 Result) */}
        {paperSolution && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <div className="flex items-center space-x-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg neu-pressed text-amber-300 font-extrabold">
                  {paperSolution.marks} MARKS
                </span>
                <span className="text-slate-400 capitalize">{paperSolution.format}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl neu-button text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent-emerald" />
                      <span className="text-accent-emerald">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-brand-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-white"
                  title="Solve another question"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 rounded-2xl neu-pressed max-h-[50vh] overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap">
              {paperSolution.solution}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaperSolverWizard;
