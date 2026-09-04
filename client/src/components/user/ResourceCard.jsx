import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Bookmark,
  Download,
  ExternalLink,
  ShieldCheck,
  Hash,
  Calendar,
  Layers,
  User,
  Eye,
  Sparkles,
  X,
  Trash2,
} from 'lucide-react';
import { toggleBookmark, deleteResource } from '../../redux/resourceSlice.js';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const ResourceCard = ({ resource, isBookmarked = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin =
    user &&
    (user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      (user.email || '').toLowerCase().trim() === 'vshivachaitanya7@gmail.com');


  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'ocr'
  const [pdfLoading, setPdfLoading] = useState(true);
  const [useDirectViewer, setUseDirectViewer] = useState(true);

  useEffect(() => {
    if (isPreviewOpen) {
      setPdfLoading(true);
      setUseDirectViewer(true);
      const timer = setTimeout(() => {
        setPdfLoading(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isPreviewOpen, resource.file_url]);

  const handleOpenNativeApp = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    dispatch(toggleBookmark(resource.id));
  };

  // Color mappings for resource types
  const typeStyles = {
    SEMESTER_PAPER: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    PREVIOUS_PAPER: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    MID_1: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    MID_2: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    MODEL_PAPER: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    UNIT_NOTES: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    FACULTY_NOTES: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    STUDENT_NOTES: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    LAB_MANUAL: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
    PPT: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    REFERENCE_MATERIAL: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  };

  const badgeClass =
    typeStyles[resource.resource_type] ||
    'text-brand-300 bg-brand-500/10 border-brand-500/30';

  const formattedType = resource.resource_type?.replace(/_/g, ' ');

  return (
    <div
      onClick={() => setIsPreviewOpen(true)}
      className="p-5 rounded-3xl neu-flat hover:border-brand-500/30 transition-all duration-300 group cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      <div>
        {/* Card Header: Type Badge & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm ${badgeClass}`}
          >
            {formattedType}
          </span>

          <div className="flex items-center space-x-1.5">
            {resource.is_verified && (
              <span
                className="p-1.5 rounded-lg neu-pressed text-accent-emerald flex items-center justify-center"
                title="Verified Authentic Academic Material"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
              </span>
            )}

            <button
              type="button"
              onClick={handleBookmark}
              className={`p-1.5 rounded-xl neu-button transition-colors ${
                isBookmarked
                  ? 'text-amber-400 active'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Resource'}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`}
              />
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 rounded-xl neu-button text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 transition-colors"
                title="Remove Unwanted File (Admin)"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">
          {resource.title}
        </h3>

        {/* Academic Hierarchy Context */}
        <div className="mt-3 space-y-1 text-xs text-slate-400">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="font-semibold text-slate-300">
              {resource.subject?.name || 'Academic Core'}
            </span>
            {resource.subject?.code && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded neu-pressed text-brand-300">
                {resource.subject.code}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 flex-wrap gap-y-1">
            <span>Year {resource.year || 1}</span>
            <span>•</span>
            <span>Sem {resource.semester || 1}</span>
            {resource.department?.code && (
              <>
                <span>•</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold neu-pressed text-cyan-300 border border-cyan-500/20">
                  {resource.department.code}
                </span>
              </>
            )}
            {resource.college?.code && (
              <>
                <span>•</span>
                <span className="text-brand-400 font-bold">{resource.college.code}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata & Quick Preview Button */}
      <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-[11px] text-slate-500">
          <User className="w-3 h-3" />
          <span className="truncate max-w-[100px]">
            {resource.uploader?.full_name || 'Campus Student'}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsPreviewOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl neu-button text-[11px] font-bold text-brand-300 hover:text-white flex items-center space-x-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View PDF</span>
        </button>
      </div>

      {/* Document Inspector & Preview Modal */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full max-w-4xl bg-dark-card border border-dark-border rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-700/30 gap-2">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black neu-pressed text-brand-300">
                    {formattedType}
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {resource.subject?.code} • Year {resource.year}, Sem {resource.semester}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  {resource.title}
                </h3>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl neu-pressed">
                <button
                  type="button"
                  onClick={() => setViewMode('pdf')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'pdf'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('ocr')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'ocr'
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Text
                </button>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-white ml-1"
                aria-label="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Native App Intent Prompt Bar */}
            {resource.file_url && (
              <div className="my-2.5 p-2.5 sm:p-3 rounded-2xl neu-flat bg-brand-500/10 border border-brand-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <div className="flex items-center space-x-2 text-xs">
                  <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  <span className="text-slate-200 text-xs font-medium">
                    Open in preferred viewer on your mobile phone:
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenNativeApp(resource.file_url)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl neu-button bg-brand-600/30 hover:bg-brand-600/50 text-white font-bold text-xs flex items-center justify-center space-x-1.5 border border-brand-500/50 shadow-glow"
                    title="Prompts mobile OS to choose Google Drive, PDF Viewer, Adobe Acrobat, or Docs"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-brand-300" />
                    <span>Open in Drive / PDF App</span>
                  </button>

                  <a
                    href={resource.file_url}
                    download={`${resource.title || 'studix-document'}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-xl neu-button text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5 text-accent-cyan" />
                    <span className="hidden sm:inline">Save</span>
                  </a>
                </div>
              </div>
            )}

            {/* Document Content / Embedded Preview Frame */}
            <div className="flex-1 rounded-2xl neu-pressed overflow-hidden min-h-[380px] sm:min-h-[500px] flex flex-col relative bg-slate-950">
              {viewMode === 'pdf' && resource.file_url ? (
                <>
                  {pdfLoading && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm space-y-3 p-4 text-center">
                      <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">Opening PDF instantly...</p>
                        <p className="text-[11px] text-slate-400">Direct streaming from cloud repository</p>
                      </div>
                    </div>
                  )}

                  {useDirectViewer ? (
                    <object
                      data={`${resource.file_url}#toolbar=1&navpanes=0`}
                      type="application/pdf"
                      className="w-full h-full min-h-[380px] sm:min-h-[500px] rounded-2xl border-0"
                      onLoad={() => setPdfLoading(false)}
                    >
                      <iframe
                        src={`${resource.file_url}#toolbar=1&navpanes=0`}
                        title={resource.title}
                        className="w-full h-full min-h-[380px] sm:min-h-[500px] rounded-2xl border-0"
                        onLoad={() => setPdfLoading(false)}
                        onError={() => {
                          setPdfLoading(false);
                          setUseDirectViewer(false);
                        }}
                      />
                    </object>
                  ) : (
                    <iframe
                      src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                        resource.file_url
                      )}&embedded=true`}
                      title={resource.title}
                      className="w-full h-full min-h-[380px] sm:min-h-[500px] rounded-2xl border-0"
                      onLoad={() => setPdfLoading(false)}
                      onError={() => {
                        setPdfLoading(false);
                        setViewMode('ocr');
                      }}
                    />
                  )}
                </>
              ) : (
                <div className="p-4 sm:p-5 space-y-3 text-xs text-slate-200 overflow-y-auto max-h-[50vh]">
                  <div className="flex items-center space-x-2 text-brand-400 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>Extracted Academic Document Text</span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed bg-dark-bg/80 p-4 rounded-xl font-mono whitespace-pre-wrap select-text border border-slate-800">
                    {resource.ocr_extracted_text ||
                      'No OCR text extracted yet. Please use the "Open in Drive / PDF App" button above to view the original PDF document.'}
                  </div>
                  {resource.file_hash && (
                    <p className="text-[10px] text-slate-500 font-mono">
                      SHA-256 Checksum: {resource.file_hash}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-700/30 mt-2 gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    navigate('/ai-assistant');
                  }}
                  className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-amber-300 hover:text-white flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Solve with Exam AI</span>
                </button>

                {viewMode === 'pdf' && resource.file_url && (
                  <button
                    type="button"
                    onClick={() => {
                      setPdfLoading(true);
                      setUseDirectViewer(!useDirectViewer);
                    }}
                    className="text-[11px] text-slate-400 hover:text-brand-300 underline px-2 py-1"
                  >
                    {useDirectViewer ? 'Use Docs Viewer' : 'Use Fast Direct Stream'}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-2 rounded-xl neu-button text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 flex items-center space-x-1.5 cursor-pointer"
                    title="Remove Unwanted File (Admin)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove File</span>
                    <span className="sm:hidden">Delete</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 rounded-xl neu-button text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenNativeApp(resource.file_url)}
                  className="px-3.5 py-2 rounded-xl neu-button text-xs font-bold text-white flex items-center space-x-1.5 bg-brand-500/10 border-brand-500/40"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  <span className="hidden sm:inline">Open Native PDF</span>
                  <span className="sm:hidden">Open</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Purge / Remove Confirmation Dialog Portaled to Body */}
      {typeof document !== 'undefined' && showDeleteConfirm && createPortal(
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="fixed inset-0" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#151926] p-6 z-10 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl mx-auto neu-button flex items-center justify-center text-rose-500 border border-rose-500/30 bg-rose-500/10">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Remove Unwanted File?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Permanently delete <span className="font-bold text-slate-900 dark:text-white">&quot;{resource.title}&quot;</span> from the university academic repository and storage?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="py-2.5 px-4 rounded-xl neu-button text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  try {
                    setIsDeleting(true);
                    await dispatch(deleteResource(resource.id)).unwrap();
                    setShowDeleteConfirm(false);
                    setIsPreviewOpen(false);
                  } catch (err) {
                    alert('Failed to delete file: ' + (typeof err === 'string' ? err : err?.message || 'Error'));
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              >
                {isDeleting ? 'Removing...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ResourceCard;
