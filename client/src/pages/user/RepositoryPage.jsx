import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Calendar,
  Layers,
  Search,
  Upload,
  Bookmark,
  Sliders,
  Sparkles,
  Filter,
  CheckCircle2,
  FolderOpen,
  HelpCircle,
  X,
  Building2,
  School,
  GraduationCap,
} from 'lucide-react';
import api from '../../services/api.js';
import {
  fetchResources,
  fetchUserBookmarks,
  setActiveTab,
  setSearchQuery,
  setSelectedSubjectFilter,
  selectResources,
  selectBookmarks,
  selectActiveTab,
  selectSearchQuery,
  selectSelectedSubjectFilter,
  selectResourceLoading,
} from '../../redux/resourceSlice.js';
import {
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
  selectSubjects,
} from '../../redux/academicSlice.js';
import { selectCurrentUser } from '../../redux/authSlice.js';
import ResourceCard from '../../components/user/ResourceCard.jsx';
import UploadModal from '../../components/user/UploadModal.jsx';

export const RepositoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const college = useSelector(selectSelectedCollege);
  const department = useSelector(selectSelectedDepartment);
  const year = useSelector(selectSelectedYear);
  const semester = useSelector(selectSelectedSemester);
  const subjects = useSelector(selectSubjects);

  const resources = useSelector(selectResources);
  const bookmarks = useSelector(selectBookmarks);
  const activeTab = useSelector(selectActiveTab);
  const searchQuery = useSelector(selectSearchQuery);
  const subjectFilter = useSelector(selectSelectedSubjectFilter);
  const isLoading = useSelector(selectResourceLoading);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');

  // Cross-Department & Cross-College Filter State
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [departmentsList, setDepartmentsList] = useState([]);
  const [collegesList, setCollegesList] = useState([]);
  const [selectedCollegeFilter, setSelectedCollegeFilter] = useState('ALL');

  useEffect(() => {
    api
      .get('/academic/departments')
      .catch(() => api.get('/departments'))
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setDepartmentsList(res.data.data);
        }
      })
      .catch(() => {});

    api
      .get('/academic/colleges')
      .catch(() => api.get('/colleges'))
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data)) {
          setCollegesList(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch repository resources matching active college & department filter
  useEffect(() => {
    const params = {};

    if (selectedCollegeFilter !== 'ALL') {
      params.collegeId = selectedCollegeFilter;
    } else if (college?.id && user?.role !== 'ADMIN') {
      params.collegeId = college.id;
    }

    if (selectedDeptFilter !== 'ALL') {
      params.departmentId = selectedDeptFilter;
    }

    dispatch(fetchResources(params));
    dispatch(fetchUserBookmarks());
  }, [dispatch, college?.id, selectedDeptFilter, selectedCollegeFilter, user?.role]);


  // Tab definitions
  const tabs = [
    { id: 'ALL', label: 'All Resources', count: resources.length },
    {
      id: 'PAPERS',
      label: 'Previous Papers',
      count: resources.filter((r) =>
        ['SEMESTER_PAPER', 'PREVIOUS_PAPER'].includes(r.resource_type)
      ).length,
    },
    {
      id: 'MID',
      label: 'Mid-1 / Mid-2',
      count: resources.filter((r) =>
        ['MID_1', 'MID_2', 'INTERNAL_PAPER'].includes(r.resource_type)
      ).length,
    },
    {
      id: 'NOTES',
      label: 'Study Notes',
      count: resources.filter((r) =>
        ['UNIT_NOTES', 'SUBJECT_NOTES', 'FACULTY_NOTES', 'STUDENT_NOTES'].includes(
          r.resource_type
        )
      ).length,
    },
    {
      id: 'MATERIALS',
      label: 'Lab & PPTs',
      count: resources.filter((r) =>
        ['LAB_MANUAL', 'PPT', 'ASSIGNMENT', 'REFERENCE_MATERIAL'].includes(
          r.resource_type
        )
      ).length,
    },
    {
      id: 'BOOKMARKS',
      label: 'My Bookmarks',
      count: bookmarks.length,
    },
  ];

  // Filtered dataset with full multi-field tokenized matching
  const filteredList = (activeTab === 'BOOKMARKS' ? bookmarks : resources).filter(
    (item) => {
      // 1. Tab category check
      if (activeTab === 'PAPERS') {
        if (!['SEMESTER_PAPER', 'PREVIOUS_PAPER'].includes(item.resource_type)) {
          return false;
        }
      } else if (activeTab === 'MID') {
        if (!['MID_1', 'MID_2', 'INTERNAL_PAPER'].includes(item.resource_type)) {
          return false;
        }
      } else if (activeTab === 'NOTES') {
        if (
          !['UNIT_NOTES', 'SUBJECT_NOTES', 'FACULTY_NOTES', 'STUDENT_NOTES'].includes(
            item.resource_type
          )
        ) {
          return false;
        }
      } else if (activeTab === 'MATERIALS') {
        if (
          !['LAB_MANUAL', 'PPT', 'ASSIGNMENT', 'REFERENCE_MATERIAL'].includes(
            item.resource_type
          )
        ) {
          return false;
        }
      }

      // 2. Search query check (tokenized multi-field matching for real-time mobile search)
      if (searchQuery && searchQuery.trim()) {
        const tokens = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
        const searchableCorpus = [
          item.title || '',
          item.subject?.name || '',
          item.subject?.code || '',
          item.subject_name || '',
          item.resource_type || '',
          (item.resource_type || '').replace(/_/g, ' '),
          (item.ocr_extracted_text || '').slice(0, 1500),
          item.uploader?.full_name || '',
          `sem ${item.semester || ''}`,
          `semester ${item.semester || ''}`,
          `year ${item.year || ''}`,
        ]
          .join(' ')
          .toLowerCase();

        const matchesAllTokens = tokens.every((token) => searchableCorpus.includes(token));
        if (!matchesAllTokens) {
          return false;
        }
      }

      // 3. Subject dropdown filter
      if (subjectFilter && item.subject_id !== subjectFilter) {
        return false;
      }

      // 4. Semester chip filter
      if (selectedSemesterFilter && item.semester !== parseInt(selectedSemesterFilter, 10)) {
        return false;
      }

      return true;
    }
  );

  const bookmarkedIds = new Set(bookmarks.map((b) => b.id || b.resource_id));


  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Banner with Campus Stream & Upload Trigger */}
      <div className="p-4 sm:p-7 rounded-3xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Multi-Tenant Resource Archive</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            Academic Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex flex-wrap items-center gap-2">
            <span>Filtered for:</span>
            <span className="font-bold text-white">
              {selectedCollegeFilter !== 'ALL'
                ? collegesList.find((c) => c.id === selectedCollegeFilter)?.code || 'Campus'
                : college?.code || 'University'}
            </span>
            <span>•</span>
            <span className="text-brand-300 font-bold">
              {selectedDeptFilter === 'ALL'
                ? 'All Departments'
                : departmentsList.find((d) => d.id === selectedDeptFilter)?.name || department?.name || 'Department'}
            </span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Year {year || 1}, Sem {semester || 1}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl neu-pressed text-xs font-semibold text-slate-300 flex items-center space-x-2 select-none">
            <span className="w-2 h-2 rounded-full bg-accent-emerald" />
            <span className="font-extrabold text-brand-300">{college?.code || 'Campus'}</span>
            <span className="text-slate-400 font-medium">Campus Archive</span>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            id="repository-upload-btn"
            className="flex-1 sm:flex-initial px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl neu-button text-xs font-bold text-white shadow-glow flex items-center justify-center space-x-2 border-brand-500/40 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-accent-emerald" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Cross-Department & Cross-Campus Filter Selector Strip */}
      <div className="p-3 sm:p-4 rounded-2xl neu-flat flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Building2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
          <span className="uppercase tracking-wider text-[11px] text-slate-400">Department:</span>
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            type="button"
            onClick={() => setSelectedDeptFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedDeptFilter === 'ALL'
                ? 'neu-pressed border border-brand-500 bg-brand-500/20 text-brand-300 shadow-sm font-black'
                : 'neu-button text-slate-400 hover:text-white'
            }`}
          >
            🌐 All Departments
          </button>

          {(departmentsList.length > 0
            ? departmentsList
            : [
                { id: 'd1000000-0000-0000-0000-000000000001', code: 'CSE', name: 'Computer Science' },
                { id: 'd1000000-0000-0000-0000-000000000005', code: 'AI-DS', name: 'AI & Data Science' },
                { id: 'd1000000-0000-0000-0000-000000000006', code: 'AIML', name: 'AI & Machine Learning' },
                { id: 'd1000000-0000-0000-0000-000000000007', code: 'CYB', name: 'Cybersecurity' },
                { id: 'd1000000-0000-0000-0000-000000000002', code: 'ECE', name: 'Electronics & Communication' },
                { id: 'd1000000-0000-0000-0000-000000000003', code: 'EEE', name: 'Electrical & Electronics' },
                { id: 'd1000000-0000-0000-0000-000000000004', code: 'IT', name: 'Information Technology' },
                { id: 'd1000000-0000-0000-0000-000000000008', code: 'IOT', name: 'Internet of Things' },
              ]
          ).map((dept) => {
            const isSelected = selectedDeptFilter === dept.id;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptFilter(dept.id)}
                title={dept.name}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'neu-pressed border border-accent-cyan bg-cyan-500/20 text-cyan-300 font-black shadow-sm'
                    : 'neu-button text-slate-400 hover:text-white'
                }`}
              >
                {dept.code}
              </button>
            );
          })}
        </div>

        {/* Multi-College Selector for Admins */}
        {user?.role === 'ADMIN' && collegesList.length > 0 && (
          <div className="flex items-center space-x-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-700/50 pt-2 md:pt-0 md:pl-3">
            <School className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <select
              value={selectedCollegeFilter}
              onChange={(e) => setSelectedCollegeFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">🏫 All Campuses</option>
              {collegesList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code || c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tactile Neumorphic Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => dispatch(setActiveTab(tab.id))}
              id={`tab-${tab.id.toLowerCase()}`}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-2 ${
                isActive
                  ? 'neu-tab-active text-white'
                  : 'neu-button text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-brand-500/30 text-brand-300'
                    : 'neu-pressed text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-Filter Search Bar */}
      <div className="p-4 rounded-2xl neu-flat grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            id="repository-search-input"
            value={searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Search paper title, code, or keyword..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            className="w-full pl-10 pr-9 py-2.5 rounded-xl neu-pressed text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => dispatch(setSearchQuery(''))}
              className="absolute right-3 top-2.5 p-1 rounded-lg neu-button text-slate-400 hover:text-white cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Subject Filter Dropdown */}
        <div>
          <select
            value={subjectFilter}
            onChange={(e) => dispatch(setSelectedSubjectFilter(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Curriculum Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.code}] {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Semester Filter Dropdown */}
        <div>
          <select
            value={selectedSemesterFilter}
            onChange={(e) => setSelectedSemesterFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl neu-pressed text-xs text-slate-200 focus:outline-none"
          >
            <option value="">All Semesters (1 to 8)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resources Cards Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.map((res) => (
            <ResourceCard
              key={res.id}
              resource={res}
              isBookmarked={bookmarkedIds.has(res.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-3xl neu-pressed text-center space-y-3">
          <FolderOpen className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Matching Resources</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            We couldn&apos;t find any documents matching your current filters or search term.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {selectedSemesterFilter && (
              <button
                type="button"
                onClick={() => setSelectedSemesterFilter('')}
                className="px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-amber-300 hover:text-white cursor-pointer"
              >
                Search All Semesters
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchQuery(''));
                dispatch(setSelectedSubjectFilter(''));
                setSelectedSemesterFilter('');
              }}
              className="px-4 py-2 rounded-xl neu-button text-xs font-semibold text-brand-300 hover:text-white cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default RepositoryPage;
