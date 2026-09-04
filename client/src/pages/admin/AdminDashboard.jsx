import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
} from 'lucide-react';
import api from '../../services/api.js';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'analytics' | 'logs' | 'all'
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedResource, setSelectedResource] = useState(null);
  const [previewResource, setPreviewResource] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // 1. Role Guard Check
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // 2. Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, logsRes, analyticsRes, allRes] = await Promise.all([
        api.get('/admin/moderation/queue'),
        api.get('/admin/moderation/logs'),
        api.get('/admin/analytics'),
        api.get('/resources?status=ALL'),
      ]);
      setQueue(queueRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setAllResources(allRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/moderation/${id}/approve`);
      setActionSuccess('Resource verified and approved for the public repository.');
      fetchData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to approve resource: ' + (err.message || 'Error'));
    }
  };

  const handleReject = async () => {
    if (!selectedResource) return;
    try {
      await api.post(`/admin/moderation/${selectedResource.id}/reject`, {
        rejectionReason: rejectionReason || 'Content does not meet university academic standards.',
      });
      setActionSuccess('Resource rejected and student notified.');
      setSelectedResource(null);
      setRejectionReason('');
      fetchData();
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      alert('Failed to reject resource: ' + (err.message || 'Error'));
    }
  };

  const handleDeleteResource = async (resource) => {
    if (!window.confirm(`Permanently PURGE "${resource.title}" from Supabase PostgreSQL database and Supabase Storage? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/resources/${resource.id}`);
      setActionSuccess(`Resource "${resource.title}" permanently purged from database and Supabase Storage.`);
      fetchData();
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      alert('Failed to delete resource: ' + (err.response?.data?.message || err.message));
    }
  };


  return (
    <div className="space-y-8">
      {/* Top Banner with Admin Badge */}
      <div className="p-6 sm:p-7 rounded-3xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-black text-purple-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Admin Operating System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Academic moderation queue, AI audit inspection, and real-time campus analytics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl neu-pressed text-xs font-bold text-slate-300">
            Role: <span className="text-purple-400 font-extrabold">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-accent-emerald/10 border border-accent-emerald/40 text-emerald-300 text-xs flex items-center space-x-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Tactile Neumorphic Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('queue')}
          id="admin-tab-queue"
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'queue'
              ? 'neu-tab-active text-white'
              : 'neu-button text-slate-400 hover:text-white'
          }`}
        >
          <ListOrdered className="w-4 h-4 text-brand-400" />
          <span>Moderation Queue</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-brand-300 font-black">
            {queue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          id="admin-tab-analytics"
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'analytics'
              ? 'neu-tab-active text-white'
              : 'neu-button text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-accent-cyan" />
          <span>Platform Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          id="admin-tab-logs"
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'logs'
              ? 'neu-tab-active text-white'
              : 'neu-button text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          <span>AI Rejection Audit Logs</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-amber-300 font-black">
            {logs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('all')}
          id="admin-tab-all"
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'all'
              ? 'neu-tab-active text-white'
              : 'neu-button text-slate-400 hover:text-white'
          }`}
        >
          <FolderOpen className="w-4 h-4 text-emerald-400" />
          <span>All Resources (Catalog)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-emerald-300 font-black">
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
                <div
                  key={item.id}
                  className="p-5 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black neu-pressed text-brand-300">
                        {item.resource_type}
                      </span>
                      <span className="text-[11px] text-amber-400 font-semibold">
                        Awaiting Review
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>Subject: {item.subject?.name || 'Curriculum Subject'}</span>
                      <span>•</span>
                      <span>Uploaded by: {item.uploader?.full_name || 'Student'}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setPreviewResource(item)}
                      className="px-3 py-2 rounded-xl neu-button text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleApprove(item.id)}
                      className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-emerald-400 hover:text-white flex items-center space-x-1.5 border-emerald-500/30"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => setSelectedResource(item)}
                      className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-rose-400 hover:text-white flex items-center space-x-1.5 border-rose-500/30"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleDeleteResource(item)}
                      className="px-3 py-2 rounded-xl neu-button text-xs font-bold text-red-400 hover:text-white flex items-center space-x-1.5 border-red-500/30 hover:bg-red-600/20"
                      title="Permanently Purge Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              ))}

            </div>
          ) : (
            <div className="p-12 rounded-3xl neu-pressed text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-accent-emerald mx-auto" />
              <h3 className="text-base font-bold text-white">Moderation Queue is Clear</h3>
              <p className="text-xs text-slate-400">
                All submitted resources have been reviewed or auto-processed by Gemini.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Platform Analytics */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6 animate-fade-in">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl neu-flat space-y-1">
              <span className="text-xs font-semibold text-slate-400">Total Archive Files</span>
              <p className="text-2xl font-black text-white">{analytics.totalResources}</p>
              <span className="text-[10px] text-accent-emerald font-bold">Public catalog</span>
            </div>

            <div className="p-5 rounded-2xl neu-flat space-y-1">
              <span className="text-xs font-semibold text-slate-400">Upload Velocity</span>
              <p className="text-2xl font-black text-brand-300">{analytics.uploadVelocity}</p>
              <span className="text-[10px] text-slate-400">Steady intake</span>
            </div>

            <div className="p-5 rounded-2xl neu-flat space-y-1">
              <span className="text-xs font-semibold text-slate-400">AI Auto-Rejections</span>
              <p className="text-2xl font-black text-rose-400">{analytics.autoRejectedByAiCount}</p>
              <span className="text-[10px] text-slate-400">Gemini Vision filtered</span>
            </div>

            <div className="p-5 rounded-2xl neu-flat space-y-1">
              <span className="text-xs font-semibold text-slate-400">Flag Rate</span>
              <p className="text-2xl font-black text-amber-400">{analytics.flagRate}</p>
              <span className="text-[10px] text-slate-400">High accuracy</span>
            </div>
          </div>

          {/* Top Colleges & Departments Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl neu-flat space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-brand-400" />
                <span>Top Active Institutions</span>
              </h3>
              <div className="space-y-2.5">
                {analytics.topColleges?.map((c, i) => (
                  <div key={i} className="p-3 rounded-xl neu-pressed flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{c.name}</span>
                    <span className="px-2 py-0.5 rounded neu-button text-brand-300 font-black text-[10px]">
                      {c.count} files
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl neu-flat space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-accent-cyan" />
                <span>Top Engineering Departments</span>
              </h3>
              <div className="space-y-2.5">
                {analytics.topDepartments?.map((d, i) => (
                  <div key={i} className="p-3 rounded-xl neu-pressed flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{d.name} ({d.code})</span>
                    <span className="px-2 py-0.5 rounded neu-button text-accent-cyan font-black text-[10px]">
                      {d.count} files
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AI Rejection Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl neu-flat text-xs text-slate-300 flex items-center justify-between">
            <span>Audit log of uploads automatically intercepted by OpenRouter Gemini moderation.</span>
            <span className="font-bold text-amber-400">{logs.length} Total Interceptions</span>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      REJECTED
                    </span>
                    <span className="text-xs font-bold text-white">{log.filename}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Reason: <span className="text-rose-300 font-medium">&quot;{log.reason}&quot;</span>
                  </p>
                </div>

                <div className="text-right text-[10px] text-slate-500">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  <p className="text-brand-300 font-semibold">{log.rejectedBy || 'AI System'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: All Resources (Catalog) & Content Governance */}
      {activeTab === 'all' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-2xl neu-flat text-xs text-slate-300 flex items-center justify-between">
            <span>Unified repository catalog across colleges with one-click purge and governance.</span>
            <span className="font-bold text-emerald-400">{allResources.length} Indexed Materials</span>
          </div>

          {allResources.length > 0 ? (
            <div className="grid grid-cols-1 gap-3.5">
              {allResources.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black neu-pressed text-brand-300">
                        {item.resource_type}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.college?.name || item.college?.code || 'University Stream'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>Subject: {item.subject?.name || 'Curriculum Subject'}</span>
                      <span>•</span>
                      <span>Year {item.year}, Sem {item.semester}</span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button
                      onClick={() => setPreviewResource(item)}
                      className="px-3 py-2 rounded-xl neu-button text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Preview</span>
                    </button>

                    <button
                      onClick={() => handleDeleteResource(item)}
                      className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-red-400 hover:text-white flex items-center space-x-1.5 border-red-500/30 hover:bg-red-600/30"
                      title="Permanently Purge Resource"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-3xl neu-pressed text-center space-y-2">
              <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Resources in Catalog</h3>
              <p className="text-xs text-slate-400">The repository catalog is currently empty.</p>
            </div>
          )}
        </div>
      )}

      {/* Document Preview Modal */}

      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewResource(null)} />
          <div className="relative w-full max-w-xl rounded-3xl neu-flat p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <h3 className="text-sm font-bold text-white truncate max-w-[380px]">
                {previewResource.title}
              </h3>
              <button onClick={() => setPreviewResource(null)} className="p-1.5 rounded-lg neu-button text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl neu-pressed space-y-2 text-xs text-slate-300">
              <p><span className="font-bold text-slate-400">Resource Category:</span> {previewResource.resource_type}</p>
              <p><span className="font-bold text-slate-400">Academic Context:</span> Year {previewResource.year}, Sem {previewResource.semester}</p>
              <p><span className="font-bold text-slate-400">SHA-256 Hash:</span> <span className="font-mono text-[10px] text-brand-300 truncate block">{previewResource.file_hash}</span></p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => window.open(previewResource.file_url, '_blank')}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-white flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-brand-400" />
                <span>Open File Document</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal with custom reason */}
      {selectedResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedResource(null)} />
          <div className="relative w-full max-w-md rounded-3xl neu-flat p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-white">Reject Resource</h3>
            <p className="text-xs text-slate-400">
              Provide a reason for rejecting &quot;{selectedResource.title}&quot;:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Incomplete syllabus coverage or blurry scan..."
              rows={3}
              className="w-full p-3 rounded-xl neu-pressed text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedResource(null)}
                className="px-4 py-2 rounded-xl neu-button text-xs text-slate-400 hover:text-white font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-rose-400 border border-rose-500/40"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
