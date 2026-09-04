import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  X,
  Lock,
  Bell,
  FileUp,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HardDrive,
  FileType,
  Volume2,
  Sparkles,
  Loader2,
  Save,
  ArrowLeft,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  Check,
  Building2,
  School,
  Sparkle,
} from 'lucide-react';
import api from '../../services/api.js';
import { updateUserState } from '../../redux/authSlice.js';
import { syncFromUser, fetchSubjects } from '../../redux/academicSlice.js';
import { fetchResources } from '../../redux/resourceSlice.js';

export const SettingsModal = ({ isOpen, onClose, user, initialTab = 'stream' }) => {
  const dispatch = useDispatch();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState(initialTab); // 'stream' | 'security' | 'notifications' | 'uploads'

  // Academic Stream State (College, Department, Year & Semester)
  const [colleges, setColleges] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedCollegeId, setSelectedCollegeId] = useState(user?.college_id || user?.college?.id || '');
  const [selectedDeptId, setSelectedDeptId] = useState(user?.department_id || user?.department?.id || '');
  const [selectedYear, setSelectedYear] = useState(user?.academic_year || 1);
  const [selectedSem, setSelectedSem] = useState(user?.semester || 1);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamSuccess, setStreamSuccess] = useState('');
  const [streamError, setStreamError] = useState('');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('studix_notification_settings');
      return saved
        ? JSON.parse(saved)
        : {
            emailAlerts: true,
            examReminders: true,
            soundEffects: true,
            weeklyDigest: false,
          };
    } catch {
      return {
        emailAlerts: true,
        examReminders: true,
        soundEffects: true,
        weeklyDigest: false,
      };
    }
  });

  // Upload permissions state
  const [uploadPrefs, setUploadPrefs] = useState(() => {
    try {
      const saved = localStorage.getItem('studix_upload_settings');
      return saved
        ? JSON.parse(saved)
        : {
            allowedPdf: true,
            allowedDocx: true,
            allowedPptx: true,
            allowedImages: true,
            maxFileSizeMb: 25,
            autoOcr: true,
          };
    } catch {
      return {
        allowedPdf: true,
        allowedDocx: true,
        allowedPptx: true,
        allowedImages: true,
        maxFileSizeMb: 25,
        autoOcr: true,
      };
    }
  });

  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (user?.academic_year) setSelectedYear(user.academic_year);
      if (user?.semester) setSelectedSem(user.semester);
      if (user?.college_id || user?.college?.id) {
        setSelectedCollegeId(user.college_id || user.college.id);
      }
      if (user?.department_id || user?.department?.id) {
        setSelectedDeptId(user.department_id || user.department.id);
      }
      setStreamSuccess('');
      setStreamError('');
      setPasswordSuccess('');
      setPasswordError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Fetch dynamic colleges & departments
      api
        .get('/academic/colleges')
        .catch(() => api.get('/colleges'))
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setColleges(res.data.data);
          }
        })
        .catch((err) => console.warn('Colleges fetch notice:', err));

      api
        .get('/academic/departments')
        .catch(() => api.get('/departments'))
        .then((res) => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setDepartments(res.data.data);
          }
        })
        .catch((err) => console.warn('Departments fetch notice:', err));
    }
  }, [isOpen, initialTab, user]);

  if (!isOpen) return null;

  const handleUpdateStream = async (e) => {
    e.preventDefault();
    setStreamSuccess('');
    setStreamError('');
    setStreamLoading(true);

    try {
      const payload = {
        academic_year: parseInt(selectedYear, 10),
        semester: parseInt(selectedSem, 10),
      };

      if (isAdmin) {
        if (selectedCollegeId || user?.college_id || user?.college?.id) {
          payload.college_id = selectedCollegeId || user?.college_id || user?.college?.id;
        }
        if (selectedDeptId || user?.department_id || user?.department?.id) {
          payload.department_id = selectedDeptId || user?.department_id || user?.department?.id;
        }
      }

      const response = await api.put('/auth/profile', payload);
      const updatedUser = response.data.data;

      dispatch(updateUserState(updatedUser));
      dispatch(syncFromUser(updatedUser));

      if (updatedUser.department_id) {
        dispatch(
          fetchSubjects({
            departmentId: updatedUser.department_id,
            year: parseInt(selectedYear, 10),
            semester: parseInt(selectedSem, 10),
          })
        );
      }

      dispatch(
        fetchResources({
          collegeId: updatedUser.college_id,
          departmentId: updatedUser.department_id,
          year: parseInt(selectedYear, 10),
          semester: parseInt(selectedSem, 10),
        })
      );

      const deptObj = departments.find((d) => d.id === (selectedDeptId || updatedUser.department_id)) || updatedUser.department;
      const deptLabel = deptObj?.name ? `${deptObj.name} (${deptObj.code || ''})` : 'Academic Branch';
      const colObj = colleges.find((c) => c.id === (selectedCollegeId || updatedUser.college_id)) || updatedUser.college;
      const colLabel = colObj?.name || 'Campus';

      setStreamSuccess(
        `Stream updated! Successfully switched to ${deptLabel} (Year ${selectedYear}, Sem ${selectedSem}) at ${colLabel}. Study resources and solver refreshed.`
      );
    } catch (err) {
      setStreamError(err.message || 'Failed to update academic stream.');
    } finally {
      setStreamLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setPasswordSuccess(response.data.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSavePreferences = () => {
    localStorage.setItem('studix_notification_settings', JSON.stringify(notifications));
    localStorage.setItem('studix_upload_settings', JSON.stringify(uploadPrefs));
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in flex items-center justify-center p-3 sm:p-5">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl my-auto bg-white dark:bg-[#131722] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 max-h-[82vh] sm:max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Modal Header - Fixed at Top */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white dark:bg-[#131722]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
                Account & Academic Settings
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[220px] sm:max-w-none">
                Academic stream progression, security & preferences
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-button text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation - Fixed underneath Header */}
        <div className="flex space-x-1 sm:space-x-1.5 px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-slate-50/60 dark:bg-slate-900/40 overflow-x-auto scrollbar-none">
          {[
            { id: 'stream', label: 'Academic Stream', icon: GraduationCap },
            { id: 'security', label: 'Security & Password', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'uploads', label: 'Upload Permissions', icon: FileUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? 'neu-tab-active text-brand-600 dark:text-brand-300 font-extrabold border border-brand-500/30'
                    : 'neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 0: Academic Stream (Year & Semester Progression) */}
          {activeTab === 'stream' && (
          <form onSubmit={handleUpdateStream} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start space-x-3">
              <GraduationCap className="w-5 h-5 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">
                  Quarterly Semester Progression
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  Update your semester every 3 to 4 months as your academic term advances. Changing your stream here immediately reconfigures your curriculum subjects, lecture notes, and AI exam assistant.
                </p>
              </div>
            </div>

            {streamSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                <span>{streamSuccess}</span>
              </div>
            )}

            {streamError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{streamError}</span>
              </div>
            )}

            {/* If Admin: Editable College & Department Switchers. If Student: Read-only Enrolled Campus & Dept Card */}
            {isAdmin ? (
              <>
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    Administrator Stream Controller
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold uppercase">
                    Admin Only
                  </span>
                </div>

                {/* 1. College / University Selector (Admin Only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-brand-500" />
                      <span>College / Institution</span>
                    </span>
                    <span className="text-[11px] font-bold text-accent-emerald flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                      Active Campus
                    </span>
                  </label>
                  <select
                    value={selectedCollegeId}
                    onChange={(e) => setSelectedCollegeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl neu-pressed bg-slate-50 dark:bg-[#101420] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    {colleges.length > 0 ? (
                      colleges.map((col) => (
                        <option key={col.id} value={col.id}>
                          {col.name} ({col.code})
                        </option>
                      ))
                    ) : (
                      <option value={user?.college_id || user?.college?.id || ''}>
                        {user?.college?.name || 'Dhanalakshmi Srinivasan University Trichy (DSU)'}
                      </option>
                    )}
                  </select>
                </div>

                {/* 2. Department / Branch Selector (Admin Only) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-accent-cyan" />
                      <span>Branch / Department</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-brand-500 dark:text-brand-300">
                      {departments.find((d) => d.id === selectedDeptId)?.code || user?.department?.code || 'Branch'}
                    </span>
                  </label>

                  {/* Grid of 8 Engineering Departments */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(departments.length > 0
                      ? departments
                      : [
                          { id: 'd1000000-0000-0000-0000-000000000001', name: 'Computer Science and Engineering', code: 'CSE' },
                          { id: 'd1000000-0000-0000-0000-000000000005', name: 'Artificial Intelligence and Data Science', code: 'AI-DS' },
                          { id: 'd1000000-0000-0000-0000-000000000006', name: 'Artificial Intelligence and Machine Learning', code: 'AIML' },
                          { id: 'd1000000-0000-0000-0000-000000000007', name: 'Cybersecurity', code: 'CYB' },
                          { id: 'd1000000-0000-0000-0000-000000000002', name: 'Electronics and Communication Engineering', code: 'ECE' },
                          { id: 'd1000000-0000-0000-0000-000000000003', name: 'Electrical and Electronics Engineering', code: 'EEE' },
                          { id: 'd1000000-0000-0000-0000-000000000004', name: 'Information Technology', code: 'IT' },
                          { id: 'd1000000-0000-0000-0000-000000000008', name: 'Internet of Things', code: 'IOT' },
                        ]
                    ).map((dept) => {
                      const isSelected = selectedDeptId === dept.id || (!selectedDeptId && dept.code === 'CSE');
                      return (
                        <button
                          key={dept.id}
                          type="button"
                          onClick={() => setSelectedDeptId(dept.id)}
                          className={`p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'neu-pressed border-2 border-brand-500 bg-brand-500/15 text-brand-600 dark:text-brand-300 font-black shadow-sm'
                              : 'neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black">{dept.code}</span>
                            {isSelected && <Check className="w-3 h-3 text-brand-500" />}
                          </div>
                          <span className="text-[10px] block opacity-80 truncate mt-0.5" title={dept.name}>
                            {dept.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* Student Locked Enrolled Campus & Department Badge */
              <div className="p-3.5 rounded-2xl neu-flat bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-brand-500" />
                    Enrolled Academic Details
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Institution</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {user?.college?.name || 'DSU Trichy'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Department</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                      {user?.department?.name || user?.department?.code || 'Computer Science & Eng (CSE)'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 italic">
                  <span>ℹ️ College and Department changes are managed exclusively by campus administrators.</span>
                </p>
              </div>
            )}

            {/* 3. Academic Year Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Select Academic Year</span>
                <span className="text-[11px] font-normal text-brand-600 dark:text-brand-400">
                  Year {selectedYear}
                </span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((y) => {
                  const isSelected = selectedYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setSelectedYear(y);
                        const minSem = (y - 1) * 2 + 1;
                        const maxSem = y * 2;
                        if (selectedSem < minSem || selectedSem > maxSem) {
                          setSelectedSem(minSem);
                        }
                      }}
                      className={`p-2.5 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'neu-pressed border-2 border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-300 font-black shadow-sm'
                          : 'neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black block">Year {y}</span>
                      <span className="text-[10px] block opacity-75">
                        {y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : 'Final Year'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Semester Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center justify-between">
                <span>Select Active Semester</span>
                <span className="text-[11px] font-normal text-amber-500 dark:text-amber-400 font-bold">
                  Semester {selectedSem}
                </span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                  const isSelected = selectedSem === s;
                  const isTypicalForYear = Math.ceil(s / 2) === selectedYear;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSelectedSem(s);
                        setSelectedYear(Math.ceil(s / 2));
                      }}
                      className={`p-2 sm:p-2.5 rounded-xl text-center transition-all ${
                        isSelected
                          ? 'neu-pressed border-2 border-amber-500 bg-amber-500/15 text-amber-500 dark:text-amber-300 font-black shadow-sm'
                          : isTypicalForYear
                          ? 'neu-button border border-brand-500/30 text-slate-800 dark:text-slate-200 font-bold'
                          : 'neu-button text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-black block">Sem {s}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl neu-button text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Close</span>
              </button>

              <button
                type="submit"
                disabled={streamLoading}
                id="save-academic-stream-btn"
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs font-black shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {streamLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{isAdmin ? 'Saving Stream, Dept & College...' : 'Updating Year & Semester...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>
                      {isAdmin
                        ? `Save Stream (Dept, College, Year ${selectedYear} • Sem ${selectedSem})`
                        : `Save & Switch to Semester ${selectedSem} (Year ${selectedYear})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 1: Security & Password */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-start space-x-3">
              <Lock className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white">Change Account Password</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                  Ensure your account is using a strong password of at least 6 characters to keep your academic work safe.
                </p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full px-4 py-3 rounded-xl neu-pressed bg-slate-50 dark:bg-[#101420] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-300 dark:border-slate-700/80 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-xl neu-pressed bg-slate-50 dark:bg-[#101420] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-300 dark:border-slate-700/80 transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type your new password to verify"
                required
                className="w-full px-4 py-3 rounded-xl neu-pressed bg-slate-50 dark:bg-[#101420] text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 border border-slate-300 dark:border-slate-700/80 transition-all"
              />
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                id="settings-password-back-btn"
                className="py-3 px-5 rounded-xl neu-button text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-slate-300 dark:border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={passwordLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs font-black shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-white" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {[
                {
                  id: 'emailAlerts',
                  title: 'Email Alerts on New Papers & Notes',
                  desc: 'Receive alerts when new syllabus notes or question papers are published for your department.',
                },
                {
                  id: 'examReminders',
                  title: 'Exam Assistant Reminders',
                  desc: 'Get proactive study prompts and RAG digest notifications before upcoming semester exams.',
                },
                {
                  id: 'soundEffects',
                  title: 'Chat & Action Audio Feedback',
                  desc: 'Play subtle audio feedback when speech or AI synthesis completes.',
                },
                {
                  id: 'weeklyDigest',
                  title: 'Weekly Syllabus Progress Digest',
                  desc: 'Weekly report on bookmarked documents, solved papers, and questions reviewed.',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl neu-pressed flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications[item.id]}
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.id]: e.target.checked,
                      })
                    }
                    className="mt-1 w-4 h-4 accent-brand-500 rounded cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs font-black shadow-glow transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        )}

        {/* TAB 3: Upload Permissions */}
        {activeTab === 'uploads' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl neu-pressed space-y-2 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileType className="w-4 h-4 text-brand-400" />
                  Allowed Document File Types
                </span>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {[
                    { key: 'allowedPdf', label: 'PDF Documents (.pdf)', disabled: true },
                    { key: 'allowedDocx', label: 'Word Documents (.docx)', disabled: false },
                    { key: 'allowedPptx', label: 'Presentations (.pptx)', disabled: false },
                    { key: 'allowedImages', label: 'Handwritten Scans (.png, .jpg)', disabled: false },
                  ].map((f) => (
                    <label
                      key={f.key}
                      className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={uploadPrefs[f.key]}
                        disabled={f.disabled}
                        onChange={(e) =>
                          setUploadPrefs({
                            ...uploadPrefs,
                            [f.key]: e.target.checked,
                          })
                        }
                        className="w-3.5 h-3.5 accent-brand-500 rounded"
                      />
                      <span className={f.disabled ? 'text-slate-400 font-semibold' : ''}>
                        {f.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max upload size */}
              <div className="p-3.5 rounded-2xl neu-pressed flex items-center justify-between border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-amber-400" />
                    Maximum File Upload Limit
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Max size allowed per single academic document
                  </p>
                </div>
                <select
                  value={uploadPrefs.maxFileSizeMb}
                  onChange={(e) =>
                    setUploadPrefs({
                      ...uploadPrefs,
                      maxFileSizeMb: parseInt(e.target.value, 10),
                    })
                  }
                  className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-brand-500 dark:text-brand-300 focus:outline-none cursor-pointer"
                >
                  <option value={10}>10 MB</option>
                  <option value={25}>25 MB (Standard)</option>
                  <option value={50}>50 MB (High-Res)</option>
                </select>
              </div>

              {/* Auto OCR text extraction */}
              <div className="p-3.5 rounded-2xl neu-pressed flex items-center justify-between border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    Automatic OCR Text Extraction
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Extract keywords from uploaded files for RAG search
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={uploadPrefs.autoOcr}
                  onChange={(e) =>
                    setUploadPrefs({
                      ...uploadPrefs,
                      autoOcr: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                />
              </div>

              {/* Supabase Storage info */}
              <div className="p-3 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-500 dark:text-brand-300 flex items-center justify-between">
                <span>Active Cloud Storage:</span>
                <span className="font-mono text-[11px] font-bold">Supabase (academic-resources)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSavePreferences}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet text-white text-xs font-black shadow-glow transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Save Upload Permissions</span>
            </button>
          </div>
        )}

        {/* Toast confirmation */}
        {settingsSavedToast && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs text-center font-bold animate-fade-in flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings saved successfully!</span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
