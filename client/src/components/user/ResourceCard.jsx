import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
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
} from 'lucide-react';
import { toggleBookmark } from '../../redux/resourceSlice.js';

export const ResourceCard = ({ resource, isBookmarked = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);


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
    <div className="p-5 rounded-2xl neu-flat hover:neu-convex transition-all flex flex-col justify-between group relative overflow-hidden">
      {/* Top Meta Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${badgeClass}`}
          >
            {formattedType}
          </span>

          <button
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
            className={`p-2 rounded-xl neu-button transition-colors ${
              isBookmarked
                ? 'text-amber-400 active'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`}
            />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-2 mb-2">
          {resource.title}
        </h4>

        {/* Subject & Code */}
        {resource.subject && (
          <div className="flex items-center space-x-2 text-xs text-slate-300 mb-3">
            <span className="px-2 py-0.5 rounded-md neu-pressed text-[10px] font-bold text-brand-300">
              {resource.subject.code}
            </span>
            <span className="truncate max-w-[180px] text-slate-400 text-[11px]">
              {resource.subject.name}
            </span>
          </div>
        )}

        {/* Year & Semester Pill */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mb-3">
          <span className="flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Year {resource.year}, Sem {resource.semester}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-emerald" />
            <span className="text-accent-emerald font-medium">AI Verified</span>
          </span>
        </div>
      </div>

      {/* Bottom Footer Info & Actions */}
      <div className="pt-3 border-t border-slate-700/30 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-[10px] text-slate-500 truncate max-w-[130px]">
          <User className="w-3 h-3" />
          <span className="truncate">{resource.uploader?.full_name || 'Verified Faculty'}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="p-1.5 rounded-lg neu-button text-accent-cyan hover:text-white flex items-center space-x-1 text-[11px]"
            title="Preview document in app"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="font-semibold text-[10px]">Preview</span>
          </button>

          <button
            onClick={() => window.open(resource.file_url, '_blank')}
            className="p-1.5 rounded-lg neu-button text-slate-300 hover:text-white flex items-center space-x-1 text-[11px]"
            title="Open / Download PDF directly"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="font-semibold text-[10px]">PDF</span>
          </button>
        </div>
      </div>

      {/* Embedded In-App Document Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          />
          <div className="relative w-full max-w-2xl rounded-3xl neu-flat p-6 z-10 flex flex-col max-h-[90vh] overflow-hidden space-y-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-700/30">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-black neu-pressed text-brand-300">
                  {resource.resource_type}
                </span>
                <h3 className="text-sm font-bold text-white max-w-lg line-clamp-1">
                  {resource.title}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {resource.subject?.name} ({resource.subject?.code}) • Year {resource.year}, Sem {resource.semester}
                </p>
              </div>

              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-xl neu-button text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Content / Embedded Preview Frame */}
            <div className="flex-1 rounded-2xl neu-pressed overflow-hidden min-h-[340px] flex flex-col">
              {resource.file_url && resource.file_url.toLowerCase().includes('.pdf') ? (
                <iframe
                  src={resource.file_url}
                  title={resource.title}
                  className="w-full h-full min-h-[340px] rounded-2xl border-0"
                />
              ) : (

                <div className="p-5 space-y-3 text-xs text-slate-200">
                  <div className="flex items-center space-x-2 text-brand-400 font-bold">
                    <FileText className="w-4 h-4" />
                    <span>OCR Extracted Academic Content Summary</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-dark-bg/60 p-4 rounded-xl">
                    {resource.ocr_extracted_text || 'Document verified by Studix Academic Inspection System.'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    SHA-256 Hash: {resource.file_hash}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
              <button
                onClick={() => {
                  setIsPreviewOpen(false);
                  navigate('/ai-assistant');
                }}
                className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-amber-300 hover:text-white flex items-center space-x-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Solve Questions with AI</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="px-4 py-2 rounded-xl neu-button text-xs text-slate-400 hover:text-white font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => window.open(resource.file_url, '_blank')}
                  className="px-4 py-2 rounded-xl neu-button text-xs font-bold text-white flex items-center space-x-1.5 bg-brand-500/10 border-brand-500/40"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
                  <span>Open Full PDF in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceCard;

