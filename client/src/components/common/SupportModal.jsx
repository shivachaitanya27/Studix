import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Headphones,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  PlusCircle,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api.js';

const CATEGORIES = [
  'General Query',
  'Resource Upload',
  'Exam & Model Papers',
  'Academic Stream / Branch',
  'Bug Report / Feedback',
];

export const SupportModal = ({ isOpen, onClose, user }) => {
  const [view, setView] = useState('list'); // 'list' | 'create' | 'chat'
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // New ticket state
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [initialMessage, setInitialMessage] = useState('');
  const [createError, setCreateError] = useState('');

  // Chat reply state
  const [replyText, setReplyText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (view === 'chat' && activeTicket?.messages) {
      scrollToBottom();
    }
  }, [view, activeTicket?.messages]);

  // Load user tickets
  const fetchTickets = async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    try {
      const res = await api.get('/support/my-tickets');
      if (res.data?.success) {
        setTickets(res.data.data || []);
      }
    } catch (err) {
      console.warn('Could not fetch support tickets:', err);
    } finally {
      if (!quiet) setIsLoading(false);
    }
  };

  // Refresh active ticket details for real-time chat
  const refreshActiveTicket = async (ticketId) => {
    try {
      const res = await api.get(`/support/tickets/${ticketId}`);
      if (res.data?.success) {
        setActiveTicket(res.data.data);
      }
    } catch (err) {
      console.warn('Could not refresh active ticket:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen]);

  // Polling every 4 seconds when viewing an active chat
  useEffect(() => {
    if (!isOpen || view !== 'chat' || !activeTicket?.id) return;
    const interval = setInterval(() => {
      refreshActiveTicket(activeTicket.id);
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen, view, activeTicket?.id]);

  // Handle new ticket submission
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !initialMessage.trim()) {
      setCreateError('Please fill in both the subject and your inquiry message.');
      return;
    }
    setCreateError('');
    setIsSending(true);
    try {
      const res = await api.post('/support/tickets', {
        subject: subject.trim(),
        category,
        message: initialMessage.trim(),
      });
      if (res.data?.success) {
        setSubject('');
        setInitialMessage('');
        setActiveTicket(res.data.data);
        setView('chat');
        fetchTickets(true);
      }
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle sending a chat message in active ticket
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket?.id || isSending) return;

    const textToSend = replyText.trim();
    setReplyText('');
    setIsSending(true);

    try {
      const res = await api.post(`/support/tickets/${activeTicket.id}/messages`, {
        content: textToSend,
      });
      if (res.data?.success) {
        setActiveTicket((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), res.data.data],
        }));
        fetchTickets(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl bg-white dark:bg-[#111625] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-600/10 to-indigo-600/5">
          <div className="flex items-center space-x-3">
            {view !== 'list' && (
              <button
                onClick={() => {
                  setView('list');
                  setActiveTicket(null);
                  fetchTickets(true);
                }}
                className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-white transition-colors"
                title="Back to inquiries list"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-brand-500/15 text-brand-400 flex items-center justify-center border border-brand-500/30">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Student Support Hub
                </h3>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Admin Online</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct inquiry and chat with Administrator Shiva Chaitanya
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {view === 'chat' && (
              <button
                onClick={() => refreshActiveTicket(activeTicket?.id)}
                className="p-2 rounded-xl neu-button text-slate-400 hover:text-brand-400 transition-colors"
                title="Refresh conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl neu-button text-slate-400 hover:text-rose-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[360px]">
          {/* VIEW 1: TICKETS LIST */}
          {view === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Your Inquiries ({tickets.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Submit questions regarding uploads, notes, syllabus, or platform help.
                  </p>
                </div>
                <button
                  onClick={() => setView('create')}
                  className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-brand-500/20 transition-transform active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Inquiry</span>
                </button>
              </div>

              {isLoading ? (
                <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
                  <span>Loading inquiries...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                    No inquiries yet
                  </h5>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Have a question or looking for specific model papers? Click below to chat directly with Admin Shiva.
                  </p>
                  <button
                    onClick={() => setView('create')}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs inline-flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Ask Your First Question</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tickets.map((ticket) => {
                    const isResolved = ticket.status === 'RESOLVED';
                    const isInProgress = ticket.status === 'IN_PROGRESS';
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => {
                          setActiveTicket(ticket);
                          setView('chat');
                        }}
                        className="p-3.5 rounded-2xl neu-flat hover:border-brand-500/30 transition-all cursor-pointer group flex items-center justify-between border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex-1 min-w-0 pr-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-brand-400 transition-colors">
                              {ticket.subject}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                isResolved
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : isInProgress
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                              }`}
                            >
                              {ticket.status}
                            </span>
                            <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {ticket.category || 'General'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 truncate">
                            {ticket.last_message || 'Inquiry created.'}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {new Date(ticket.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: CREATE NEW TICKET */}
          {view === 'create' && (
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                  Submit a Query to Admin
                </h4>
                <p className="text-xs text-slate-400 mb-3">
                  Admin Shiva Chaitanya will review your query and reply directly inside this chat thread.
                </p>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              {/* Category Pills */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-2.5 py-1 text-xs rounded-xl font-medium transition-all ${
                        category === cat
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                          : 'neu-button text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Need 3rd Sem AI-DS Previous Papers / Issue with file download"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                  required
                />
              </div>

              {/* Message Details */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Query Details / Question *
                </label>
                <textarea
                  rows={4}
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-brand-500/25 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW 3: LIVE CHAT THREAD */}
          {view === 'chat' && activeTicket && (
            <div className="flex flex-col h-[400px]">
              {/* Ticket Context Pill */}
              <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 mb-3 flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] text-brand-400 font-extrabold uppercase tracking-wider block">
                    {activeTicket.category || 'General'} • Ticket #{activeTicket.id.slice(-6)}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeTicket.subject}
                  </h4>
                </div>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    activeTicket.status === 'RESOLVED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-brand-500/20 text-brand-400'
                  }`}
                >
                  {activeTicket.status}
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {(activeTicket.messages || []).map((msg) => {
                  const isAdmin = msg.sender_role === 'ADMIN';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                    >
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mb-0.5">
                        {isAdmin ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-purple-400" />
                            <span className="font-bold text-purple-400">Shiva Chaitanya (Admin)</span>
                          </>
                        ) : (
                          <span className="font-semibold text-slate-300">You</span>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                          isAdmin
                            ? 'bg-purple-900/30 text-purple-100 border border-purple-500/30 rounded-tl-sm'
                            : 'bg-brand-600 text-white rounded-tr-sm shadow-md shadow-brand-500/20'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendMessage} className="pt-3 flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    activeTicket.status === 'RESOLVED'
                      ? 'Ticket marked as resolved. Type to reopen...'
                      : 'Type your message to Admin...'
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim() || isSending}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition-all disabled:opacity-40 shadow-md shadow-brand-500/20"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SupportModal;
