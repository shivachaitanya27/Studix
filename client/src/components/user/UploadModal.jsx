import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  X,
  FileText,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Hash,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';
import { uploadResource, fetchResources } from '../../redux/resourceSlice.js';
import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
  selectSubjects,
} from '../../redux/academicSlice.js';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const UploadModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const college = useSelector(selectSelectedCollege) || user?.college;
  const department = useSelector(selectSelectedDepartment) || user?.department;
  const year = useSelector(selectSelectedYear) || user?.academic_year;
  const semester = useSelector(selectSelectedSemester) || user?.semester;
  const subjects = useSelector(selectSubjects);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('SEMESTER_PAPER');
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [inspectionStage, setInspectionStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Dedicated Duplicate Document Notification Popup State
  const [duplicatePopup, setDuplicatePopup] = useState({
    isOpen: false,
    message: '',
    existingTitle: '',
  });

  const handleCloseDuplicatePopup = () => {
    setDuplicatePopup({
      isOpen: false,
      message: '',
      existingTitle: '',
    });
    setFile(null);
    setTitle('');
    setErrorMessage('');
  };

  const isValidDocFormat = (fileOrName) => {
    if (!fileOrName) return false;
    const name = typeof fileOrName === 'string' ? fileOrName : (fileOrName.name || '');
    const mime = typeof fileOrName === 'object' && fileOrName.type ? fileOrName.type.toLowerCase() : '';
    const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '';

    return (
      ext === '.pdf' ||
      mime.includes('pdf') ||
      ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.png', '.jpg', '.jpeg', '.webp', '.txt'].includes(ext) ||
      mime.startsWith('image/') ||
      mime.includes('word') ||
      mime.includes('presentation')
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!isValidDocFormat(selected)) {
        setErrorMessage('Unsupported file format. Any PDF, Word (DOCX), PowerPoint (PPTX), and Image Scans (PNG/JPG) are allowed.');
        setFile(null);
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setErrorMessage('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      if (!isValidDocFormat(selected)) {
        setErrorMessage('Unsupported file format. Any PDF, Word (DOCX), PowerPoint (PPTX), and Image Scans (PNG/JPG) are allowed.');
        setFile(null);
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please choose a file to upload.');
      return;
    }

    if (!isValidDocFormat(file)) {
      setErrorMessage('Unsupported file format. Any PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX), and Image Scans are allowed.');
      return;
    }

    if (!subjectName || !subjectName.trim()) {
      setErrorMessage('Please enter the subject name manually (e.g. Operating Systems, Circuit Theory, Machine Learning).');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);

    // Dynamic Inspection Stages for user feedback
    setInspectionStage('Computing SHA-256 cryptographic hash to reject duplicate uploads...');

    const timer1 = setTimeout(() => {
      setInspectionStage('Invoking OpenRouter Gemini Vision model for document moderation...');
    }, 700);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title || file.name);
    formData.append('resourceType', resourceType);
    formData.append('subjectName', subjectName.trim());
    if (college?.id) formData.append('collegeId', college.id);
    if (department?.id) formData.append('departmentId', department.id);
    if (year) formData.append('year', year);
    if (semester) formData.append('semester', semester);

    const result = await dispatch(uploadResource(formData));
    clearTimeout(timer1);

    if (uploadResource.fulfilled.match(result)) {
      setInspectionStage('Verified! File approved and added to repository.');
      dispatch(
        fetchResources({
          collegeId: college?.id,
          departmentId: department?.id,
          year,
          semester,
        })
      );

      setTimeout(() => {
        setIsProcessing(false);
        setFile(null);
        setTitle('');
        setSubjectId('');
        setSubjectName('');
        onClose();
      }, 1400);
    } else {
      setIsProcessing(false);
      const payload = result.payload;
      const errorMsg =
        typeof payload === 'string'
          ? payload
          : (payload?.message || 'Upload rejected. Please check your document.');
      const isDup =
        payload?.isDuplicate ||
        errorMsg.toLowerCase().includes('friend') ||
        errorMsg.toLowerCase().includes('helping') ||
        errorMsg.toLowerCase().includes('already');

      if (isDup) {
        setDuplicatePopup({
          isOpen: true,
          message: errorMsg,
          existingTitle: payload?.existingResource?.title || '',
        });
      } else {
        setErrorMessage(errorMsg);
      }
    }
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
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg my-auto rounded-3xl neu-flat p-5 sm:p-7 z-10 max-h-[85vh] overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/30 mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl neu-button flex items-center justify-center text-brand-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Upload Academic Resource
              </h3>
              <p className="text-[11px] text-slate-400">
                PDF, Word, PPT only • SHA-256 duplicate checked & Gemini inspected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-button text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-accent-emerald/10 border border-accent-emerald/40 text-emerald-300 text-xs flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-accent-emerald flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop File Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="relative p-6 rounded-2xl neu-pressed border border-dashed border-slate-600/60 hover:border-brand-500 transition-colors text-center cursor-pointer"
          >
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,application/pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            {file ? (
              <div className="flex items-center justify-center space-x-3">
                <FileText className="w-8 h-8 text-brand-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-white truncate max-w-[280px]">
                    {file.name}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type || 'Document'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-bold text-slate-200">
                  Drop your document here, or <span className="text-brand-400 underline">browse</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  Supports all PDF documents, Word, PowerPoint, and Image Scans (Max 50MB)
                </p>
              </div>
            )}
          </div>


          {/* Title input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Resource Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Computer Networks Mid 1 Question Paper 2025"
              required
              className="w-full px-4 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Category & Subject Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Resource Type */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Resource Category
              </label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 focus:outline-none"
              >
                <optgroup label="Question Papers">
                  <option value="SEMESTER_PAPER">Semester Final Paper</option>
                  <option value="PREVIOUS_PAPER">Previous Exam Paper</option>
                  <option value="MID_1">Mid-1 Exam Paper</option>
                  <option value="MID_2">Mid-2 Exam Paper</option>
                  <option value="MODEL_PAPER">Model Exam Paper</option>
                </optgroup>
                <optgroup label="Lecture Notes">
                  <option value="UNIT_NOTES">Unit-wise Notes</option>
                  <option value="SUBJECT_NOTES">Full Subject Notes</option>
                  <option value="FACULTY_NOTES">Faculty Handouts</option>
                  <option value="STUDENT_NOTES">Student Handwritten Notes</option>
                </optgroup>
                <optgroup label="Materials">
                  <option value="LAB_MANUAL">Lab Manual</option>
                  <option value="PPT">Presentation Slides (PPT)</option>
                  <option value="REFERENCE_MATERIAL">Reference Material</option>
                </optgroup>
              </select>
            </div>

            {/* Manual Subject Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Subject Name <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">Enter manually</span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Operating Systems, Cloud Computing, DBMS..."
                  required
                  className="w-full px-3 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 bg-transparent focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Enter the exact course/subject title as in your syllabus.
              </p>
            </div>
          </div>


          {/* Academic Context Badge */}
          <div className="p-3 rounded-xl neu-pressed flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Target: <span className="font-bold text-slate-200">{college?.code || 'Campus'}</span> •{' '}
              <span className="text-brand-300 font-bold">{department?.code || 'Stream'}</span>
            </span>
            <span className="text-amber-400 font-bold">
              Year {year || 1}, Sem {semester || 1}
            </span>
          </div>

          {/* Processing Banner */}
          {isProcessing && (
            <div className="p-3.5 rounded-xl neu-pressed space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-300">
                <Cpu className="w-4 h-4 text-brand-400 animate-spin" />
                <span>{inspectionStage}</span>
              </div>
              <div className="h-1 w-full bg-slate-700/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-accent-cyan animate-pulse w-full" />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !file}
            className="w-full py-3.5 rounded-xl neu-button text-white font-bold text-xs shadow-glow disabled:opacity-40 transition-all flex items-center justify-center space-x-2"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-accent-emerald" />
                <span>Verify & Ingest Resource</span>
              </>
            )}
          </button>
        </form>

        {/* Duplicate Document Popup Notification */}
        <AnimatePresence>
          {duplicatePopup.isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative max-w-md w-full rounded-3xl neu-flat p-6 sm:p-7 text-center border border-amber-500/30 shadow-2xl overflow-hidden"
              >
                {/* Ambient glow behind badge */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

                {/* Animated Badge */}
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-brand-500/20 to-accent-emerald/20 border border-amber-400/40 flex items-center justify-center mb-4 shadow-glow">
                  <HeartHandshake className="w-8 h-8 text-amber-400 animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center text-[10px] font-black">
                    !
                  </div>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-white mb-2 flex items-center justify-center gap-2">
                  <span>Peer Contribution Detected</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h3>

                {/* User's Exact Requested Notification Message */}
                <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                  <p className="text-sm font-bold leading-relaxed">
                    &ldquo;{duplicatePopup.message || "Thanks fors Helping to Your friends,but Your friend is already this ,be frist next time than your friend"}&rdquo;
                  </p>
                </div>

                {duplicatePopup.existingTitle && (
                  <p className="text-xs text-slate-400 mb-4 truncate px-2">
                    Already in repository as:{' '}
                    <span className="text-slate-200 font-semibold">
                      &quot;{duplicatePopup.existingTitle}&quot;
                    </span>
                  </p>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">
                  Your willingness to help classmates is awesome! Another student already uploaded this exact document to the repository. Look for other question papers or notes and be the first to upload next time!
                </p>

                <button
                  type="button"
                  onClick={handleCloseDuplicatePopup}
                  className="w-full py-3.5 px-4 rounded-xl neu-button text-amber-300 hover:text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center space-x-2"
                >
                  <span>Understood, I&apos;ll Be First Next Time!</span>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default UploadModal;
