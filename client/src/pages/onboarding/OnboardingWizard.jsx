import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  Sparkles,
  Layers,
  Award,
  AlertCircle,
} from 'lucide-react';

import {
  fetchDepartments,
  fetchSubjects,
  setDepartment,
  setAcademicYear,
  setSemester,
  submitOnboarding,
  selectDepartments,
  selectSubjects,
  selectSelectedCollege,
  selectSelectedDepartment,
  selectSelectedYear,
  selectSelectedSemester,
  selectAcademicLoading,
} from '../../redux/academicSlice.js';
import { selectCurrentUser } from '../../redux/authSlice.js';

export const OnboardingWizard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const departments = useSelector(selectDepartments);
  const subjects = useSelector(selectSubjects);
  const selectedCollege = useSelector(selectSelectedCollege) || user?.college;
  const selectedDepartment = useSelector(selectSelectedDepartment) || user?.department;
  const selectedYear = useSelector(selectSelectedYear) || user?.academic_year || 1;
  const selectedSemester = useSelector(selectSelectedSemester) || user?.semester || 1;
  const isLoading = useSelector(selectAcademicLoading);

  // Stepper: 1: Department, 2: Academic Year, 3: Semester (College selection removed!)
  const [currentStep, setCurrentStep] = useState(1);
  const [deptSearch, setDeptSearch] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  // 1. Initial fetch of departments
  useEffect(() => {
    dispatch(fetchDepartments(selectedCollege?.id || user?.college_id || ''));
  }, [dispatch, selectedCollege, user]);

  // 2. Fetch subjects preview whenever department, year, semester are present
  useEffect(() => {
    if (selectedDepartment?.id && selectedYear && selectedSemester) {
      dispatch(
        fetchSubjects({
          departmentId: selectedDepartment.id,
          year: selectedYear,
          semester: selectedSemester,
        })
      );
    }
  }, [selectedDepartment, selectedYear, selectedSemester, dispatch]);

  // Step 1: Handle Department Click
  const handleSelectDepartment = (dept) => {
    dispatch(setDepartment(dept));
    setCurrentStep(2);
  };

  // Step 2: Handle Academic Year Click
  const handleSelectYear = (yearNum) => {
    dispatch(setAcademicYear(yearNum));
    // Default to the first semester of that year
    const defaultSem = (yearNum - 1) * 2 + 1;
    dispatch(setSemester(defaultSem));
    setCurrentStep(3);
  };

  // Step 3: Handle Semester Click
  const handleSelectSemester = (semNum) => {
    dispatch(setSemester(semNum));
  };

  // Final submit handler
  const handleCompleteOnboarding = async () => {
    if (!selectedDepartment || !selectedYear || !selectedSemester) {
      setSubmissionError('Please select Department, Academic Year, and Semester.');
      return;
    }

    setSubmissionError('');
    const result = await dispatch(
      submitOnboarding({
        collegeId: selectedCollege?.id || user?.college_id || selectedDepartment.college_id,
        departmentId: selectedDepartment.id,
        academicYear: selectedYear,
        semester: selectedSemester,
      })
    );

    if (submitOnboarding.fulfilled.match(result)) {
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#5C73F8', '#8B5CF6', '#10B981', '#F59E0B'],
        });
      } catch (e) {}
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } else {
      setSubmissionError(result.payload || 'Failed to save academic context. Please try again.');
    }
  };

  const filteredDepartments = (departments || []).filter(
    (d) =>
      d.name.toLowerCase().includes(deptSearch.toLowerCase()) ||
      d.code.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const steps = [
    { number: 1, title: 'Department', icon: BookOpen },
    { number: 2, title: 'Academic Year', icon: Calendar },
    { number: 3, title: 'Semester', icon: Award },
  ];

  return (
    <div className="max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Academic Curriculum Configuration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          Configure Your Academic Stream
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
          Select your Department, Year, and Semester to personalize your dashboard, study materials, and AI exam assistant.
        </p>

        {selectedCollege && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Institution: <strong className="text-white">{selectedCollege.name} ({selectedCollege.code})</strong>
            </span>
          </div>
        )}
      </div>

      {/* Stepper Progress Indicator */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          const isComplete =
            (step.number === 1 && selectedDepartment) ||
            (step.number === 2 && selectedYear) ||
            (step.number === 3 && selectedSemester);
          const isCurrent = currentStep === step.number;

          return (
            <button
              key={step.number}
              onClick={() => {
                if (step.number === 1) setCurrentStep(1);
                if (step.number === 2 && selectedDepartment) setCurrentStep(2);
                if (step.number === 3 && selectedYear) setCurrentStep(3);
              }}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isCurrent
                  ? 'bg-brand-600/15 border-brand-500 ring-1 ring-brand-500 shadow-glow'
                  : isComplete
                  ? 'bg-dark-card border-accent-emerald/40 hover:border-accent-emerald'
                  : 'bg-dark-card/40 border-dark-border opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isComplete
                      ? 'bg-accent-emerald/20 text-accent-emerald'
                      : isCurrent
                      ? 'bg-brand-500 text-white'
                      : 'bg-dark-base text-slate-400'
                  }`}
                >
                  {isComplete ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                </div>
                <Icon
                  className={`w-4 h-4 ${
                    isCurrent ? 'text-brand-400' : isComplete ? 'text-accent-emerald' : 'text-slate-500'
                  }`}
                />
              </div>
              <p className="text-xs font-bold text-white truncate">{step.title}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {step.number === 1 && (selectedDepartment ? selectedDepartment.code : 'Select Branch')}
                {step.number === 2 && (selectedYear ? `Year ${selectedYear}` : 'Select Year')}
                {step.number === 3 && (selectedSemester ? `Sem ${selectedSemester}` : 'Select Sem')}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Content Area: Step View + Live Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Interactive Step Cards */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-3xl p-6 sm:p-8 relative min-h-[460px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: SELECT DEPARTMENT */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">Select Your Department / Branch</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Choose your engineering or academic branch to load your exact syllabus.
                    </p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      id="dept-search-input"
                      placeholder="Search branch (e.g. CSE)..."
                      value={deptSearch}
                      onChange={(e) => setDeptSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-dark-base border border-dark-border rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 w-full sm:w-52"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[330px] overflow-y-auto pr-1">
                  {filteredDepartments.map((dept) => {
                    const isSelected = selectedDepartment?.id === dept.id;
                    return (
                      <button
                        key={dept.id}
                        id={`dept-card-${dept.code}`}
                        onClick={() => handleSelectDepartment(dept)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                          isSelected
                            ? 'bg-brand-600/15 border-brand-500 shadow-glow'
                            : 'bg-dark-base/70 border-dark-border hover:border-slate-600 hover:bg-dark-base'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-accent-violet/20 text-accent-violet border border-accent-violet/30">
                            {dept.code}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-400" />}
                        </div>
                        <span className="text-xs font-bold text-white line-clamp-2">{dept.name}</span>
                      </button>
                    );
                  })}
                  {filteredDepartments.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-xs text-slate-400">
                      Loading departments...
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: SELECT ACADEMIC YEAR */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Select Academic Year</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Choose your current year of study for {selectedDepartment?.name || 'your department'}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { year: 1, label: '1st Year', badge: 'Freshman', sems: 'Semesters 1 & 2' },
                    { year: 2, label: '2nd Year', badge: 'Sophomore', sems: 'Semesters 3 & 4' },
                    { year: 3, label: '3rd Year', badge: 'Junior', sems: 'Semesters 5 & 6' },
                    { year: 4, label: '4th Year', badge: 'Final Year / Senior', sems: 'Semesters 7 & 8' },
                  ].map((item) => {
                    const isSelected = selectedYear === item.year;
                    return (
                      <button
                        key={item.year}
                        id={`year-card-${item.year}`}
                        onClick={() => handleSelectYear(item.year)}
                        className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'bg-brand-600/15 border-brand-500 shadow-glow'
                            : 'bg-dark-base/70 border-dark-border hover:border-slate-600 hover:bg-dark-base'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl font-black text-white">{item.label}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{item.sems}</p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 3: SELECT SEMESTER */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-xl font-bold text-white">Select Your Active Semester</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    For Year {selectedYear}, standard semesters are{' '}
                    <span className="text-brand-300 font-semibold">
                      Semester {(selectedYear - 1) * 2 + 1} & Semester {selectedYear * 2}
                    </span>
                    .
                  </p>
                </div>

                {/* Semesters 1 through 8 Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                    const belongsToYear =
                      selectedYear &&
                      semNum >= (selectedYear - 1) * 2 + 1 &&
                      semNum <= selectedYear * 2;
                    const isSelected = selectedSemester === semNum;

                    return (
                      <button
                        key={semNum}
                        id={`sem-card-${semNum}`}
                        onClick={() => handleSelectSemester(semNum)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white border-brand-400 shadow-glow font-bold'
                            : belongsToYear
                            ? 'bg-brand-500/10 border-brand-500/40 text-slate-100 hover:bg-brand-500/20'
                            : 'bg-dark-base/40 border-dark-border text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-xs font-semibold block uppercase tracking-wider text-slate-400">
                          Sem
                        </span>
                        <span className="text-2xl font-black block mt-0.5">{semNum}</span>
                        {belongsToYear && (
                          <span className="text-[9px] font-semibold text-brand-300 uppercase tracking-tighter mt-1 block">
                            Active Year
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Enrolled Subjects Preview */}
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 mb-2">
                    <Layers className="w-4 h-4 text-brand-400" />
                    <span>Curriculum Subjects Preview (Sem {selectedSemester})</span>
                  </div>
                  {subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                      {subjects.map((s) => (
                        <div
                          key={s.id}
                          className="px-2.5 py-1 rounded-lg bg-dark-base border border-dark-border text-[11px] text-slate-300 flex items-center space-x-1.5"
                        >
                          <span className="font-semibold text-brand-300">{s.code}</span>
                          <span>•</span>
                          <span className="truncate max-w-[150px]">{s.name}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      Subjects will load upon confirming department and semester.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submission error message */}
          {submissionError && (
            <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submissionError}</span>
            </div>
          )}

          {/* Bottom Stepper Navigation Controls */}
          <div className="mt-8 pt-4 border-t border-dark-border flex items-center justify-between">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-dark-base border border-transparent hover:border-dark-border disabled:opacity-30 disabled:hover:bg-transparent transition-all flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 3 ? (
              <button
                type="button"
                id="onboarding-next-step-btn"
                disabled={
                  (currentStep === 1 && !selectedDepartment) ||
                  (currentStep === 2 && !selectedYear)
                }
                onClick={() => setCurrentStep((prev) => Math.min(prev + 1, 3))}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                id="complete-onboarding-btn"
                disabled={!selectedSemester || isLoading}
                onClick={handleCompleteOnboarding}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-accent-emerald to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save Stream & Open Dashboard</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right 1 Column: Live Context Summary Card */}
        <div className="space-y-4">
          <div className="bg-dark-card border border-dark-border rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-400" />
              <span>Academic Stream Summary</span>
            </h4>

            <div className="space-y-3.5">
              {/* Department Summary */}
              <div className="p-3 rounded-xl bg-dark-base border border-dark-border">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Department
                </span>
                {selectedDepartment ? (
                  <div>
                    <span className="text-xs font-bold text-white block">{selectedDepartment.name}</span>
                    <span className="text-[10px] text-accent-violet font-semibold">
                      {selectedDepartment.code}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 italic">Not selected</span>
                )}
              </div>

              {/* Year Summary */}
              <div className="p-3 rounded-xl bg-dark-base border border-dark-border">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Academic Year
                </span>
                {selectedYear ? (
                  <span className="text-xs font-bold text-white">Year {selectedYear}</span>
                ) : (
                  <span className="text-xs text-slate-500 italic">Not selected</span>
                )}
              </div>

              {/* Semester Summary */}
              <div className="p-3 rounded-xl bg-dark-base border border-dark-border">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Active Semester
                </span>
                {selectedSemester ? (
                  <span className="text-xs font-bold text-accent-emerald">
                    Semester {selectedSemester}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500 italic">Not selected</span>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border text-[11px] text-slate-400">
              <p>
                ✓ Changing your stream updates your dashboard notes, question papers, and AI curriculum instantly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
