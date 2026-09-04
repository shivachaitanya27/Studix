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
  Paperclip,
  X,
  ChevronDown,
  ChevronUp,
  FileCheck,
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
  const [attachedFile, setAttachedFile] = useState(null);
  const [showMobileSessions, setShowMobileSessions] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Check if uploaded file is an Image (Exam paper photo, diagram, handwritten question)
    if (file.type.startsWith('image/') || /\.(jpe?g|png|webp|bmp|gif)$/i.test(file.name)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawDataUrl = event.target.result;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1400;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
            setAttachedFile({
              name: file.name,
              size: file.size,
              type: 'image/jpeg',
              isImage: true,
              dataUrl: compressedUrl,
              previewUrl: compressedUrl,
            });
          } else {
            setAttachedFile({
              name: file.name,
              size: file.size,
              type: file.type || 'image/jpeg',
              isImage: true,
              dataUrl: rawDataUrl,
              previewUrl: rawDataUrl,
            });
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    } else if (file.type.includes('text') || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          isImage: false,
          content: event.target.result,
        });
      };
      reader.readAsText(file);
    } else {
      // Store PDF or document metadata
      setAttachedFile({
        name: file.name,
        size: file.size,
        type: file.type || 'application/pdf',
        isImage: false,
        content: `[Attached Document: ${file.name}, ${(file.size / 1024).toFixed(1)} KB]`,
      });
    }
  };

  const handleRemoveAttachedFile = () => {
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const promptText = inputMessage.trim();
    if (!promptText && !attachedFile) return;
    if (isSending) return;

    let fullMessage = promptText;
    let imagePayload = null;

    if (attachedFile) {
      if (attachedFile.isImage) {
        imagePayload = attachedFile.dataUrl;
        if (!fullMessage) {
          fullMessage = `📎 [Exam Question Image: ${attachedFile.name}]\nPlease analyze this uploaded question/diagram image and provide the step-by-step exam solution.`;
        }
      } else {
        const fileHeader = `📎 [Attached Document: ${attachedFile.name} (${(attachedFile.size / 1024).toFixed(1)} KB)]`;
        if (!fullMessage) {
          fullMessage = `${fileHeader}\nPlease examine this attached document and provide a complete summary of its questions, formulas, and concepts.`;
        } else {
          fullMessage = `${fileHeader}\n${fullMessage}`;
        }
        if (attachedFile.content && !attachedFile.content.startsWith('[Attached')) {
          fullMessage += `\n\n--- Document Text Content ---\n${attachedFile.content.slice(0, 3000)}`;
        }
      }
    }

    const payload = {
      message: fullMessage,
      imageUrl: imagePayload,
      collegeId: college?.id,
      departmentId: department?.id,
      subjectId: subjects[0]?.id,
    };

    if (!activeSessionId) {
      const tempId = `session_${Date.now()}`;
      dispatch(
        createAiSession({
          title: (promptText || attachedFile?.name || 'Exam Paper Query').slice(0, 30) + '...',
          subjectId: subjects[0]?.id || null,
        })
      ).then((res) => {
        const targetSessionId = res.payload?.id || tempId;
        dispatch(
          sendAiMessage({
            sessionId: targetSessionId,
            ...payload,
          })
        );
      });
    } else {
      dispatch(
        sendAiMessage({
          sessionId: activeSessionId,
          ...payload,
        })
      );
    }

    setInputMessage('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
    <div className={`space-y-3 sm:space-y-5 font-['Roboto',sans-serif] ${isFullScreen ? 'fixed inset-0 z-50 p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl overflow-y-auto' : ''}`}>
      {/* Top Banner & Exam Solver Wizard Gateway */}
      <div className="p-3.5 sm:p-6 rounded-3xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini 2.0 Flash • Repository-Aware RAG</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 sm:gap-3">
            <span>AI Exam Assistant & Solver</span>
            {isFullScreen && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Focus Mode
              </span>
            )}
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Contextually answers syllabus questions grounded in {college?.code || 'University'} past papers & lecture notes.
          </p>
        </div>

        <div className="w-full sm:w-auto grid grid-cols-2 sm:flex sm:items-center gap-2 sm:space-x-3">
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            id="toggle-ai-focus-screen-btn"
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl neu-button text-xs font-bold text-slate-200 hover:text-white flex items-center justify-center space-x-1.5 border border-slate-700/60 cursor-pointer"
            title={isFullScreen ? 'Exit Separate Focus Screen' : 'Open in Separate Screen'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Separate Screen</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsSolverOpen(true)}
            id="launch-paper-solver-btn"
            className="px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl neu-button text-xs font-bold text-white shadow-glow flex items-center justify-center space-x-1.5 border-amber-500/40 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Solver</span>
          </button>
        </div>
      </div>

      {/* RAG Repository Search Quick Query Bar */}
      <div className="p-3 sm:p-4 rounded-2xl neu-flat">
        <form onSubmit={handleRagSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 sm:top-3" />
            <input
              type="text"
              id="rag-search-input"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder="RAG Search: e.g. 'Explain OSI layers and checksum'..."
              className="w-full pl-9 pr-3 py-2 sm:py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl neu-button text-xs font-bold text-brand-300 hover:text-white flex items-center space-x-1.5 cursor-pointer"
          >
            {isSearching ? (
              <Cpu className="w-3.5 h-3.5 animate-spin text-brand-400" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">RAG Query</span>
            <span className="sm:hidden">Query</span>
          </button>
        </form>

        {/* RAG Results Display */}
        {ragResults && (
          <div className="mt-3 p-3.5 rounded-xl neu-pressed animate-fade-in space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-bold text-brand-300 uppercase tracking-wider">
                Grounded Repository Synthesis ({ragResults.totalSourcesFound} Sources)
              </span>
              <div className="flex items-center space-x-2">
                <TextToSpeechButton text={ragResults.answer} />
                <button
                  onClick={() => dispatch(clearRagResults())}
                  className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="text-xs text-slate-200 leading-relaxed">
              <MarkdownMessage content={ragResults.answer} />
            </div>

            {ragResults.citations?.length > 0 && (
              <div className="pt-2 border-t border-slate-700/30 flex flex-wrap gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase">Citations:</span>
                {ragResults.citations.map((c) => (
                  <span
                    key={c.id}
                    className="px-2 py-0.5 rounded-md neu-button text-[9px] text-slate-300"
                  >
                    {c.title}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Sessions Toggle Bar */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowMobileSessions(!showMobileSessions)}
          className="flex-1 py-2 px-3 rounded-2xl neu-flat text-xs font-bold text-slate-300 flex items-center justify-between cursor-pointer"
        >
          <span className="flex items-center space-x-2 truncate">
            <MessageSquare className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <span className="truncate">Sessions ({sessions.length})</span>
          </span>
          {showMobileSessions ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </button>
        <button
          type="button"
          onClick={handleCreateNewChat}
          className="p-2 rounded-2xl neu-button text-brand-400 hover:text-white flex items-center justify-center cursor-pointer"
          title="New Chat Session"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Main Two-Column Chat Experience with Expanded Viewport */}
      <div className={`grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-6 ${isFullScreen ? 'min-h-[calc(100vh-160px)]' : 'min-h-[480px] sm:min-h-[680px]'}`}>
        {/* Left Column: Private Sessions Sidebar (Collapsible on mobile) */}
        <div className={`lg:col-span-1 rounded-3xl neu-flat p-3 sm:p-4 flex flex-col justify-between space-y-3 ${showMobileSessions ? 'block animate-fade-in' : 'hidden lg:flex'}`}>
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Chat Sessions
              </span>
              <button
                onClick={handleCreateNewChat}
                id="new-ai-chat-btn"
                className="p-1.5 rounded-lg neu-button text-slate-300 hover:text-white cursor-pointer"
                title="Create New Session"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Sessions List */}
            <div className="space-y-1.5 max-h-48 lg:max-h-[520px] overflow-y-auto pr-1">
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
        <div className={`lg:col-span-3 rounded-3xl neu-flat p-3 sm:p-6 flex flex-col justify-between ${isFullScreen ? 'min-h-[calc(100vh-180px)]' : 'min-h-[460px] sm:min-h-[660px]'}`}>
          {/* Messages Feed - Expansive Height */}
          <div className={`space-y-3 sm:space-y-4 overflow-y-auto pr-1 sm:pr-2 ${isFullScreen ? 'max-h-[calc(100vh-320px)] min-h-[400px]' : 'max-h-[500px] sm:max-h-[560px] min-h-[320px] sm:min-h-[460px]'}`}>
            {messages.length === 0 && (
              <div className="text-center py-8 sm:py-16 space-y-3 sm:space-y-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl neu-button mx-auto flex items-center justify-center text-brand-400">
                  <Bot className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">Ask Studix Exam AI</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 max-w-md mx-auto">
                  Ask questions, request step-by-step derivations, or click below for quick prompt formats:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 pt-1">
                  {[
                    'Explain OSI layers with standard diagrams',
                    'Derive Go-Back-N protocol mechanism (10 Marks)',
                    'Lexical Analyzer vs Parser in Compiler Design',
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => setInputMessage(sug)}
                      className="px-2.5 py-1.5 rounded-xl neu-button text-[10px] sm:text-[11px] text-slate-300 hover:text-brand-300 cursor-pointer text-left"
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
                        ? 'neu-button text-slate-900 dark:text-white font-medium border border-brand-500/40 bg-white dark:bg-[#191f2e]'
                        : 'neu-pressed text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center justify-between space-x-1.5 text-brand-500 dark:text-brand-400 font-bold mb-2 text-[10px] uppercase">
                        <div className="flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Gemini 2.5 Flash Vision</span>
                        </div>
                        <TextToSpeechButton text={m.message} />
                      </div>
                    )}
                    {isUser ? (
                      <div className="space-y-2">
                        {m.imageUrl && (
                          <div className="rounded-xl overflow-hidden border border-brand-500/30 max-w-[260px] shadow-md">
                            <img
                              src={m.imageUrl}
                              alt="Attached Exam Question / Diagram"
                              className="w-full h-auto object-cover max-h-60"
                            />
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{m.message}</div>
                      </div>
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

          {/* Attached Document / Exam Image Preview Badge */}
          {attachedFile && (
            <div className="mt-2.5 p-2 px-3 rounded-2xl bg-brand-500/15 border border-brand-500/40 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center space-x-2.5 text-brand-300 min-w-0">
                {attachedFile.isImage ? (
                  <img
                    src={attachedFile.previewUrl}
                    alt="Uploaded Question Preview"
                    className="w-10 h-10 rounded-xl object-cover border border-brand-500/40 flex-shrink-0 shadow-md"
                  />
                ) : (
                  <Paperclip className="w-4 h-4 text-brand-400 flex-shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold truncate max-w-[200px] sm:max-w-xs">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {attachedFile.isImage ? '📸 Exam Image Ready for AI Vision Analysis' : `${(attachedFile.size / 1024).toFixed(1)} KB Document`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachedFile}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Remove attached file"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Prompt Input */}
          <form onSubmit={handleSendMessage} className="mt-2 flex items-center space-x-1.5 sm:space-x-2">
            {/* Hidden File Input for RAG & Vision Image Attachment */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,image/*"
              className="hidden"
            />

            {/* Direct File Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              id="rag-chat-file-upload-btn"
              title="Upload question photo, diagram, or PDF to solve directly with AI"
              className={`p-3 rounded-2xl neu-button transition-all flex items-center justify-center cursor-pointer ${
                attachedFile
                  ? 'text-brand-400 border-brand-500/40 bg-brand-500/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                id="ai-prompt-input"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  attachedFile
                    ? (attachedFile.isImage ? "Ask about this question image, or tap Send to analyze..." : `Ask questions about ${attachedFile.name}...`)
                    : "Ask question, paste syllabus problem, or attach exam photo..."
                }
                className="w-full px-3.5 sm:px-4 py-3 rounded-2xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <VoiceButton onTranscript={(txt) => setInputMessage(txt)} />

            <button
              type="submit"
              disabled={isSending || (!inputMessage.trim() && !attachedFile)}
              id="send-ai-prompt-btn"
              className="p-3 rounded-2xl neu-button text-brand-400 hover:text-white shadow-glow disabled:opacity-40 transition-all flex-shrink-0"
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
