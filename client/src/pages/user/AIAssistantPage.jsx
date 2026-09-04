import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Cpu,
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  Bot,
  User as UserIcon,
  HelpCircle,
  Sliders,
  Flame,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  fetchAiSessions,
  createAiSession,
  fetchSessionMessages,
  sendAiMessage,
  searchRepositoryRag,
  setActiveSessionId,
  clearRagResults,
  selectAiSessions,
  selectActiveSessionId,
  selectAiMessages,
  selectRagResults,
  selectIsSearching,
  selectIsSending,
} from '../../redux/aiSlice.js';
import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
  selectSubjects,
} from '../../redux/academicSlice.js';
import PaperSolverWizard from '../../components/user/PaperSolverWizard.jsx';
import VoiceButton from '../../components/common/VoiceButton.jsx';
import TextToSpeechButton from '../../components/common/TextToSpeechButton.jsx';
import MarkdownMessage from '../../components/common/MarkdownMessage.jsx';
import { useTranslation } from 'react-i18next';



export const AIAssistantPage = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  const college = useSelector(selectSelectedCollege);
  const department = useSelector(selectSelectedDepartment);
  const year = useSelector(selectSelectedYear);
  const semester = useSelector(selectSelectedSemester);
  const subjects = useSelector(selectSubjects);

  const sessions = useSelector(selectAiSessions);
  const activeSessionId = useSelector(selectActiveSessionId);
  const messages = useSelector(selectAiMessages);
  const ragResults = useSelector(selectRagResults);
  const isSearching = useSelector(selectIsSearching);
  const isSending = useSelector(selectIsSending);

  const [inputMessage, setInputMessage] = useState('');
  const [ragQuery, setRagQuery] = useState('');
  const [isSolverOpen, setIsSolverOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // 1. Fetch user's private sessions on mount
  useEffect(() => {
    dispatch(fetchAiSessions());
  }, [dispatch]);

  // 2. Fetch messages whenever activeSessionId changes
  useEffect(() => {
    if (activeSessionId) {
      dispatch(fetchSessionMessages(activeSessionId));
    }
  }, [activeSessionId, dispatch]);

  // 3. Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const handleCreateNewChat = () => {
    dispatch(
      createAiSession({
        title: `Exam Prep (${department?.code || 'CSE'} - ${new Date().toLocaleDateString()})`,
        subjectId: subjects[0]?.id || null,
      })
    );
  };

  const handleExamChipClick = (prefix) => {
    if (inputMessage.trim()) {
      setInputMessage(`${prefix} ${inputMessage}`);
    } else {
      setInputMessage(`${prefix} `);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    if (!activeSessionId) {
      dispatch(
        createAiSession({
          title: inputMessage.slice(0, 30) + '...',
          subjectId: subjects[0]?.id || null,
        })
      ).then((res) => {
        if (res.payload?.id) {
          dispatch(
            sendAiMessage({
              sessionId: res.payload.id,
              message: inputMessage,
              collegeId: college?.id,
              departmentId: department?.id,
              subjectId: subjects[0]?.id,
            })
          );
        }
      });
    } else {
      dispatch(
        sendAiMessage({
          sessionId: activeSessionId,
          message: inputMessage,
          collegeId: college?.id,
          departmentId: department?.id,
          subjectId: subjects[0]?.id,
        })
      );
    }
    setInputMessage('');
  };

  const handleRagSearch = (e) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;
    dispatch(
      searchRepositoryRag({
        query: ragQuery,
        collegeId: college?.id,
        departmentId: department?.id,
      })
    );
  };

  return (
    <div className={`space-y-6 font-['Roboto',sans-serif] ${isFullScreen ? 'fixed inset-0 z-50 p-4 md:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto' : ''}`}>
      {/* Top Banner & Exam Solver Wizard Gateway */}
      <div className="p-6 rounded-3xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gemini 2.0 Flash • Repository-Aware RAG</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>AI Exam Assistant & Solver</span>
            {isFullScreen && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Focus Screen Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Contextually answers syllabus questions grounded in {college?.code || 'University'} past papers & lecture notes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            id="toggle-ai-focus-screen-btn"
            className="px-4 py-2.5 rounded-xl neu-button text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-2 border border-slate-700/60"
            title={isFullScreen ? 'Exit Separate Focus Screen' : 'Open in Separate Screen'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-brand-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-brand-400" />
                <span>Separate Screen</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSolverOpen(true)}
            id="launch-paper-solver-btn"
            className="px-5 py-2.5 rounded-xl neu-button text-xs font-bold text-white shadow-glow flex items-center space-x-2 border-amber-500/40"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Interactive Paper Solver</span>
          </button>
        </div>
      </div>

      {/* RAG Repository Search Quick Query Bar */}
      <div className="p-4 rounded-2xl neu-flat">
        <form onSubmit={handleRagSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              id="rag-search-input"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="RAG Search: e.g. 'Explain OSI model layers and checksum from past exam papers'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2.5 rounded-xl neu-button text-xs font-bold text-brand-300 hover:text-white flex items-center space-x-1.5"
          >
            {isSearching ? (
              <Cpu className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>RAG Query</span>
          </button>
        </form>

        {/* RAG Results Display */}
        {ragResults && (
          <div className="mt-4 p-4 rounded-xl neu-pressed animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-brand-300 uppercase tracking-wider">
                Grounded Repository Synthesis ({ragResults.totalSourcesFound} Sources)
              </span>
              <div className="flex items-center space-x-2">
                <TextToSpeechButton text={ragResults.answer} />
                <button
                  onClick={() => dispatch(clearRagResults())}
                  className="text-[10px] text-slate-500 hover:text-slate-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed">
              <MarkdownMessage content={ragResults.answer} />
            </div>



            {ragResults.citations?.length > 0 && (
              <div className="pt-2 border-t border-slate-700/30 flex flex-wrap gap-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Citations:</span>
                {ragResults.citations.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-md neu-button text-[10px] text-slate-300"
                  >
                    {c.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Two-Column Chat Experience with Expanded Viewport */}
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isFullScreen ? 'min-h-[calc(100vh-160px)]' : 'min-h-[680px]'}`}>
        {/* Left Column: Private Sessions Sidebar */}
        <div className="lg:col-span-1 rounded-3xl neu-flat p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chat Sessions
              </span>
              <button
                onClick={handleCreateNewChat}
                id="new-ai-chat-btn"
                className="p-1.5 rounded-lg neu-button text-slate-300 hover:text-white"
                title="Create New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isActive = activeSessionId === sess.id;
                return (
                  <button
                    key={sess.id}
                    onClick={() => dispatch(setActiveSessionId(sess.id))}
                    className={`w-full p-2.5 rounded-xl text-left text-xs transition-all flex items-center space-x-2.5 ${
                      isActive
                        ? 'neu-tab-active text-white font-bold'
                        : 'neu-button text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 flex-shrink-0 text-brand-400" />
                    <span className="truncate">{sess.title}</span>
                  </button>
                );
              })}

              {sessions.length === 0 && (
                <p className="text-[11px] text-slate-500 italic p-3 text-center">
                  No sessions yet. Click + to begin.
                </p>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl neu-pressed text-[10px] text-slate-500 text-center">
            Private RLS Sessions • Owned by your account
          </div>
        </div>

        {/* Right Column: Active Conversation Feed (Maximized Chat Area) */}
        <div className={`lg:col-span-3 rounded-3xl neu-flat p-6 flex flex-col justify-between ${isFullScreen ? 'min-h-[calc(100vh-180px)]' : 'min-h-[660px]'}`}>
          {/* Messages Feed - Expansive Height */}
          <div className={`space-y-4 overflow-y-auto pr-2 ${isFullScreen ? 'max-h-[calc(100vh-320px)] min-h-[500px]' : 'max-h-[560px] min-h-[460px]'}`}>
            {messages.length === 0 && (
              <div className="text-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-2xl neu-button mx-auto flex items-center justify-center text-brand-400">
                  <Bot className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-white">Ask Studix Exam AI</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Ask questions, request step-by-step derivations, or click below for quick prompt formats:
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {[
                    'Explain OSI layers with standard diagrams',
                    'Derive Go-Back-N protocol mechanism (10 Marks)',
                    'Lexical Analyzer vs Parser in Compiler Design',
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setInputMessage(sug)}
                      className="px-3 py-1.5 rounded-xl neu-button text-[11px] text-slate-300 hover:text-brand-300"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                >
                  <div
                    className={`max-w-[94%] sm:max-w-[88%] p-4 sm:p-5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'neu-button text-white font-medium'
                        : 'neu-pressed text-slate-200 whitespace-pre-wrap'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between space-x-1.5 text-brand-400 font-bold mb-1.5 text-[10px] uppercase">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3 h-3" />
                          <span>Gemini 2.5 Flash Assistant</span>
                        </div>
                        <TextToSpeechButton text={m.message} />
                      </div>
                    )}
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.message}</div>
                    ) : (
                      <MarkdownMessage content={m.message} />
                    )}



                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex justify-start animate-fade-in">
                <div className="p-3.5 rounded-2xl neu-pressed text-xs text-slate-400 flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-brand-400 animate-spin" />
                  <span>Synthesizing response referencing campus repository...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Exam Mark Allocation & Shortcut Chips */}
          <div className="pt-3 border-t border-slate-700/30 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Exam Formats:
            </span>
            {[
              { label: '📝 Part-A (2 Marks Format)', prefix: '[Part-A: 2 Marks]' },
              { label: '🎯 Part-B (10 Marks Essay)', prefix: '[Part-B: 10 Marks]' },
              { label: '⚡ Key Formulas & Definitions', prefix: '[Formulas & Core Concepts]' },
              { label: '📊 Comparison Table / Diagrams', prefix: '[Tabular Comparison & Diagrams]' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExamChipClick(chip.prefix)}
                className="px-2.5 py-1 rounded-lg neu-button text-[10px] font-medium text-slate-300 hover:text-amber-300 hover:border-amber-500/30 transition-all flex items-center space-x-1"
              >
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Prompt Input */}
          <form onSubmit={handleSendMessage} className="mt-2 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                id="ai-prompt-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask anything about your curriculum, formulas, or exam questions (e.g. Part-A 2 marks)..."
                className="w-full px-4 py-3 rounded-2xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <VoiceButton onTranscript={(txt) => setInputMessage(txt)} />

            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              id="send-ai-prompt-btn"
              className="p-3 rounded-2xl neu-button text-brand-400 hover:text-white shadow-glow disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Paper Solver Wizard Modal */}
      <PaperSolverWizard
        isOpen={isSolverOpen}
        onClose={() => setIsSolverOpen(false)}
      />
    </div>
  );
};

export default AIAssistantPage;
