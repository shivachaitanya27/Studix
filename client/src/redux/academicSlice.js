import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';
import { STORAGE_KEYS } from '../types/index.js';
import { updateUserState } from './authSlice.js';

// Retrieve persisted academic context from localStorage, sessionStorage, or saved user
const getPersistedContext = () => {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.ACADEMIC_CONTEXT) ||
      sessionStorage.getItem(STORAGE_KEYS.ACADEMIC_CONTEXT);
    if (raw) {
      return JSON.parse(raw);
    }

    // Fallback to saved user data
    const rawUser =
      localStorage.getItem(STORAGE_KEYS.USER_DATA) ||
      sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (rawUser) {
      const user = JSON.parse(rawUser);
      if (user.college || user.department || user.academic_year) {
        return {
          selectedCollege: user.college || null,
          selectedDepartment: user.department || null,
          selectedYear: user.academic_year || null,
          selectedSemester: user.semester || null,
          subjects: [],
          isOnboardingComplete: Boolean(
            user.isOnboardingComplete ||
              (user.college && user.department && user.academic_year && user.semester)
          ),
        };
      }
    }
  } catch (err) {
    console.warn('Could not read academic context from storage');
  }
  return null;
};

const persisted = getPersistedContext();

// Async Thunks
export const fetchColleges = createAsyncThunk(
  'academic/fetchColleges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/academic/colleges');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load colleges');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'academic/fetchDepartments',
  async (collegeId, { rejectWithValue }) => {
    try {
      const url = collegeId ? `/academic/departments/${collegeId}` : '/academic/departments';
      const response = await api.get(url);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load departments');
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  'academic/fetchSubjects',
  async ({ departmentId, year, semester }, { rejectWithValue }) => {
    try {
      const response = await api.get('/academic/subjects', {
        params: { departmentId, year, semester },
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load subjects');
    }
  }
);

export const submitOnboarding = createAsyncThunk(
  'academic/submitOnboarding',
  async ({ collegeId, departmentId, academicYear, semester }, { dispatch, rejectWithValue }) => {
    try {
      const response = await api.post('/academic/onboarding', {
        collegeId,
        departmentId,
        academicYear,
        semester,
      });

      const { user, subjects } = response.data.data;

      // Update auth user profile
      dispatch(updateUserState(user));

      return {
        user,
        subjects,
        selectedCollege: user.college,
        selectedDepartment: user.department,
        selectedYear: user.academic_year,
        selectedSemester: user.semester,
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to complete onboarding');
    }
  }
);

const initialState = {
  colleges: [],
  departments: [],
  subjects: persisted?.subjects || [],
  selectedCollege: persisted?.selectedCollege || null,
  selectedDepartment: persisted?.selectedDepartment || null,
  selectedYear: persisted?.selectedYear || null,
  selectedSemester: persisted?.selectedSemester || null,
  isOnboardingComplete: Boolean(
    persisted?.isOnboardingComplete ||
      (persisted?.selectedCollege &&
        persisted?.selectedDepartment &&
        persisted?.selectedYear &&
        persisted?.selectedSemester)
  ),
  isLoading: false,
  error: null,
};

const persistContext = (state) => {
  try {
    const payload = {
      selectedCollege: state.selectedCollege,
      selectedDepartment: state.selectedDepartment,
      selectedYear: state.selectedYear,
      selectedSemester: state.selectedSemester,
      subjects: state.subjects,
      isOnboardingComplete: state.isOnboardingComplete,
    };
    const json = JSON.stringify(payload);
    localStorage.setItem(STORAGE_KEYS.ACADEMIC_CONTEXT, json);
    sessionStorage.setItem(STORAGE_KEYS.ACADEMIC_CONTEXT, json);
  } catch (e) {
    console.error('Storage sync error', e);
  }
};

const academicSlice = createSlice({
  name: 'academic',
  initialState,
  reducers: {
    setCollege: (state, action) => {
      state.selectedCollege = action.payload;
      state.selectedDepartment = null;
      state.departments = [];
      state.selectedYear = null;
      state.selectedSemester = null;
      state.subjects = [];
      state.isOnboardingComplete = false;
      persistContext(state);
    },
    setDepartment: (state, action) => {
      state.selectedDepartment = action.payload;
      state.subjects = [];
      state.isOnboardingComplete = false;
      persistContext(state);
    },
    setAcademicYear: (state, action) => {
      state.selectedYear = action.payload;
      const minSem = (action.payload - 1) * 2 + 1;
      const maxSem = action.payload * 2;
      if (
        state.selectedSemester &&
        (state.selectedSemester < minSem || state.selectedSemester > maxSem)
      ) {
        state.selectedSemester = minSem;
      }
      persistContext(state);
    },
    setSemester: (state, action) => {
      state.selectedSemester = action.payload;
      persistContext(state);
    },
    resetAcademicContext: (state) => {
      state.selectedCollege = null;
      state.selectedDepartment = null;
      state.selectedYear = null;
      state.selectedSemester = null;
      state.subjects = [];
      state.isOnboardingComplete = false;
      localStorage.removeItem(STORAGE_KEYS.ACADEMIC_CONTEXT);
      sessionStorage.removeItem(STORAGE_KEYS.ACADEMIC_CONTEXT);
    },
    syncFromUser: (state, action) => {
      const user = action.payload;
      if (user && (user.college || user.department)) {
        if (user.college) state.selectedCollege = user.college;
        if (user.department) state.selectedDepartment = user.department;
        if (user.academic_year) state.selectedYear = user.academic_year;
        if (user.semester) state.selectedSemester = user.semester;
        state.isOnboardingComplete = Boolean(
          user.isOnboardingComplete ||
            (user.college && user.department && user.academic_year && user.semester)
        );
        persistContext(state);
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch colleges
    builder
      .addCase(fetchColleges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.colleges = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchColleges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch subjects
    builder
      .addCase(fetchSubjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subjects = Array.isArray(action.payload) ? action.payload : [];
        persistContext(state);
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Submit onboarding
    builder
      .addCase(submitOnboarding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCollege = action.payload.selectedCollege;
        state.selectedDepartment = action.payload.selectedDepartment;
        state.selectedYear = action.payload.selectedYear;
        state.selectedSemester = action.payload.selectedSemester;
        state.subjects = action.payload.subjects;
        state.isOnboardingComplete = true;
        persistContext(state);
      })
      .addCase(submitOnboarding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Automatically sync when user profile is updated or logged in
    builder.addMatcher(
      (action) =>
        action.type === 'auth/loginUser/fulfilled' ||
        action.type === 'auth/fetchCurrentUser/fulfilled' ||
        action.type === 'auth/updateUserState',
      (state, action) => {
        const user = action.payload?.user || action.payload;
        if (user && (user.college || user.department)) {
          if (user.college) state.selectedCollege = user.college;
          if (user.department) state.selectedDepartment = user.department;
          if (user.academic_year) state.selectedYear = user.academic_year;
          if (user.semester) state.selectedSemester = user.semester;
          state.isOnboardingComplete = Boolean(
            user.isOnboardingComplete ||
              (user.college && user.department && user.academic_year && user.semester)
          );
          persistContext(state);
        }
      }
    );
  },
});

export const {
  setCollege,
  setDepartment,
  setAcademicYear,
  setSemester,
  resetAcademicContext,
  syncFromUser,
} = academicSlice.actions;

export const selectAcademic = (state) => state.academic;
export const selectColleges = (state) => Array.isArray(state.academic?.colleges) ? state.academic.colleges : [];
export const selectDepartments = (state) => Array.isArray(state.academic?.departments) ? state.academic.departments : [];
export const selectSubjects = (state) => Array.isArray(state.academic?.subjects) ? state.academic.subjects : [];
export const selectSelectedCollege = (state) => state.academic.selectedCollege;
export const selectSelectedDepartment = (state) => state.academic.selectedDepartment;
export const selectSelectedYear = (state) => state.academic.selectedYear;
export const selectSelectedSemester = (state) => state.academic.selectedSemester;
export const selectIsOnboardingComplete = (state) => state.academic.isOnboardingComplete;
export const selectAcademicLoading = (state) => state.academic.isLoading;

export default academicSlice.reducer;
