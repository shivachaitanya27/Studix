import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  ArrowUp,
  Square,
  Plus,
  MessageSquare,
  Trash2,
  Cpu,
  Search,
  Bot,
  User as UserIcon,
  Maximize2,
  Minimize2,
  Paperclip,
  X,
  Copy,
  Check,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  PanelLeftClose,
  PanelLeftOpen,
  BookOpen,
  FileText,
  Sliders,
  Sparkle,
  Image as ImageIcon,
} from 'lucide-react';
import {
  fetchAiSessions,
  createAiSession,
  deleteAiSession,
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
import { selectCurrentUser } from '../../redux/authSlice.js';
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

export const AIAssistantPage = () => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const user = useSelector(selectCurrentUser);
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [attachedFile, setAttachedFile] = useState(null);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [showRagSearch, setShowRagSearch] = useState(false);

  // 1. Fetch user's private sessions on mount and whenever user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAiSessions());
    }
  }, [dispatch, user?.id]);

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

  // 4. Auto-resize textarea like ChatGPT
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, 44), 180)}px`;
    }
  }, [inputMessage]);

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this chat session?')) {
      dispatch(deleteAiSession(sessionId));
    }
  };

  const handleCreateNewChat = () => {
    dispatch(
      createAiSession({
        title: `Exam Prep (${department?.code || 'CSE'} - ${new Date().toLocaleDateString()})`,
        subjectId: subjects[0]?.id || null,
      })
    );
  };

  const handleExamChipClick = (prefix) => {
    setInputMessage((prev) => (prev.trim() ? `${prefix} ${prev}` : `${prefix} `));
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (e) e.preventDefault();
    const promptText = inputMessage.trim();
    if (!promptText && !attachedFile) return;
    if (isSending) return;

    let fullMessage = promptText;
    let imagePayload = null;

    if (attachedFile) {
      if (attachedFile.isImage) {
        imagePayload = attachedFile.dataUrl;
        if (!fullMessage) {
          fullMessage = `📎 [Exam Question Image: ${attachedFile.name}]\nPlease inspect this question paper / diagram image and provide the step-by-step solution.`;
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
          title: (promptText || attachedFile?.name || 'Exam Query').slice(0, 32) + '...',
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
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Copy response action
  const handleCopyMessage = async (msgId, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsgId(msgId);
      setTimeout(() => setCopiedMsgId(null), 2000);
    } catch {
      // ignore
    }
  };

  // Thumbs up / down feedback action
  const handleFeedback = (msgId, type) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type,
    }));
  };

  // Regenerate last response
  const handleRegenerate = (msgIndex) => {
    if (isSending) return;
    let lastUserPrompt = '';
    let lastUserImg = null;
    for (let i = msgIndex; i >= 0; i--) {
      if (messages[i]?.sender === 'user') {
        lastUserPrompt = messages[i].message;
        lastUserImg = messages[i].imageUrl;
        break;
      }
    }
    if (lastUserPrompt || lastUserImg) {
      dispatch(
        sendAiMessage({
          sessionId: activeSessionId,
          message: lastUserPrompt,
          imageUrl: lastUserImg,
          collegeId: college?.id,
          departmentId: department?.id,
          subjectId: subjects[0]?.id || null,
        })
      );
    }
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
    <div className={`font-['Roboto',sans-serif] ${isFullScreen ? 'fixed inset-0 z-50 p-2 sm:p-4 bg-[#0e121d] overflow-hidden' : ''}`}>
      {/* Main Container: ChatGPT Two-Column Layout */}
      <div className={`rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#111522]/95 backdrop-blur-xl shadow-2xl flex overflow-hidden ${isFullScreen ? 'h-full' : 'h-[calc(100vh-140px)] min-h-[560px]'}`}>

        {/* 1. LEFT SIDEBAR (ChatGPT Sidebar Style) */}
        <div
          className={`transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0c101a]/90 flex flex-col justify-between ${
            isSidebarOpen ? 'w-64 sm:w-72 p-3.5' : 'w-0 p-0 overflow-hidden border-none'
          }`}
        >
          {isSidebarOpen && (
            <>
              <div className="space-y-3">
                {/* "+ New Chat" Button */}
                <button
                  type="button"
                  onClick={handleCreateNewChat}
                  id="chatgpt-new-chat-btn"
                  className="w-full py-2.5 px-3 rounded-2xl bg-white dark:bg-[#161c2c] border border-slate-200 dark:border-slate-700/60 hover:border-brand-500/50 text-slate-800 dark:text-slate-200 hover:text-brand-500 dark:hover:text-brand-300 text-xs font-bold transition-all shadow-sm flex items-center justify-between group cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <Plus className="w-4 h-4 text-brand-500 group-hover:scale-110 transition-transform" />
                    <span>New chat</span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">⌘N</span>
                </button>

                {/* Chat History Header */}
                <div className="flex items-center justify-between px-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>Recent Sessions</span>
                  <span className="text-[10px] text-slate-500">({sessions.length})</span>
                </div>

                {/* Sessions Scrollable List */}
                <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-360px)] pr-1 scrollbar-thin">
                  {sessions.map((sess) => {
                    const isActive = activeSessionId === sess.id;
                    return (
                      <div
                        key={sess.id}
                        onClick={() => dispatch(setActiveSessionId(sess.id))}
                        className={`group w-full p-2 rounded-xl text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isActive
                            ? 'bg-brand-500/15 border border-brand-500/40 text-brand-600 dark:text-brand-300 font-bold shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1 mr-1">
                          <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-brand-500' : 'text-slate-400'}`} />
                          <span className="truncate text-[11px]">{sess.title || 'Chat Session'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-500 text-slate-400 rounded transition-opacity"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {sessions.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic p-3 text-center">
                      No prior chats. Start a new conversation above.
                    </p>
                  )}
                </div>
              </div>

              {/* Sidebar Footer with User Profile Badge */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-cyan flex items-center justify-center text-white font-black text-xs shadow-sm flex-shrink-0">
                  {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 truncate block">
                    {user?.full_name || 'Academic Scholar'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate block">
                    {department?.code || 'Engineering'} • Sem {semester || 1}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 2. RIGHT CHAT CANVAS (ChatGPT Stream & Input) */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#111522]">

          {/* Top Header Bar */}
          <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              {/* Sidebar Toggle Button */}
              <button
                type="button"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                id="chatgpt-sidebar-toggle-btn"
                className="p-2 rounded-xl neu-button text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
              >
                {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              </button>

              {/* ChatGPT Model Badge */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Studix GPT • {department?.code || 'CSE'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-accent-emerald/20 text-accent-emerald">
                  2.5 Flash
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                type="button"
                onClick={() => setShowRagSearch(!showRagSearch)}
                className={`p-2 rounded-xl neu-button text-xs font-bold transition-all flex items-center space-x-1 ${
                  showRagSearch ? 'text-accent-cyan border border-accent-cyan/40 bg-cyan-500/10' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Search campus repository documents"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">RAG Search</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSolverOpen(true)}
                id="launch-paper-solver-btn"
                className="px-2.5 py-1.5 rounded-xl neu-button text-xs font-bold text-amber-500 dark:text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 flex items-center space-x-1 cursor-pointer border border-amber-500/30"
              >
                <Sparkle className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden sm:inline">Exam Solver</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 rounded-xl neu-button text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title={isFullScreen ? 'Exit fullscreen' : 'Full screen'}
              >
                {isFullScreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Optional RAG Repository Search Panel */}
          {showRagSearch && (
            <div className="p-3 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 animate-fade-in">
              <form onSubmit={handleRagSearch} className="flex gap-2 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={ragQuery}
                    onChange={(e) => setRagQuery(e.target.value)}
                    placeholder="Search past papers and notes for context..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl neu-pressed text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-brand-500 flex items-center space-x-1 cursor-pointer"
                >
                  {isSearching ? <Cpu className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Search</span>
                </button>
              </form>

              {ragResults && (
                <div className="mt-2.5 p-3 rounded-xl neu-pressed text-xs text-slate-700 dark:text-slate-300 max-w-2xl mx-auto space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-brand-500 uppercase">
                      Grounded Synthesis ({ragResults.totalSourcesFound} Sources)
                    </span>
                    <button onClick={() => dispatch(clearRagResults())} className="text-[10px] text-slate-400 hover:text-slate-200">Close</button>
                  </div>
                  <MarkdownMessage content={ragResults.answer} />
                </div>
              )}
            </div>
          )}

          {/* Conversation Stream (Center-Aligned like ChatGPT) */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-6">
            <div className="max-w-3xl mx-auto w-full space-y-6">

              {/* ChatGPT Empty Welcome State */}
              {messages.length === 0 && (
                <div className="py-8 sm:py-16 text-center space-y-6 animate-fade-in">
                  <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 to-accent-violet mx-auto flex items-center justify-center text-white shadow-glow">
                    <Bot className="w-7 h-7" />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      What can I help you learn today?
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                      Grounded in {college?.code || 'campus'} engineering curriculum, past examination papers, and step-by-step scoring templates.
                    </p>
                  </div>

                  {/* 4 ChatGPT Prompt Suggestion Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto text-left pt-2">
                    {[
                      {
                        title: '📝 10-Mark Essay Solution',
                        prompt: 'Explain OSI Reference Model layers with complete protocol mechanism, ASCII diagram, and comparison with TCP/IP.',
                      },
                      {
                        title: '💻 Code & Algorithm Analysis',
                        prompt: "Write Dijkstra's shortest path algorithm with full C++ code, step-by-step trace table, and time complexity.",
                      },
                      {
                        title: '⚡ Quick 2-Mark Formulas',
                        prompt: 'Summarize Unit 3 core formulas, laws, and 2-mark definitions for quick university exam revision.',
                      },
                      {
                        title: '📊 Tabular Comparison & Diagrams',
                        prompt: 'Provide an elaborate comparison table between TCP and UDP with packet headers and use cases.',
                      },
                    ].map((card, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setInputMessage(card.prompt);
                          textareaRef.current?.focus();
                        }}
                        className="p-3.5 rounded-2xl neu-button text-left transition-all hover:scale-[1.01] cursor-pointer group"
                      >
                        <span className="font-black text-xs text-slate-800 dark:text-slate-200 group-hover:text-brand-500 dark:group-hover:text-brand-400 block mb-1">
                          {card.title}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {card.prompt}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Message Bubbles */}
              {messages.map((m, idx) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div className={`flex items-start space-x-3 max-w-[95%] sm:max-w-[88%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                        isUser
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          : 'bg-gradient-to-tr from-brand-600 to-accent-violet text-white'
                      }`}>
                        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Message Content Bubble */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div
                          className={`p-4 sm:p-5 rounded-3xl text-xs leading-relaxed ${
                            isUser
                              ? 'bg-slate-100 dark:bg-[#181e2e] border border-slate-200 dark:border-slate-700/60 text-slate-900 dark:text-white font-medium rounded-tr-sm'
                              : 'bg-transparent text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {isUser ? (
                            <div className="space-y-2">
                              {m.imageUrl && (
                                <div className="rounded-2xl overflow-hidden border border-brand-500/30 max-w-[280px] shadow-md">
                                  <img
                                    src={m.imageUrl}
                                    alt="Uploaded Exam Attachment"
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

                        {/* ChatGPT Assistant Action Bar (Copy, Regenerate, Thumbs, TTS) */}
                        {!isUser && (
                          <div className="flex items-center space-x-1.5 pl-2 text-slate-400 text-xs">
                            {/* Copy button */}
                            <button
                              type="button"
                              onClick={() => handleCopyMessage(m.id || idx, m.message)}
                              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                              title="Copy response"
                            >
                              {copiedMsgId === (m.id || idx) ? (
                                <span className="flex items-center space-x-1 text-emerald-500 font-bold text-[10px]">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied!</span>
                                </span>
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Regenerate button */}
                            <button
                              type="button"
                              onClick={() => handleRegenerate(idx)}
                              disabled={isSending}
                              className="p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                              title="Regenerate response"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>

                            {/* Thumbs up */}
                            <button
                              type="button"
                              onClick={() => handleFeedback(m.id || idx, 'up')}
                              className={`p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                feedbackMap[m.id || idx] === 'up' ? 'text-emerald-500' : 'hover:text-slate-700 dark:hover:text-white'
                              }`}
                              title="Good response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Thumbs down */}
                            <button
                              type="button"
                              onClick={() => handleFeedback(m.id || idx, 'down')}
                              className={`p-1.5 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                                feedbackMap[m.id || idx] === 'down' ? 'text-rose-500' : 'hover:text-slate-700 dark:hover:text-white'
                              }`}
                              title="Bad response"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Text to Speech */}
                            <TextToSpeechButton text={m.message} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ChatGPT Thinking / Typing Indicator */}
              {isSending && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="p-3.5 rounded-2xl neu-pressed text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      <span className="text-[11px] font-medium">Studix AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 3. BOTTOM CHATGPT PROMPT INPUT CAPSULE (Pinned at Bottom) */}
          <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/95 dark:bg-[#111522]/95 backdrop-blur-md">
            <div className="max-w-3xl mx-auto w-full space-y-2">

              {/* Attached file thumbnail / chip preview */}
              {attachedFile && (
                <div className="p-2 px-3 rounded-2xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-between text-xs animate-fade-in">
                  <div className="flex items-center space-x-2 min-w-0">
                    {attachedFile.isImage ? (
                      <img
                        src={attachedFile.previewUrl}
                        alt="Question preview"
                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow"
                      />
                    ) : (
                      <Paperclip className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate text-[11px]">
                      {attachedFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveAttachedFile}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Prompt Box Capsule */}
              <div className="relative rounded-3xl neu-pressed border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#0c101a]/90 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-brand-500/40">
                {/* Auto-expanding Multiline Textarea */}
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    attachedFile
                      ? 'Ask about this question image or press send...'
                      : 'Ask anything about your syllabus, past papers, or engineering concepts...'
                  }
                  rows={1}
                  className="w-full px-2 py-1.5 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-44 leading-relaxed font-sans"
                />

                {/* Bottom Tools inside the Capsule */}
                <div className="flex items-center justify-between pt-1 mt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {/* Hidden file input */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt,image/*"
                      className="hidden"
                    />

                    {/* Paperclip button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Attach question photo or document"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    {/* Voice Dictation Button */}
                    <VoiceButton onTranscript={(txt) => setInputMessage((prev) => (prev ? `${prev} ${txt}` : txt))} />

                    {/* Quick format chip */}
                    <div className="hidden sm:flex items-center space-x-1 pl-1">
                      {[
                        { label: 'Part-A', prefix: '[Part-A: 2 Marks]' },
                        { label: 'Part-B', prefix: '[Part-B: 10 Marks]' },
                        { label: 'Formulas', prefix: '[Core Formulas]' },
                      ].map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleExamChipClick(c.prefix)}
                          className="px-2 py-0.5 rounded-lg bg-slate-200/60 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 hover:text-brand-500 transition-colors"
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send / Stop Generating Button */}
                  <div>
                    {isSending ? (
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700 transition-colors animate-pulse cursor-pointer"
                        title="AI generating..."
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={!inputMessage.trim() && !attachedFile}
                        id="send-ai-prompt-btn"
                        className="w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center shadow-glow disabled:opacity-30 disabled:hover:bg-brand-600 transition-all cursor-pointer active:scale-95"
                        title="Send prompt (Enter)"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ChatGPT Disclaimer Note */}
              <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-tight">
                Studix AI can make mistakes. Verify critical academic formulas and university syllabus specifications.
              </p>
            </div>
          </div>
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
