import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  BarChart3,
  ListOrdered,
  Activity,
  Calendar,
  Building2,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Clock,
  X,
  Download,
  Trash2,
  FolderOpen,
  Search,
  CheckSquare,
  Square,
  Filter,
  GraduationCap,
  Edit3,
  SlidersHorizontal,
  Users,
  School,
  Headphones,
  MessageSquareHeart,
  Send,
  Star,
  RefreshCw,
  LogOut
} from 'lucide-react';
import api, { getAdminUser, clearAdminSession } from '../services/api.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getAdminUser());

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'users' | 'support' | 'feedback' | 'analytics' | 'logs' | 'all'
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Student Support State
  const [supportTickets, setSupportTickets] = useState([]);
  const [activeSupportTicket, setActiveSupportTicket] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [supportFilterStatus, setSupportFilterStatus] = useState('ALL');
  const [supportSearch, setSupportSearch] = useState('');

  // First-Time Feedback State
  const [feedbacksData, setFeedbacksData] = useState({
    metrics: { total: 0, avgRating: 0, distribution: {}, popularTags: [] },
    feedbacks: [],
  });

  // Multi-Tenant Global College & Stream Filter State
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedAdminCollege, setSelectedAdminCollege] = useState('ALL');
  const [selectedAdminDept, setSelectedAdminDept] = useState('ALL');
  const [selectedAdminYear, setSelectedAdminYear] = useState('ALL');
  const [selectedAdminSemester, setSelectedAdminSemester] = useState('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');

  // Campus Scholars & Users Governance State
  const [usersList, setUsersList] = useState([]);
  const [selectedUserDept, setSelectedUserDept] = useState('ALL');
  const [selectedUserCollege, setSelectedUserCollege] = useState('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [userStreamForm, setUserStreamForm] = useState({
    collegeId: '',
    departmentId: '',
    academicYear: '1',
    semester: '1',
  });
  const [isSavingUserStream, setIsSavingUserStream] = useState(false);

  // Bulk Clean / Purge Selection State
  const [selectedResourceIds, setSelectedResourceIds] = useState(new Set());
  const [isBulkCleaning, setIsBulkCleaning] = useState(false);
  const [isPurgingStream, setIsPurgingStream] = useState(false);

  // Edit Stream Modal State
  const [editingStreamResource, setEditingStreamResource] = useState(null);
  const [streamEditForm, setStreamEditForm] = useState({
    title: '',
    departmentId: '',
    academicYear: '1',
    semester: '1',
    subjectName: '',
  });
  const [isSavingStream, setIsSavingStream] = useState(false);

  // Review Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // 1. Role & Identity Guard Check
  useEffect(() => {
    const currentUser = getAdminUser();
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const isAuthorizedAdmin =
      (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') &&
      (currentUser.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

    if (!isAuthorizedAdmin) {
      clearAdminSession();
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // 2. Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, logsRes, analyticsRes, allRes, collegesRes, deptsRes, usersRes, supportRes, feedbackRes] = await Promise.all([
        api.get('/admin/moderation/queue').catch(() => ({ data: { data: [] } })),
        api.get('/admin/moderation/logs').catch(() => ({ data: { data: [] } })),
        api.get('/admin/analytics').catch(() => ({ data: { data: null } })),
        api.get('/resources?status=ALL').catch(() => ({ data: { data: [] } })),
        api.get('/academic/colleges').catch(() => api.get('/colleges')).catch(() => ({ data: { data: [] } })),
        api.get('/academic/departments').catch(() => api.get('/departments')).catch(() => ({ data: { data: [] } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } })),
        api.get('/support/admin/tickets').catch(() => ({ data: { data: [] } })),
        api.get('/feedback/admin').catch(() => ({ data: { data: { feedbacks: [], metrics: {} } } })),
      ]);
      setQueue(queueRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setAllResources(allRes.data.data || []);
      setColleges(collegesRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      setUsersList(usersRes.data.data || []);
      setSupportTickets(supportRes.data.data || []);
      setFeedbacksData(feedbackRes.data.data || { metrics: { total: 0, avgRating: 0, distribution: {}, popularTags: [] }, feedbacks: [] });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    clearAdminSession();
    navigate('/login', { replace: true });
  };

  const handleSendAdminReply = async (e) => {
    e.preventDefault();
    if (!adminReplyText.trim() || !activeSupportTicket?.id || isSendingReply) return;
    const text = adminReplyText.trim();
    setAdminReplyText('');
    setIsSendingReply(true);
    try {
      const res = await api.post(`/support/tickets/${activeSupportTicket.id}/messages`, {
        content: text,
      });
      if (res.data?.success) {
        const newMsg = res.data.data;
        setActiveSupportTicket((prev) => ({
          ...prev,
          messages: [...(prev?.messages || []), newMsg],
          last_message: text,
        }));
        setSupportTickets((prev) =>
          prev.map((t) =>
            t.id === activeSupportTicket.id
              ? { ...t, last_message: text, messages: [...(t.messages || []), newMsg] }
              : t
          )
        );
      }
    } catch (err) {
      alert('Failed to send reply: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/support/admin/tickets/${ticketId}/status`, { status: newStatus });
      setActiveSupportTicket((prev) => (prev?.id === ticketId ? { ...prev, status: newStatus } : prev));
      setSupportTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      setActionSuccess(`Ticket status updated to ${newStatus}`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to update ticket status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveUserStream = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUserStream(true);
    try {
      await api.patch(`/admin/users/${editingUser.id}/stream`, {
        collegeId: userStreamForm.collegeId,
        departmentId: userStreamForm.departmentId,
        academicYear: Number(userStreamForm.academicYear),
        semester: Number(userStreamForm.semester),
      });
      setActionSuccess(`Successfully updated academic stream for ${editingUser.full_name || editingUser.email}`);
      setEditingUser(null);
      await fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to update user stream: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingUserStream(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/moderation/${id}/approve`);
      setActionSuccess('Resource verified and approved for public access.');
      setSelectedResource(null);
      fetchData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to approve resource: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      alert('Please provide an actionable rejection reason.');
      return;
    }
    try {
      await api.post(`/admin/moderation/${id}/reject`, { rejectionReason });
      setActionSuccess('Resource rejected and student notified.');
      setSelectedResource(null);
      setRejectionReason('');
      fetchData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to reject resource: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Permanently PURGE "${resource.title}" from Supabase database and storage?`)) {
      return;
    }
    try {
      await api.delete(`/admin/resources/${resource.id}`);
      setActionSuccess(`Resource "${resource.title}" permanently purged.`);
      fetchData();
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      alert('Failed to delete resource: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleBulkClean = async () => {
    if (selectedResourceIds.size === 0) return;
    if (!window.confirm(`Are you sure you want to permanently PURGE ${selectedResourceIds.size} selected files?`)) {
      return;
    }
    try {
      setIsBulkCleaning(true);
      const res = await api.post('/admin/resources/bulk-delete', {
        resourceIds: Array.from(selectedResourceIds),
      });
      setActionSuccess(res.data.message || `Successfully purged ${selectedResourceIds.size} files.`);
      setSelectedResourceIds(new Set());
      await fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to clean selected files: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsBulkCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      {/* Top Command Center Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#111625]/95 backdrop-blur-md border-b border-slate-800 shadow-lg px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-tight text-white">
                STUDIX <span className="text-purple-400">ADMIN OS</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Command Terminal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Master Admin: <span className="text-slate-200 font-bold">{user?.full_name || 'Shiva Chaitanya'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl neu-pressed text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-400 text-[11px]">System Online</span>
          </div>

          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl neu-button text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/30 flex items-center space-x-1.5 cursor-pointer transition-all"
            title="Log Out of Admin Terminal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Success Alert */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Tactile Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'queue' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4 text-brand-400" />
            <span>Moderation Queue</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-brand-300 font-black">
              {queue.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'support' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4 text-purple-400" />
            <span>Student Support & Chat</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-purple-300 font-black">
              {supportTickets.filter((t) => t.status !== 'RESOLVED').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('feedback')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'feedback' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquareHeart className="w-4 h-4 text-pink-400" />
            <span>Student Feedback</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-pink-300 font-black">
              {feedbacksData?.feedbacks?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'users' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Scholars & Users</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-emerald-300 font-black">
              {usersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'analytics' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-accent-cyan" />
            <span>Platform Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'logs' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>AI Audit Logs</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-amber-300 font-black">
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
              activeTab === 'all' ? 'neu-tab-active text-white' : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>File Cleaner</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-rose-300 font-black">
              {allResources.length}
            </span>
          </button>
        </div>

        {/* TAB 1: Moderation Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-4 animate-fade-in">
            {queue.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {queue.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {item.department?.name || 'Department'} • Year {item.year || 1} Sem {item.semester || 1}
                        </p>
                        <p className="text-[11px] text-purple-300 mt-1">
                          Uploader: {item.uploader?.full_name || item.uploader?.email || 'Student'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => setSelectedResource(item)}
                        className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center neu-flat rounded-2xl text-slate-400 text-xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">All Caught Up!</h4>
                <p className="mt-1 text-slate-400">No resources currently pending administrative verification.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Student Support & Live Chat */}
        {activeTab === 'support' && (() => {
          const filteredTickets = supportTickets.filter((t) => {
            const matchStatus = supportFilterStatus === 'ALL' || (t.status || '').toUpperCase() === supportFilterStatus.toUpperCase();
            const q = supportSearch.toLowerCase().trim();
            const matchSearch = !q || t.subject?.toLowerCase().includes(q) || t.user_name?.toLowerCase().includes(q) || t.user_email?.toLowerCase().includes(q) || t.department_name?.toLowerCase().includes(q);
            return matchStatus && matchSearch;
          });

          return (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setSupportFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        supportFilterStatus === st ? 'bg-purple-600 text-white shadow-md' : 'neu-button text-slate-400 hover:text-white'
                      }`}
                    >
                      {st === 'ALL' ? 'All Inquiries' : st.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    placeholder="Search queries..."
                    className="pl-8 pr-3 py-1.5 rounded-xl neu-pressed text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-56 sm:w-64"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {filteredTickets.length === 0 ? (
                    <div className="p-8 rounded-2xl neu-flat text-center text-slate-400 text-xs">
                      <Headphones className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-300">No student inquiries found</p>
                    </div>
                  ) : (
                    filteredTickets.map((t) => {
                      const isSelected = activeSupportTicket?.id === t.id;
                      return (
                        <div
                          key={t.id}
                          onClick={() => setActiveSupportTicket(t)}
                          className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                            isSelected ? 'bg-purple-900/20 border-purple-500/50 shadow-lg' : 'neu-flat hover:border-purple-500/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="text-xs font-bold text-white truncate">{t.user_name}</span>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full ${
                              t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-300 truncate mb-1">{t.subject}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 bg-black/20 p-1.5 rounded-lg">
                            💬 {t.last_message || 'Inquiry initiated.'}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="lg:col-span-7 rounded-2xl neu-flat p-4 sm:p-5 flex flex-col h-[600px]">
                  {activeSupportTicket ? (
                    <>
                      <div className="pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">{activeSupportTicket.user_name}</h3>
                          <p className="text-xs text-purple-300 font-semibold">{activeSupportTicket.subject}</p>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          {['OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                            <button
                              key={st}
                              onClick={() => handleUpdateTicketStatus(activeSupportTicket.id, st)}
                              className={`px-2 py-1 text-[10px] font-extrabold rounded-lg transition-all cursor-pointer ${
                                activeSupportTicket.status === st ? 'bg-purple-600 text-white' : 'neu-button text-slate-400 hover:text-white'
                              }`}
                            >
                              {st.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                        {(activeSupportTicket.messages || []).map((msg) => {
                          const isAdmin = msg.sender_role === 'ADMIN';
                          return (
                            <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                              <span className="text-[10px] text-slate-400 mb-0.5">
                                {isAdmin ? 'You (Shiva Chaitanya)' : activeSupportTicket.user_name}
                              </span>
                              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs ${
                                isAdmin ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-slate-800 text-slate-100 rounded-tl-sm'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <form onSubmit={handleSendAdminReply} className="pt-3 border-t border-slate-800 flex items-center space-x-2">
                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={`Reply to ${activeSupportTicket.user_name}...`}
                          className="flex-1 px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                        <button
                          type="submit"
                          disabled={!adminReplyText.trim() || isSendingReply}
                          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1.5 disabled:opacity-40 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <Headphones className="w-12 h-12 text-slate-600 mb-3" />
                      <h4 className="text-sm font-bold text-slate-200">No Inquiry Selected</h4>
                      <p className="text-xs text-slate-500 mt-1">Select an inquiry on the left to read and reply.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 3: Student Feedback */}
        {activeTab === 'feedback' && (() => {
          const metrics = feedbacksData?.metrics || {};
          const feedbacksList = feedbacksData?.feedbacks || [];
          return (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl neu-flat">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Satisfaction</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-2xl font-black text-white">{metrics.avgRating || 0}</span>
                    <span className="text-xs text-slate-400">/ 5.0</span>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl neu-flat">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Submissions</span>
                  <p className="text-2xl font-black text-white mt-1">{metrics.total || 0}</p>
                </div>

                <div className="p-4 rounded-2xl neu-flat">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Top Highlight</span>
                  <p className="text-xs font-bold text-purple-300">
                    {metrics.popularTags?.[0]?.tag || 'Quality Study Materials'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {feedbacksList.map((f) => (
                  <div key={f.id} className="p-4 rounded-2xl neu-flat space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white">{f.user_name}</h4>
                        <p className="text-[10px] text-slate-400">{f.college_name} {f.department_name ? `• ${f.department_name}` : ''}</p>
                      </div>
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {f.rating}/5
                      </span>
                    </div>
                    {f.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {f.tags.map((t) => (
                          <span key={t} className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {f.comment && (
                      <p className="text-xs text-slate-300 italic bg-black/20 p-2 rounded-xl">
                        &ldquo;{f.comment}&rdquo;
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: Campus Scholars & Users */}
        {activeTab === 'users' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 rounded-2xl neu-flat flex items-center justify-between">
              <span className="text-xs font-bold text-white">Registered Scholars ({usersList.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {usersList.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl neu-flat space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-white truncate">{u.full_name || 'Student'}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                  <p className="text-[10px] text-purple-300">
                    {u.colleges?.code || 'Campus'} • {u.departments?.code || 'Dept'} • Y{u.academic_year || 1} S{u.semester || 1}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: Platform Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
            <div className="p-5 rounded-2xl neu-flat">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Resources</span>
              <p className="text-2xl font-black text-white mt-1">{analytics?.totalResources || allResources.length}</p>
            </div>
            <div className="p-5 rounded-2xl neu-flat">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Enrolled Scholars</span>
              <p className="text-2xl font-black text-white mt-1">{usersList.length}</p>
            </div>
            <div className="p-5 rounded-2xl neu-flat">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Campuses</span>
              <p className="text-2xl font-black text-white mt-1">{colleges.length}</p>
            </div>
            <div className="p-5 rounded-2xl neu-flat">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Queue</span>
              <p className="text-2xl font-black text-white mt-1">{queue.length}</p>
            </div>
          </div>
        )}

        {/* TAB 6: AI Audit Logs */}
        {activeTab === 'logs' && (
          <div className="space-y-3 animate-fade-in">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl neu-flat flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">{log.title}</h4>
                  <p className="text-[11px] text-rose-400 mt-0.5">{log.reason}</p>
                </div>
                <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: File Cleaner */}
        {activeTab === 'all' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between p-4 rounded-2xl neu-flat">
              <span className="text-xs font-bold text-white">All Academic Files ({allResources.length})</span>
              {selectedResourceIds.size > 0 && (
                <button
                  onClick={handleBulkClean}
                  disabled={isBulkCleaning}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge ({selectedResourceIds.size})</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {allResources.map((res) => (
                <div key={res.id} className="p-3.5 rounded-2xl neu-flat flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <h4 className="text-xs font-bold text-white truncate">{res.title}</h4>
                    <p className="text-[10px] text-slate-400">{res.college?.code || 'Campus'} • {res.department?.code || 'Dept'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(res)}
                    className="p-2 rounded-xl neu-button text-rose-400 hover:text-rose-300 cursor-pointer"
                    title="Purge File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl neu-flat border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Reject Resource: {selectedResource.title}</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State clear reasons for rejection..."
              className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setSelectedResource(null)} className="px-4 py-2 rounded-xl neu-button text-xs">
                Cancel
              </button>
              <button onClick={() => handleReject(selectedResource.id)} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
