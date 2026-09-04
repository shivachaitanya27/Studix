import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';
import { STORAGE_KEYS } from '../types/index.js';

// Retrieve initial token & user from storage
const savedToken =
  localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) ||
  sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

let savedUser = null;
try {
  const rawUser =
    localStorage.getItem(STORAGE_KEYS.USER_DATA) ||
    sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
  if (rawUser) savedUser = JSON.parse(rawUser);
} catch (e) {
  console.warn('Could not parse saved user data');
}

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, rememberMe = true }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, token };
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/signup', formData);
      const { user, token } = response.data.data;

      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));

      return { user, token };
    } catch (err) {
      return rejectWithValue(err.message || 'Registration failed');
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(err.message || 'Session expired');
    }
  }
);

export const forgotPasswordAction = createAsyncThunk(
  'auth/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data.message;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send reset link');
    }
  }
);

export const uploadUserAvatar = createAsyncThunk(
  'auth/uploadUserAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/auth/avatar', formData);
      const updatedUser = response.data?.data?.user || { ...response.data?.data };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Failed to upload profile photo');
    }
  }
);

export const syncOAuthSession = createAsyncThunk(
  'auth/syncOAuthSession',
  async ({ supabaseSession }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/google/callback', {
        access_token: supabaseSession.access_token,
        id_token: supabaseSession.id_token,
        user: supabaseSession.user,
      });

      const { user, token } = response.data.data;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return { user, token };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || 'Google OAuth sync failed'
      );
    }
  }
);

const initialState = {

  user: savedUser,
  token: savedToken,
  isAuthenticated: Boolean(savedToken),
  isLoading: false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.successMessage = null;

      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      sessionStorage.removeItem(STORAGE_KEYS.ACADEMIC_CONTEXT);
    },
    updateUserState: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch me
    builder

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_DATA);
        sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER_DATA);
      });

    // Google OAuth Sync
    builder
      .addCase(syncOAuthSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(syncOAuthSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(syncOAuthSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Forgot password
    builder
      .addCase(forgotPasswordAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(forgotPasswordAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPasswordAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Upload avatar
    builder
      .addCase(uploadUserAvatar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadUserAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(uploadUserAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

  },
});


export const { clearError, logout, updateUserState } = authSlice.actions;

export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
