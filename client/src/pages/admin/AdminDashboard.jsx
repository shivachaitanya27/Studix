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
  Search,
  CheckSquare,
  Square,
  Filter,
  GraduationCap,
  Edit3,
  SlidersHorizontal,
  Users,
  School,
} from 'lucide-react';
import api from '../../services/api.js';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'users' | 'analytics' | 'logs' | 'all'
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Multi-Tenant Global College & Stream Filter State (Exclusively for Admin)
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedAdminCollege, setSelectedAdminCollege] = useState('ALL');
  const [selectedAdminDept, setSelectedAdminDept] = useState('ALL');
  const [selectedAdminYear, setSelectedAdminYear] = useState('ALL');
  const [selectedAdminSemester, setSelectedAdminSemester] = useState('ALL');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL');

  // Campus Scholars & Users Governance State across all departments
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

  // 1. Role & Identity Guard Check (Restricted strictly to authorized administrator)
  useEffect(() => {
    const isAuthorizedAdmin =
      user &&
      (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') &&
      (user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com';

    if (user && !isAuthorizedAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // 2. Fetch data (Global multi-tenant data for Admin)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [queueRes, logsRes, analyticsRes, allRes, collegesRes, deptsRes, usersRes] = await Promise.all([
        api.get('/admin/moderation/queue'),
        api.get('/admin/moderation/logs'),
        api.get('/admin/analytics'),
        api.get('/resources?status=ALL'),
        api.get('/academic/colleges').catch(() => api.get('/colleges')).catch(() => ({ data: { data: [] } })),
        api.get('/academic/departments').catch(() => api.get('/departments')).catch(() => ({ data: { data: [] } })),
        api.get('/admin/users').catch(() => ({ data: { data: [] } })),
      ]);
      setQueue(queueRes.data.data || []);
      setLogs(logsRes.data.data || []);
      setAnalytics(analyticsRes.data.data || null);
      setAllResources(allRes.data.data || []);
      setColleges(collegesRes.data.data || []);
      setDepartments(deptsRes.data.data || []);
      setUsersList(usersRes.data.data || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveUserStream = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUserStream(true);
    try {
      await api.patch(`/admin/users/${editingUser.id}/stream`, {
        collegeId: userStreamForm.collegeId,
        departmentId: userStreamForm.departmentId,
        academicYear: parseInt(userStreamForm.academicYear, 10),
        semester: parseInt(userStreamForm.semester, 10),
      });
      setActionSuccess(`Academic stream for ${editingUser.full_name || editingUser.email} updated successfully.`);
      setEditingUser(null);
      fetchData();
      setTimeout(() => setActionSuccess(''), 3500);
    } catch (err) {
      alert('Failed to update user stream: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingUserStream(false);
    }
  };

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

  const handleToggleSelectAll = (filteredItems) => {
    if (selectedResourceIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedResourceIds(new Set());
    } else {
      setSelectedResourceIds(new Set(filteredItems.map((r) => r.id)));
    }
  };

  const handleToggleSelectItem = (id) => {
    setSelectedResourceIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkClean = async () => {
    if (selectedResourceIds.size === 0) return;
    if (
      !window.confirm(
        `Are you sure you want to permanently PURGE ${selectedResourceIds.size} unwanted files from various college streams? This will delete them permanently from the PostgreSQL database and Supabase Storage.`
      )
    ) {
      return;
    }

    try {
      setIsBulkCleaning(true);
      const res = await api.post('/admin/resources/bulk-delete', {
        resourceIds: Array.from(selectedResourceIds),
      });
      setActionSuccess(res.data.message || `Successfully purged ${selectedResourceIds.size} unwanted files.`);
      setSelectedResourceIds(new Set());
      await fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to clean selected files: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsBulkCleaning(false);
    }
  };

  const handleOpenEditStream = (item) => {
    setEditingStreamResource(item);
    setStreamEditForm({
      title: item.title || '',
      departmentId: item.department_id || item.department?.id || '',
      academicYear: String(item.year || 1),
      semester: String(item.semester || 1),
      subjectName: item.subject?.name || '',
    });
  };

  const handleSaveStreamEdit = async (e) => {
    e.preventDefault();
    if (!editingStreamResource) return;
    setIsSavingStream(true);
    try {
      await api.patch(`/admin/resources/${editingStreamResource.id}/stream`, streamEditForm);
      setActionSuccess(`Successfully updated stream for "${streamEditForm.title || editingStreamResource.title}".`);
      setEditingStreamResource(null);
      await fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to update file stream: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingStream(false);
    }
  };

  const handlePurgeSelectedStream = async (matchingItems) => {
    if (selectedAdminDept === 'ALL' && selectedAdminYear === 'ALL' && selectedAdminSemester === 'ALL') {
      alert('Please select at least a specific Branch/Department, Year, or Semester to purge a stream.');
      return;
    }

    const deptObj = departments.find((d) => d.id === selectedAdminDept);
    const streamLabel = [
      deptObj ? deptObj.name : (selectedAdminDept !== 'ALL' ? selectedAdminDept : null),
      selectedAdminYear !== 'ALL' ? `Year ${selectedAdminYear}` : null,
      selectedAdminSemester !== 'ALL' ? `Sem ${selectedAdminSemester}` : null,
    ].filter(Boolean).join(' • ');

    const count = matchingItems.length;
    if (count === 0) {
      alert('No files found matching the selected stream to purge.');
      return;
    }

    const confirmed = window.confirm(
      `⚠️ PERMANENT STREAM PURGE CONFIRMATION:\n\nAre you sure you want to permanently delete ALL ${count} files belonging to the stream:\n\n[ ${streamLabel} ]?\n\nThis will purge all materials uploaded by students in this department/year/sem from the PostgreSQL database and Supabase Storage.`
    );
    if (!confirmed) return;

    setIsPurgingStream(true);
    try {
      const res = await api.post('/admin/resources/stream-delete', {
        collegeId: selectedAdminCollege,
        departmentId: selectedAdminDept,
        academicYear: selectedAdminYear,
        semester: selectedAdminSemester,
      });
      setActionSuccess(`Purged ${res.data.data?.deletedCount || count} files from stream: ${streamLabel}`);
      setSelectedResourceIds(new Set());
      await fetchData();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      alert('Failed to purge stream files: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsPurgingStream(false);
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
          onClick={() => setActiveTab('users')}
          id="admin-tab-users"
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all ${
            activeTab === 'users'
              ? 'neu-tab-active text-white'
              : 'neu-button text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Campus Scholars & Users</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] neu-pressed text-emerald-300 font-black">
            {usersList.length}
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
          <Trash2 className="w-4 h-4 text-rose-400" />
          <span>Multi-Campus File Cleaner</span>
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

      {/* TAB: Registered Campus Scholars & Users across ALL Departments */}
      {activeTab === 'users' && (() => {
        const filteredUsers = usersList.filter((u) => {
          if (selectedUserCollege !== 'ALL' && u.college_id !== selectedUserCollege) {
            return false;
          }
          if (selectedUserDept !== 'ALL') {
            const userDeptId = u.department_id || u.department?.id;
            const matchDept = departments.find((d) => d.code === selectedUserDept || d.id === selectedUserDept);
            const targetId = matchDept ? matchDept.id : selectedUserDept;
            if (userDeptId !== targetId && u.department?.code !== selectedUserDept) {
              return false;
            }
          }
          if (!userSearchQuery.trim()) return true;
          const q = userSearchQuery.toLowerCase();
          return (
            (u.full_name || '').toLowerCase().includes(q) ||
            (u.email || '').toLowerCase().includes(q) ||
            (u.department?.name || u.department?.code || '').toLowerCase().includes(q) ||
            (u.college?.name || u.college?.code || '').toLowerCase().includes(q)
          );
        });

        return (
          <div className="space-y-4 animate-fade-in">
            {/* Header & Stats Banner */}
            <div className="p-4 rounded-2xl neu-flat text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Enrolled Campus Scholars & Users across AIDS, ECE, EEE, CYB, AIML, IT, IOT, and CSE</span>
              </span>
              <span className="font-bold text-emerald-400">
                {filteredUsers.length} of {usersList.length} Scholars Displayed
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="p-4 rounded-2xl neu-flat grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search user by name, email, or branch..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              {/* College Filter */}
              <div>
                <select
                  value={selectedUserCollege}
                  onChange={(e) => setSelectedUserCollege(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">🏫 All Colleges & Campuses</option>
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Filter */}
              <div>
                <select
                  value={selectedUserDept}
                  onChange={(e) => setSelectedUserDept(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">🏛️ All Departments (AIDS, ECE, EEE, CYB...)</option>
                  {(departments.length > 0
                    ? departments
                    : [
                        { id: 'd1000000-0000-0000-0000-000000000001', code: 'CSE', name: 'Computer Science and Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000005', code: 'AI-DS', name: 'Artificial Intelligence & Data Science' },
                        { id: 'd1000000-0000-0000-0000-000000000006', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
                        { id: 'd1000000-0000-0000-0000-000000000007', code: 'CYB', name: 'Cybersecurity' },
                        { id: 'd1000000-0000-0000-0000-000000000002', code: 'ECE', name: 'Electronics and Communication Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000003', code: 'EEE', name: 'Electrical and Electronics Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000004', code: 'IT', name: 'Information Technology' },
                        { id: 'd1000000-0000-0000-0000-000000000008', code: 'IOT', name: 'Internet of Things' },
                      ]
                  ).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Quick Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedUserDept('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedUserDept === 'ALL'
                    ? 'neu-pressed border border-emerald-500 bg-emerald-500/20 text-emerald-300 font-black'
                    : 'neu-button text-slate-400 hover:text-white'
                }`}
              >
                All Departments
              </button>
              {['AI-DS', 'AIML', 'CSE', 'CYB', 'ECE', 'EEE', 'IT', 'IOT'].map((code) => {
                const matchDept = departments.find((d) => d.code === code);
                const isSelected =
                  selectedUserDept === code || (matchDept && selectedUserDept === matchDept.id);
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      if (matchDept) setSelectedUserDept(matchDept.id);
                      else setSelectedUserDept(code);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? 'neu-pressed border border-brand-500 bg-brand-500/20 text-brand-300 font-black'
                        : 'neu-button text-slate-400 hover:text-white'
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>

            {/* User List Grid */}
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u) => {
                  const deptCode = u.department?.code || 'GEN';
                  const deptColor =
                    deptCode === 'AI-DS' || deptCode === 'AIML'
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                      : deptCode === 'CYB'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : deptCode === 'ECE' || deptCode === 'EEE'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : deptCode === 'IT' || deptCode === 'IOT'
                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                      : 'bg-brand-500/15 text-brand-300 border-brand-500/30';

                  return (
                    <div
                      key={u.id}
                      className="p-5 rounded-3xl neu-flat flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-brand-500/40 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${deptColor}`}
                          >
                            {deptCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                : 'bg-slate-700/50 text-slate-300'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors truncate">
                            {u.full_name || 'Campus Scholar'}
                          </h4>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>

                        <div className="p-2.5 rounded-xl neu-pressed text-[11px] space-y-1">
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Campus:</span>
                            <span className="font-semibold text-slate-200 truncate max-w-[150px]">
                              {u.college?.name || u.college?.code || 'University'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Branch:</span>
                            <span className="font-semibold text-brand-300 truncate max-w-[150px]">
                              {u.department?.name || u.department?.code || 'Engineering'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-slate-400">
                            <span>Active Stream:</span>
                            <span className="font-bold text-amber-400">
                              Year {u.academic_year || 1} • Sem {u.semester || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                          Joined {new Date(u.created_at || Date.now()).toLocaleDateString()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setUserStreamForm({
                              collegeId: u.college_id || colleges[0]?.id || '',
                              departmentId: u.department_id || departments[0]?.id || '',
                              academicYear: String(u.academic_year || 1),
                              semester: String(u.semester || 1),
                            });
                          }}
                          className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-brand-300 hover:text-white flex items-center space-x-1.5 border border-brand-500/30 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3 text-brand-400" />
                          <span>Edit Stream</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-3xl neu-pressed text-center space-y-2">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Scholars Found</h3>
                <p className="text-xs text-slate-400">
                  No registered users match the selected department or college filter.
                </p>
              </div>
            )}
          </div>
        );
      })()}

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

      {/* TAB 4: All Resources & Multi-Campus Unwanted File Cleaner */}
      {activeTab === 'all' && (() => {
        const availableDepartments =
          departments.length > 0
            ? departments
            : [
                { id: 'd1000000-0000-0000-0000-000000000001', code: 'CSE', name: 'Computer Science and Engineering' },
                { id: 'd1000000-0000-0000-0000-000000000005', code: 'AI-DS', name: 'Artificial Intelligence and Data Science' },
                { id: 'd1000000-0000-0000-0000-000000000006', code: 'AIML', name: 'Artificial Intelligence and Machine Learning' },
                { id: 'd1000000-0000-0000-0000-000000000007', code: 'CYB', name: 'Cybersecurity' },
                { id: 'd1000000-0000-0000-0000-000000000002', code: 'ECE', name: 'Electronics and Communication Engineering' },
                { id: 'd1000000-0000-0000-0000-000000000003', code: 'EEE', name: 'Electrical and Electronics Engineering' },
                { id: 'd1000000-0000-0000-0000-000000000004', code: 'IT', name: 'Information Technology' },
                { id: 'd1000000-0000-0000-0000-000000000008', code: 'IOT', name: 'Internet of Things' },
              ];

        const filteredCatalog = allResources.filter((item) => {
          // 1. College filter
          if (selectedAdminCollege !== 'ALL') {
            const itemCollegeId = item.college_id || item.college?.id;
            if (itemCollegeId !== selectedAdminCollege) return false;
          }
          // 2. Department / Branch filter
          if (selectedAdminDept !== 'ALL') {
            const itemDeptId = item.department_id || item.department?.id;
            if (itemDeptId !== selectedAdminDept) return false;
          }
          // 3. Year filter
          if (selectedAdminYear !== 'ALL') {
            if (parseInt(item.year, 10) !== parseInt(selectedAdminYear, 10)) return false;
          }
          // 4. Semester filter
          if (selectedAdminSemester !== 'ALL') {
            if (parseInt(item.semester, 10) !== parseInt(selectedAdminSemester, 10)) return false;
          }
          // 5. Status filter
          if (adminStatusFilter !== 'ALL' && item.status !== adminStatusFilter) {
            return false;
          }
          // 6. Search query
          if (!adminSearchQuery.trim()) return true;
          const q = adminSearchQuery.toLowerCase();
          const titleMatch = (item.title || '').toLowerCase().includes(q);
          const subjectMatch = (item.subject?.name || item.subject?.code || '').toLowerCase().includes(q);
          const collegeMatch = (item.college?.name || item.college?.code || '').toLowerCase().includes(q);
          const deptMatch = (item.department?.name || item.department?.code || '').toLowerCase().includes(q);
          const uploaderMatch = (item.uploader?.full_name || item.uploader?.email || '').toLowerCase().includes(q);
          const typeMatch = (item.resource_type || '').toLowerCase().includes(q);
          return titleMatch || subjectMatch || collegeMatch || deptMatch || uploaderMatch || typeMatch;
        });

        return (
          <div className="space-y-4 animate-fade-in">
            {/* Header & Stats Banner */}
            <div className="p-4 rounded-2xl neu-flat text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Master Governance: Select any campus, branch, year, and semester to purge unwanted files.</span>
              </span>
              <span className="font-bold text-rose-400">{filteredCatalog.length} of {allResources.length} Materials Found</span>
            </div>

            {/* Multi-Tenant Global College & Stream Filters (Only for Admin) */}
            <div className="p-4 sm:p-5 rounded-2xl neu-flat space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-black text-amber-400 uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-amber-400" />
                  <span>Admin Multi-Campus & Stream Selector</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Filter cross-campus files by university, branch, year & semester
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. College Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select College / Campus
                  </label>
                  <select
                    value={selectedAdminCollege}
                    onChange={(e) => {
                      setSelectedAdminCollege(e.target.value);
                      setSelectedAdminDept('ALL');
                    }}
                    className="w-full px-3 py-2 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">🏫 All Colleges & Campuses</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Department / Branch Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Branch / Department
                  </label>
                  <select
                    value={selectedAdminDept}
                    onChange={(e) => setSelectedAdminDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">🏛️ All Branches & Streams</option>
                    {availableDepartments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Year Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Academic Year
                  </label>
                  <select
                    value={selectedAdminYear}
                    onChange={(e) => setSelectedAdminYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">📅 All Years (1-4)</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                {/* 4. Semester Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Select Active Semester
                  </label>
                  <select
                    value={selectedAdminSemester}
                    onChange={(e) => setSelectedAdminSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="ALL">🎓 All Semesters (1-8)</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Stream Governance & Targeted Clean Action Bar */}
              <div className="pt-3 border-t border-slate-700/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300 flex items-center space-x-2 flex-wrap">
                  <span className="font-bold text-slate-400">Active Stream:</span>
                  <span className="px-2 py-0.5 rounded-lg neu-pressed text-brand-300 font-extrabold">
                    {selectedAdminDept !== 'ALL'
                      ? (departments.find((d) => d.id === selectedAdminDept)?.name || 'Selected Dept')
                      : 'All Departments'}
                    {selectedAdminYear !== 'ALL' ? ` • Year ${selectedAdminYear}` : ''}
                    {selectedAdminSemester !== 'ALL' ? ` • Sem ${selectedAdminSemester}` : ''}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({filteredCatalog.length} materials in this stream)
                  </span>
                </div>

                {(selectedAdminDept !== 'ALL' || selectedAdminYear !== 'ALL' || selectedAdminSemester !== 'ALL') && (
                  <button
                    type="button"
                    disabled={isPurgingStream || filteredCatalog.length === 0}
                    onClick={() => handlePurgeSelectedStream(filteredCatalog)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-black flex items-center space-x-2 shadow-glow transition-all cursor-pointer disabled:opacity-50"
                    title="Permanently delete all files uploaded for this department, year, and semester"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {isPurgingStream
                        ? 'Purging Stream Files...'
                        : `Purge All Files in this Stream (${filteredCatalog.length})`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Search & Status Filter Controls */}
            <div className="p-4 rounded-2xl neu-flat flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  placeholder="Search unwanted files by title, subject, student uploader, or college..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {adminSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAdminSearchQuery('')}
                    className="absolute right-3 top-2.5 p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="APPROVED">Approved Materials</option>
                  <option value="PENDING">Pending Moderation</option>
                  <option value="REJECTED">Rejected Materials</option>
                </select>
              </div>
            </div>

            {/* Bulk Clean Action Toolbar */}
            {filteredCatalog.length > 0 && (
              <div className="p-3.5 rounded-2xl neu-flat flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-rose-500/5 border border-rose-500/20">
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => handleToggleSelectAll(filteredCatalog)}
                    className="flex items-center space-x-2 text-xs font-bold text-slate-200 hover:text-white cursor-pointer"
                  >
                    {selectedResourceIds.size === filteredCatalog.length && filteredCatalog.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span>
                      {selectedResourceIds.size === filteredCatalog.length && filteredCatalog.length > 0
                        ? 'Deselect All'
                        : `Select All Filtered (${filteredCatalog.length})`}
                    </span>
                  </button>
                  {selectedResourceIds.size > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {selectedResourceIds.size} selected
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {selectedResourceIds.size > 0 && (
                    <button
                      type="button"
                      disabled={isBulkCleaning}
                      onClick={handleBulkClean}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-glow flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>
                        {isBulkCleaning
                          ? 'Purging Files...'
                          : `Clean & Purge ${selectedResourceIds.size} Selected Files`}
                      </span>
                    </button>
                  )}
                  {(selectedAdminCollege !== 'ALL' ||
                    selectedAdminDept !== 'ALL' ||
                    selectedAdminYear !== 'ALL' ||
                    selectedAdminSemester !== 'ALL' ||
                    adminSearchQuery ||
                    adminStatusFilter !== 'ALL') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdminCollege('ALL');
                        setSelectedAdminDept('ALL');
                        setSelectedAdminYear('ALL');
                        setSelectedAdminSemester('ALL');
                        setAdminSearchQuery('');
                        setAdminStatusFilter('ALL');
                        setSelectedResourceIds(new Set());
                      }}
                      className="px-3 py-2 rounded-xl neu-button text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {filteredCatalog.length > 0 ? (
              <div className="grid grid-cols-1 gap-3.5">
                {filteredCatalog.map((item) => {
                  const isSelected = selectedResourceIds.has(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                        isSelected ? 'border border-rose-500/40 bg-rose-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectItem(item.id)}
                          className="mt-1 flex-shrink-0 cursor-pointer text-slate-400 hover:text-white"
                          title={isSelected ? 'Deselect file' : 'Select file for purge'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-500" />
                          )}
                        </button>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
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
                            <span className="px-2 py-0.5 rounded-lg bg-dark-base border border-dark-border text-[10px] text-amber-300 font-semibold flex items-center space-x-1">
                              <span>🏫 {item.college?.name || item.college?.code || 'Campus'}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-dark-base border border-dark-border text-[10px] text-brand-300 font-semibold">
                              🏛️ {item.department?.name || item.department?.code || 'Branch'}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-dark-base border border-dark-border text-[10px] text-slate-300 font-semibold">
                              Year {item.year} • Sem {item.semester}
                            </span>
                          </div>

                          <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>

                          <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>Subject: <strong className="text-slate-200">{item.subject?.name || 'Manual Subject'}</strong></span>
                            <span>•</span>
                            <span>Uploaded by: <strong className="text-slate-300">{item.uploader?.full_name || 'Student'}</strong> {item.uploader?.email ? `(${item.uploader.email})` : ''}</span>
                            <span>•</span>
                            <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-center">
                        <button
                          onClick={() => setPreviewResource(item)}
                          className="px-3 py-2 rounded-xl neu-button text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-accent-cyan" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditStream(item)}
                          className="px-3 py-2 rounded-xl neu-button text-xs font-semibold text-brand-300 hover:text-white flex items-center space-x-1.5 border border-brand-500/30 hover:bg-brand-500/20 cursor-pointer"
                          title="Reassign or edit department, year, semester, or subject for this file"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-brand-400" />
                          <span>Edit Stream</span>
                        </button>

                        <button
                          onClick={() => handleDeleteResource(item)}
                          className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-rose-400 hover:text-white flex items-center space-x-1.5 border border-rose-500/30 hover:bg-rose-600/30 cursor-pointer"
                          title="Permanently Purge Resource"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Purge File</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 rounded-3xl neu-pressed text-center space-y-2">
                <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
                <h3 className="text-base font-bold text-white">No Resources Found</h3>
                <p className="text-xs text-slate-400">No materials match your selected campus, branch, year, semester, or search query.</p>
                {(selectedAdminCollege !== 'ALL' ||
                  selectedAdminDept !== 'ALL' ||
                  selectedAdminYear !== 'ALL' ||
                  selectedAdminSemester !== 'ALL' ||
                  adminSearchQuery) && (
                  <button
                    onClick={() => {
                      setSelectedAdminCollege('ALL');
                      setSelectedAdminDept('ALL');
                      setSelectedAdminYear('ALL');
                      setSelectedAdminSemester('ALL');
                      setAdminSearchQuery('');
                      setAdminStatusFilter('ALL');
                    }}
                    className="mt-2 px-3.5 py-1.5 rounded-xl neu-button text-xs font-bold text-brand-300 cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Document Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewResource(null)} />
          <div className="relative w-full max-w-xl rounded-3xl neu-flat p-6 z-10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/30">
              <h3 className="text-sm font-bold text-white truncate max-w-[380px]">
                {previewResource.title}
              </h3>
              <button onClick={() => setPreviewResource(null)} className="p-1.5 rounded-lg neu-button text-slate-400 hover:text-white cursor-pointer">
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
                type="button"
                onClick={() => {
                  const resToPurge = previewResource;
                  setPreviewResource(null);
                  handleDeleteResource(resToPurge);
                }}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-rose-400 hover:text-white flex items-center space-x-1.5 border border-rose-500/40 hover:bg-rose-600/30 cursor-pointer"
                title="Permanently remove this unwanted file"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Unwanted File</span>
              </button>

              <button
                onClick={() => window.open(previewResource.file_url, '_blank')}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-white flex items-center space-x-1.5 cursor-pointer"
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

      {/* Admin Edit Stream Modal */}
      {editingStreamResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => !isSavingStream && setEditingStreamResource(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl neu-flat p-6 sm:p-7 z-10 space-y-4 border border-brand-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center space-x-2 text-sm font-black text-white">
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Edit Resource Academic Stream</span>
              </div>
              <button
                type="button"
                onClick={() => !isSavingStream && setEditingStreamResource(null)}
                className="p-1.5 rounded-lg neu-button text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStreamEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={streamEditForm.title}
                  onChange={(e) => setStreamEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Target Branch / Department
                </label>
                <select
                  value={streamEditForm.departmentId}
                  onChange={(e) => setStreamEditForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                >
                  <option value="">-- Choose Branch --</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <select
                    value={streamEditForm.academicYear}
                    onChange={(e) => setStreamEditForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={streamEditForm.semester}
                    onChange={(e) => setStreamEditForm((prev) => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={streamEditForm.subjectName}
                  onChange={(e) => setStreamEditForm((prev) => ({ ...prev, subjectName: e.target.value }))}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-slate-300 text-[11px] leading-relaxed">
                Reassigning the stream will move this resource to the selected Department, Year, and Semester across student syllabus trees and exam solver caches.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={isSavingStream}
                  onClick={() => setEditingStreamResource(null)}
                  className="px-4 py-2 rounded-xl neu-button text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingStream}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-glow flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <span>{isSavingStream ? 'Saving...' : 'Save Stream Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Stream Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg neu-flat rounded-3xl p-6 space-y-4 border border-brand-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-bold text-white">
                  Assign User Stream: {editingUser.full_name || editingUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUserStream} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Enrolled College / Campus
                </label>
                <select
                  value={userStreamForm.collegeId}
                  onChange={(e) => setUserStreamForm((prev) => ({ ...prev, collegeId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                >
                  {colleges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Department / Branch
                </label>
                <select
                  value={userStreamForm.departmentId}
                  onChange={(e) => setUserStreamForm((prev) => ({ ...prev, departmentId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                >
                  {(departments.length > 0
                    ? departments
                    : [
                        { id: 'd1000000-0000-0000-0000-000000000001', code: 'CSE', name: 'Computer Science and Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000005', code: 'AI-DS', name: 'Artificial Intelligence & Data Science' },
                        { id: 'd1000000-0000-0000-0000-000000000006', code: 'AIML', name: 'Artificial Intelligence & Machine Learning' },
                        { id: 'd1000000-0000-0000-0000-000000000007', code: 'CYB', name: 'Cybersecurity' },
                        { id: 'd1000000-0000-0000-0000-000000000002', code: 'ECE', name: 'Electronics and Communication Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000003', code: 'EEE', name: 'Electrical and Electronics Engineering' },
                        { id: 'd1000000-0000-0000-0000-000000000004', code: 'IT', name: 'Information Technology' },
                        { id: 'd1000000-0000-0000-0000-000000000008', code: 'IOT', name: 'Internet of Things' },
                      ]
                  ).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Academic Year
                  </label>
                  <select
                    value={userStreamForm.academicYear}
                    onChange={(e) => setUserStreamForm((prev) => ({ ...prev, academicYear: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Semester
                  </label>
                  <select
                    value={userStreamForm.semester}
                    onChange={(e) => setUserStreamForm((prev) => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  disabled={isSavingUserStream}
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl neu-button text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUserStream}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-extrabold shadow-glow flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <span>{isSavingUserStream ? 'Saving...' : 'Update Scholar Stream'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
