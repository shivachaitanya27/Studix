import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
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
  ListChecks,
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
import TextToSpeechButton from '../common/TextToSpeechButton.jsx';

export const PaperSolverWizard = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const resources = useSelector(selectResources);
  const paperAnalysis = useSelector(selectPaperAnalysis);
  const paperSolution = useSelector(selectPaperSolution);
  const isAnalyzing = useSelector(selectIsAnalyzing);
  const isSolving = useSelector(selectIsSolving);

  // Available papers from repository (Includes Model Exam Papers positioned after Mid-1 and Mid-2)
  const availablePapers = resources.filter((r) =>
    ['SEMESTER_PAPER', 'PREVIOUS_PAPER', 'MID_1', 'MID_2', 'MODEL_PAPER'].includes(r.resource_type)
  );

  const [paperTypeFilter, setPaperTypeFilter] = useState('ALL');
  const [selectedResourceId, setSelectedResourceId] = useState(
    availablePapers[0]?.id || ''
  );
  const [selectedQuestion, setSelectedQuestion] = useState('ALL_QUESTIONS');
  const [solverMode, setSolverMode] = useState('ALL'); // 'ALL' | 'SINGLE'
  const [marks, setMarks] = useState(10);
  const [format, setFormat] = useState('university style');
  const [explanationStyle, setExplanationStyle] = useState('step-by-step');
  const [isCopied, setIsCopied] = useState(false);

  // Filtered papers based on current chip filter
  const displayPapers = availablePapers.filter((p) => {
    if (paperTypeFilter === 'ALL') return true;
    if (paperTypeFilter === 'SEMESTER') return ['SEMESTER_PAPER', 'PREVIOUS_PAPER'].includes(p.resource_type);
    if (paperTypeFilter === 'MID_1') return p.resource_type === 'MID_1';
    if (paperTypeFilter === 'MID_2') return p.resource_type === 'MID_2';
    if (paperTypeFilter === 'MODEL') return p.resource_type === 'MODEL_PAPER';
    return true;
  });

  // Keep selected paper synchronized when repository items or type filter change
  useEffect(() => {
    if (displayPapers.length > 0 && (!selectedResourceId || !displayPapers.some((p) => p.id === selectedResourceId))) {
      setSelectedResourceId(displayPapers[0].id);
    }
  }, [availablePapers.length, paperTypeFilter, selectedResourceId, displayPapers]);

  // Trigger Turn 1: Analyze paper
  const handleAnalyze = () => {
    if (!selectedResourceId) return;
    dispatch(analyzePaper({ resourceId: selectedResourceId }));
    setSelectedQuestion('ALL_QUESTIONS');
    setSolverMode('ALL');
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
    setSelectedQuestion('ALL_QUESTIONS');
    setSolverMode('ALL');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl my-auto rounded-3xl neu-flat p-4 sm:p-7 z-10 max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/30 mb-5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl neu-button flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
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
            aria-label="Close"
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

              {/* Paper Filter Chips (Model Paper right after Mid-1 & Mid-2) */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none">
                {[
                  { id: 'ALL', label: 'All Papers' },
                  { id: 'SEMESTER', label: 'Semester' },
                  { id: 'MID_1', label: 'Mid-1' },
                  { id: 'MID_2', label: 'Mid-2' },
                  { id: 'MODEL', label: 'Model Paper' },
                ].map((typeTab) => (
                  <button
                    key={typeTab.id}
                    type="button"
                    onClick={() => {
                      setPaperTypeFilter(typeTab.id);
                      const matching = availablePapers.filter((p) => {
                        if (typeTab.id === 'ALL') return true;
                        if (typeTab.id === 'SEMESTER') return ['SEMESTER_PAPER', 'PREVIOUS_PAPER'].includes(p.resource_type);
                        if (typeTab.id === 'MID_1') return p.resource_type === 'MID_1';
                        if (typeTab.id === 'MID_2') return p.resource_type === 'MID_2';
                        if (typeTab.id === 'MODEL') return p.resource_type === 'MODEL_PAPER';
                        return true;
                      });
                      if (matching.length > 0 && !matching.some((m) => m.id === selectedResourceId)) {
                        setSelectedResourceId(matching[0].id);
                      }
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                      paperTypeFilter === typeTab.id
                        ? 'neu-pressed border border-brand-500 bg-brand-500/20 text-brand-300 shadow-sm'
                        : 'neu-button text-slate-400 hover:text-white'
                    }`}
                  >
                    {typeTab.label}
                  </button>
                ))}
              </div>

              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl neu-pressed text-xs text-slate-100 focus:outline-none"
              >
                {displayPapers.length === 0 ? (
                  <option value="" disabled>
                    No {paperTypeFilter === 'MODEL' ? 'Model Exam Papers' : 'papers'} found in repository
                  </option>
                ) : (
                  displayPapers.map((paper) => (
                    <option key={paper.id} value={paper.id}>
                      [{paper.resource_type === 'MODEL_PAPER' ? 'MODEL PAPER' : paper.resource_type.replace('_', ' ')}] {paper.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="p-4 rounded-2xl neu-pressed text-xs text-slate-400 space-y-2">
              <p className="font-bold text-slate-200">How Multi-Turn Analysis Works:</p>
              <ol className="list-decimal pl-4 space-y-1 text-[11px]">
                <li>Gemini analyzes the full exam paper and extracts every single question.</li>
                <li>You choose whether to solve all questions together or pick a specific one.</li>
                <li>Configure scoring allocation (2, 5, 10, or 16 Marks) for model university answers.</li>
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
                  <span>Analyze Paper & Extract Questions</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 2: Follow-Up Preference Inquiry (Turn 1 Result) */}
        {paperAnalysis && !paperSolution && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-3.5 rounded-2xl neu-pressed flex items-center justify-between text-xs">
              <span className="text-slate-400 truncate max-w-[280px]">
                Paper: <span className="text-white font-bold">{paperAnalysis.paperTitle}</span>
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] text-brand-400 hover:underline flex-shrink-0"
              >
                Change Paper
              </button>
            </div>

            {/* Prompt Inquiry: Should I solve all questions & answers? */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-600/20 via-accent-violet/20 to-amber-500/20 border border-brand-500/40 space-y-3 shadow-glow">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Extracted {paperAnalysis.extractedQuestions?.length || 0} Questions from Paper!
                </h4>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                Should I give complete step-by-step solutions for <strong>all questions and answers</strong> at once, or solve a <strong>specific question</strong>?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  id="solve-all-questions-choice"
                  onClick={() => {
                    setSelectedQuestion('ALL_QUESTIONS');
                    setSolverMode('ALL');
                  }}
                  className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    selectedQuestion === 'ALL_QUESTIONS'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-glow'
                      : 'neu-button text-amber-300 hover:text-white border-amber-500/40'
                  }`}
                >
                  <ListChecks className="w-4 h-4" />
                  <span>Solve ALL Questions & Answers</span>
                </button>

                <button
                  type="button"
                  id="solve-single-question-choice"
                  onClick={() => {
                    setSolverMode('SINGLE');
                    if (selectedQuestion === 'ALL_QUESTIONS') {
                      setSelectedQuestion(paperAnalysis.extractedQuestions?.[0] || '');
                    }
                  }}
                  className={`p-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    selectedQuestion !== 'ALL_QUESTIONS'
                      ? 'bg-brand-600 text-white font-bold shadow-glow'
                      : 'neu-button text-slate-300 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Select Specific Question</span>
                </button>
              </div>
            </div>

            {/* Questions Picker: Shows ALL Questions Inside the Paper */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Questions Inside This Paper ({paperAnalysis.extractedQuestions?.length || 0})
                </label>
                {selectedQuestion === 'ALL_QUESTIONS' && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                    All Questions Selected
                  </span>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {paperAnalysis.extractedQuestions?.map((q, idx) => {
                  const isSelected = selectedQuestion === q || selectedQuestion === 'ALL_QUESTIONS';
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedQuestion(q);
                        setSolverMode('SINGLE');
                      }}
                      className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-start space-x-2.5 ${
                        selectedQuestion === q
                          ? 'neu-tab-active border-brand-500 text-white font-bold shadow-sm'
                          : selectedQuestion === 'ALL_QUESTIONS'
                          ? 'neu-pressed border-amber-500/30 text-amber-200'
                          : 'neu-button text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="font-extrabold text-brand-400 flex-shrink-0">Q{idx + 1}:</span>
                      <span className="flex-1">{q}</span>
                      {isSelected && (
                        <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${selectedQuestion === 'ALL_QUESTIONS' ? 'text-amber-400' : 'text-accent-emerald'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preference 1: Marks Allocation */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Target Exam Marks Allocation
              </label>
              <div className="grid grid-cols-4 gap-2">
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
                    className={`p-2 sm:p-2.5 rounded-xl text-center transition-all ${
                      marks === m.val
                        ? 'neu-pressed text-amber-400 font-black border border-amber-500/40 shadow-sm'
                        : 'neu-button text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-black block">{m.val} M</span>
                    <span className="text-[9px] sm:text-[10px] block opacity-70 truncate">{m.desc}</span>
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
                  <span>Synthesizing {selectedQuestion === 'ALL_QUESTIONS' ? 'all exam questions' : `${marks} marks`} model solution...</span>
                </div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-accent-emerald" />
                  <span>
                    {selectedQuestion === 'ALL_QUESTIONS'
                      ? '⚡ Synthesize ALL Questions & Answers (Full Paper Key)'
                      : `Synthesize ${marks}-Mark Solution`}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* STEP 3: Synthesized Solution (Turn 2 Result) */}
        {paperSolution && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30 gap-2">
              <div className="flex items-center space-x-2 text-xs truncate">
                <span className="px-2.5 py-1 rounded-lg neu-pressed text-amber-300 font-extrabold flex-shrink-0">
                  {paperSolution.marks} MARKS
                </span>
                <span className="text-slate-400 capitalize truncate">{paperSolution.format}</span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                {/* Read Aloud TTS for Paper Solution */}
                <TextToSpeechButton text={paperSolution.solution} />

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

            <div className="p-5 rounded-2xl neu-pressed max-h-[52vh] overflow-y-auto font-sans text-xs text-slate-200 leading-relaxed space-y-3 whitespace-pre-wrap select-text">
              {paperSolution.solution}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PaperSolverWizard;
