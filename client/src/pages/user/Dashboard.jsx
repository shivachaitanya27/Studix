import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Building2,
  FileText,
  Sparkles,
  Upload,
  Bookmark,
  Sliders,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Award,
  BookMarked,
  BrainCircuit,
  FolderArchive,
  Camera,
  Loader2,
  BookOpen,
  Lock,
} from 'lucide-react';

import { selectCurrentUser, uploadUserAvatar } from '../../redux/authSlice.js';

import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
  selectSubjects,
  fetchSubjects,
} from '../../redux/academicSlice.js';
import { setActiveTab } from '../../redux/resourceSlice.js';
import UploadModal from '../../components/user/UploadModal.jsx';
import SettingsModal from '../../components/common/SettingsModal.jsx';

export const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const college = useSelector(selectSelectedCollege) || user?.college;
  const department = useSelector(selectSelectedDepartment) || user?.department;
  const year = useSelector(selectSelectedYear) || user?.academic_year;
  const semester = useSelector(selectSelectedSemester) || user?.semester;
  const subjects = useSelector(selectSubjects);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const avatarInputRef = React.useRef(null);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);


  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsAvatarUploading(true);
      await dispatch(uploadUserAvatar(file)).unwrap();
    } catch (err) {
      alert(err || 'Failed to upload photo');
    } finally {
      setIsAvatarUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const fetchedStreamRef = React.useRef('');
  const deptId = department?.id;

  // Fetch subjects for active stream once per stream configuration (prevents re-render lock)
  useEffect(() => {
    const streamKey = `${deptId || 'all'}-${year || '1'}-${semester || '1'}`;
    if (deptId && year && semester && fetchedStreamRef.current !== streamKey) {
      fetchedStreamRef.current = streamKey;
      dispatch(
        fetchSubjects({
          departmentId: deptId,
          year,
          semester,
        })
      );
    }
  }, [deptId, year, semester, dispatch]);

  const handleOpenCategory = (tabId) => {

    dispatch(setActiveTab(tabId));
    navigate('/repository');
  };

  return (
    <div className="space-y-8">
      {/* Hidden Avatar File Input */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
        id="dashboard-avatar-file-input"
      />

      {/* Top Academic Context Banner with Neumorphism */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl neu-flat p-6 sm:p-8"
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center space-x-4">
            {/* User Avatar Circle with Camera Overlay */}
            <div
              onClick={() => avatarInputRef.current?.click()}
              title="Click to upload profile photo"
              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 neu-button cursor-pointer group border-2 border-brand-500/30"
            >
              {isAvatarUploading ? (
                <div className="w-full h-full bg-dark-bg/80 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-600 to-accent-violet flex items-center justify-center text-white font-black text-2xl">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  {user?.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || 'Profile'}
                      className="relative z-10 w-full h-full object-cover rounded-2xl"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </>
              )}
              <div className="absolute inset-0 z-20 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                <Camera className="w-5 h-5 mb-0.5" />
                <span>Upload</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                <span>Verified Campus Stream</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {user?.full_name || 'Scholar'}!
              </h1>
              <div className="text-sm text-slate-300 mt-1.5 flex flex-wrap items-center gap-2.5">
                <span className="font-bold text-white tracking-tight">
                  {college?.name || 'Dhanalakshmi Srinivasan University Trichy'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-brand-300 font-bold">
                  {department?.name || department?.code || 'Computer Science & Engineering'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="px-3 py-1 rounded-xl text-xs font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 tracking-wide shadow-sm flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Year {year || 1} • Semester {semester || 1}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div
              id="enrolled-campus-badge"
              className="px-3.5 py-2.5 rounded-xl neu-pressed text-slate-300 text-xs font-semibold flex items-center space-x-2 select-none"
              title="Dhanalakshmi Srinivasan University verified campus stream"
            >
              <span className="w-2 h-2 rounded-full bg-accent-emerald" />
              <span className="text-brand-300 font-extrabold">{college?.code || 'DSU'}</span>
              <span className="text-slate-400 font-medium">Enrolled</span>
            </div>


            <button
              onClick={() => setIsSettingsOpen(true)}
              id="dashboard-open-settings-btn"
              title="Change Password & Account Settings"
              className="px-4 py-2.5 rounded-xl neu-button text-slate-800 dark:text-slate-200 hover:text-brand-600 dark:hover:text-white text-xs font-bold flex items-center space-x-2 border border-slate-300 dark:border-slate-700/60 hover:border-brand-500/40 transition-all"
            >
              <Lock className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              <span>Password & Settings</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              id="dashboard-upload-btn"
              className="px-5 py-2.5 rounded-xl neu-button text-white text-xs font-bold shadow-glow flex items-center space-x-2 border-brand-500/40"
            >
              <Upload className="w-4 h-4 text-accent-emerald" />
              <span>Upload Resource</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl neu-flat flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl neu-button text-brand-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">{subjects?.length || 4}</span>
            <p className="text-xs text-slate-400 font-medium">Enrolled Subjects</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl neu-flat flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl neu-button text-accent-violet flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">48+</span>
            <p className="text-xs text-slate-400 font-medium">Exam Papers Available</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl neu-flat flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl neu-button text-accent-emerald flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">Gemini 2.0</span>
            <p className="text-xs text-slate-400 font-medium">AI Exam Assistant</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl neu-flat flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl neu-button text-amber-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-white">100%</span>
            <p className="text-xs text-slate-400 font-medium">Curriculum Match</p>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Question Papers */}
        <div
          id="papers"
          onClick={() => handleOpenCategory('PAPERS')}
          className="p-6 rounded-3xl neu-flat hover:neu-convex transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl neu-button text-brand-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Previous Question Papers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Browse previous Mid-1, Mid-2, and Semester end exam papers with marks distribution and university formats.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between text-xs font-bold text-brand-400">
            <span>Explore Papers Archive</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Lecture & Unit Notes */}
        <div
          id="notes"
          onClick={() => handleOpenCategory('NOTES')}
          className="p-6 rounded-3xl neu-flat hover:neu-convex transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl neu-button text-accent-emerald flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Faculty & Student Notes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unit-wise notes, handwritten topper summaries, lab manuals, and syllabus reference material.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between text-xs font-bold text-accent-emerald">
            <span>Access Study Notes</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: AI Exam Assistant (Phase 3 Gateway) */}
        <div
          id="ai-assistant"
          onClick={() => navigate('/repository')}
          className="p-6 rounded-3xl neu-flat hover:neu-convex transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl neu-button text-accent-violet flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Open Academic Repository</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full multi-filter repository with live SHA-256 duplicate detection, bookmarks, and Gemini AI validation.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-700/30 flex items-center justify-between text-xs font-bold text-accent-violet">
            <span>Open Shared Archive</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

      {/* Account & Password Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={user} />
    </div>
  );
};


export default Dashboard;
