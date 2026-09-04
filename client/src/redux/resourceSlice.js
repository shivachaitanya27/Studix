import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/resources', { params: filters });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load repository resources');
    }
  }
);

export const uploadResource = createAsyncThunk(
  'resources/uploadResource',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/resources/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data.resource;
    } catch (err) {
      return rejectWithValue(err.message || 'Upload rejected by moderation system');
    }
  }
);

export const toggleBookmark = createAsyncThunk(
  'resources/toggleBookmark',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/resources/${resourceId}/bookmark`);
      return { resourceId, isBookmarked: response.data.data.isBookmarked };
    } catch (err) {
      return rejectWithValue(err.message || 'Bookmark action failed');
    }
  }
);

export const fetchUserBookmarks = createAsyncThunk(
  'resources/fetchUserBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/resources/user/bookmarks');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to load bookmarks');
    }
  }
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (resourceId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/resources/${resourceId}`);
      return { resourceId };
    } catch (err) {
      try {
        await api.delete(`/resources/${resourceId}`);
        return { resourceId };
      } catch (fallbackErr) {
        return rejectWithValue(
          fallbackErr.response?.data?.message || fallbackErr.message || 'Failed to delete resource'
        );
      }
    }
  }
);

const initialState = {
  resources: [],
  bookmarks: [],
  activeTab: 'ALL', // 'ALL' | 'PAPERS' | 'MID' | 'NOTES' | 'MATERIALS' | 'BOOKMARKS'
  searchQuery: '',
  selectedSubjectFilter: '',
  isLoading: false,
  isUploading: false,
  uploadError: null,
  uploadSuccess: false,
  error: null,
};

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedSubjectFilter: (state, action) => {
      state.selectedSubjectFilter = action.payload;
    },
    resetUploadStatus: (state) => {
      state.isUploading = false;
      state.uploadError = null;
      state.uploadSuccess = false;
    },
    removeResource: (state, action) => {
      state.resources = state.resources.filter((r) => r.id !== action.payload);
      state.bookmarks = state.bookmarks.filter(
        (b) => (b.id || b.resource_id) !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch resources
    builder
      .addCase(fetchResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Upload resource
    builder
      .addCase(uploadResource.pending, (state) => {
        state.isUploading = true;
        state.uploadError = null;
        state.uploadSuccess = false;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.isUploading = false;
        state.uploadSuccess = true;
        state.resources.unshift(action.payload);
      })
      .addCase(uploadResource.rejected, (state, action) => {
        state.isUploading = false;
        state.uploadError = action.payload;
      });

    // Toggle bookmark
    builder.addCase(toggleBookmark.fulfilled, (state, action) => {
      const { resourceId, isBookmarked } = action.payload;
      const targetResource = state.resources.find((r) => r.id === resourceId);

      if (!isBookmarked) {
        state.bookmarks = state.bookmarks.filter((b) => (b.id || b.resource_id) !== resourceId);
      } else {
        if (targetResource && !state.bookmarks.some((b) => (b.id || b.resource_id) === resourceId)) {
          state.bookmarks.unshift({ ...targetResource, isBookmarked: true });
        }
      }

      // Update item in resources list
      if (targetResource) {
        targetResource.isBookmarked = isBookmarked;
      }
    });


    // Fetch bookmarks
    builder.addCase(fetchUserBookmarks.fulfilled, (state, action) => {
      state.bookmarks = action.payload;
    });

    // Delete resource
    builder.addCase(deleteResource.fulfilled, (state, action) => {
      state.resources = state.resources.filter((r) => r.id !== action.payload.resourceId);
      state.bookmarks = state.bookmarks.filter(
        (b) => (b.id || b.resource_id) !== action.payload.resourceId
      );
    });
  },
});

export const {
  setActiveTab,
  setSearchQuery,
  setSelectedSubjectFilter,
  resetUploadStatus,
  removeResource,
} = resourceSlice.actions;

export const selectResources = (state) => state.resources.resources;
export const selectBookmarks = (state) => state.resources.bookmarks;
export const selectActiveTab = (state) => state.resources.activeTab;
export const selectResourceLoading = (state) => state.resources.isLoading;
export const selectIsUploading = (state) => state.resources.isUploading;
export const selectUploadError = (state) => state.resources.uploadError;
export const selectUploadSuccess = (state) => state.resources.uploadSuccess;
export const selectSearchQuery = (state) => state.resources.searchQuery;
export const selectSelectedSubjectFilter = (state) =>
  state.resources.selectedSubjectFilter;

export default resourceSlice.reducer;
