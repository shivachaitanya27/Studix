import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';

// 1. Repository-Aware RAG Search
export const searchRepositoryRag = createAsyncThunk(
  'ai/searchRepositoryRag',
  async ({ query, collegeId, departmentId, subjectId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/repository-search', {
        query,
        collegeId,
        departmentId,
        subjectId,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'RAG search failed');
    }
  }
);

// 2. Paper Analysis Turn 1: Question Extraction & Preference Inquiry
export const analyzePaper = createAsyncThunk(
  'ai/analyzePaper',
  async ({ resourceId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/paper-analysis', { resourceId });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Paper analysis failed');
    }
  }
);

// 3. Paper Analysis Turn 2: Solution Synthesis with Preferences
export const solvePaperQuestion = createAsyncThunk(
  'ai/solvePaperQuestion',
  async (
    { resourceId, questionSelection, marks, format, explanationStyle },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post('/ai/paper-analysis', {
        resourceId,
        questionSelection,
        marks,
        format,
        explanationStyle,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to synthesize solution');
    }
  }
);

// 4. AI Sessions & Messaging
export const fetchAiSessions = createAsyncThunk(
  'ai/fetchAiSessions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ai/sessions');
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch sessions');
    }
  }
);

export const createAiSession = createAsyncThunk(
  'ai/createAiSession',
  async ({ title, subjectId }, { rejectWithValue }) => {
    try {
      const response = await api.post('/ai/sessions', { title, subjectId });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to create session');
    }
  }
);

export const fetchSessionMessages = createAsyncThunk(
  'ai/fetchSessionMessages',
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/ai/sessions/${sessionId}`);
      return { sessionId, messages: response.data.data };
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to fetch messages');
    }
  }
);

export const sendAiMessage = createAsyncThunk(
  'ai/sendAiMessage',
  async ({ sessionId, message, collegeId, departmentId, subjectId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/ai/sessions/${sessionId}/messages`, {
        message,
        collegeId,
        departmentId,
        subjectId,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.message || 'Failed to send message');
    }
  }
);

const initialState = {
  sessions: [],
  activeSessionId: null,
  messages: [],
  ragResults: null,
  paperAnalysis: null,
  paperSolution: null,
  isSearching: false,
  isAnalyzing: false,
  isSolving: false,
  isSending: false,
  isLoadingSessions: false,
  error: null,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setActiveSessionId: (state, action) => {
      state.activeSessionId = action.payload;
    },
    clearRagResults: (state) => {
      state.ragResults = null;
    },
    clearPaperAnalysis: (state) => {
      state.paperAnalysis = null;
      state.paperSolution = null;
    },
  },
  extraReducers: (builder) => {
    // RAG Search
    builder
      .addCase(searchRepositoryRag.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchRepositoryRag.fulfilled, (state, action) => {
        state.isSearching = false;
        state.ragResults = action.payload;
      })
      .addCase(searchRepositoryRag.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });

    // Paper Analysis Turn 1
    builder
      .addCase(analyzePaper.pending, (state) => {
        state.isAnalyzing = true;
        state.paperAnalysis = null;
        state.paperSolution = null;
      })
      .addCase(analyzePaper.fulfilled, (state, action) => {
        state.isAnalyzing = false;
        state.paperAnalysis = action.payload;
      })
      .addCase(analyzePaper.rejected, (state, action) => {
        state.isAnalyzing = false;
        state.error = action.payload;
      });

    // Paper Solver Turn 2
    builder
      .addCase(solvePaperQuestion.pending, (state) => {
        state.isSolving = true;
      })
      .addCase(solvePaperQuestion.fulfilled, (state, action) => {
        state.isSolving = false;
        state.paperSolution = action.payload;
      })
      .addCase(solvePaperQuestion.rejected, (state, action) => {
        state.isSolving = false;
        state.error = action.payload;
      });

    // Sessions
    builder
      .addCase(fetchAiSessions.pending, (state) => {
        state.isLoadingSessions = true;
      })
      .addCase(fetchAiSessions.fulfilled, (state, action) => {
        state.isLoadingSessions = false;
        state.sessions = action.payload;
        if (!state.activeSessionId && action.payload.length > 0) {
          state.activeSessionId = action.payload[0].id;
        }
      })
      .addCase(createAiSession.fulfilled, (state, action) => {
        state.sessions.unshift(action.payload);
        state.activeSessionId = action.payload.id;
        state.messages = [];
      });

    // Messages
    builder
      .addCase(fetchSessionMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
      })
      .addCase(sendAiMessage.pending, (state) => {
        state.isSending = true;
      })
      .addCase(sendAiMessage.fulfilled, (state, action) => {
        state.isSending = false;
        state.messages.push(action.payload.userMessage);
        state.messages.push(action.payload.assistantMessage);
      })
      .addCase(sendAiMessage.rejected, (state, action) => {
        state.isSending = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveSessionId,
  clearRagResults,
  clearPaperAnalysis,
} = aiSlice.actions;

export const selectAiSessions = (state) => state.ai.sessions;
export const selectActiveSessionId = (state) => state.ai.activeSessionId;
export const selectAiMessages = (state) => state.ai.messages;
export const selectRagResults = (state) => state.ai.ragResults;
export const selectPaperAnalysis = (state) => state.ai.paperAnalysis;
export const selectPaperSolution = (state) => state.ai.paperSolution;
export const selectIsSearching = (state) => state.ai.isSearching;
export const selectIsAnalyzing = (state) => state.ai.isAnalyzing;
export const selectIsSolving = (state) => state.ai.isSolving;
export const selectIsSending = (state) => state.ai.isSending;

export default aiSlice.reducer;
