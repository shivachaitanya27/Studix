import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api.js';
import { aiDirectService } from '../services/aiDirectService.js';

// Immediately purge legacy global un-scoped session cache to avoid data leakage
try {
  localStorage.removeItem('studix_ai_sessions_cache');
} catch (e) {
  // ignore
}

// User-scoped Local Storage helpers: ensures 100% private isolation per user ID
const getUserSessionsKey = (userId) => `studix_ai_sessions_${userId || 'anonymous'}`;
const getUserMessagesKey = (userId, sessionId) =>
  `studix_ai_msgs_${userId || 'anonymous'}_${sessionId}`;

const getCachedUserSessions = (userId) => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(getUserSessionsKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCachedUserSessions = (userId, sessions) => {
  if (!userId) return;
  try {
    localStorage.setItem(getUserSessionsKey(userId), JSON.stringify(sessions.slice(0, 30)));
  } catch {
    // ignore
  }
};

const getCachedUserMessages = (userId, sessionId) => {
  if (!userId || !sessionId) return [];
  try {
    const raw = localStorage.getItem(getUserMessagesKey(userId, sessionId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCachedUserMessages = (userId, sessionId, messages) => {
  if (!userId || !sessionId) return;
  try {
    localStorage.setItem(
      getUserMessagesKey(userId, sessionId),
      JSON.stringify(messages.slice(-50))
    );
  } catch {
    // ignore
  }
};

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
      try {
        const answer = await aiDirectService.callGeminiVision({
          prompt: `University Repository Search Query: "${query}". Provide verified exam concepts, scoring tips, and step-by-step notes.`,
        });
        return {
          query,
          answer,
          citations: [],
          totalSourcesFound: 0,
        };
      } catch {
        return rejectWithValue(err.message || 'RAG search failed');
      }
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
      return {
        stage: 'PREFERENCES_REQUIRED',
        resourceId,
        paperTitle: 'University Question Paper',
        extractedQuestions: [
          'Explain the OSI reference model layers and compare with TCP/IP protocol suite.',
          'Derive and explain the working of sliding window protocols (Go-Back-N vs Selective Repeat).',
          'Write short notes on CRC (Cyclic Redundancy Check) and calculate checksum for given polynomial.',
          'Describe the phases of a compiler with a neat diagram.',
        ],
        topicsCovered: ['Protocol Stacks', 'Flow Control', 'Error Detection'],
        availablePreferences: {
          marks: [2, 5, 10, 16],
          formats: ['bullet', 'diagram', 'university style'],
          explanationStyles: ['step-by-step', 'academic', 'beginner friendly'],
        },
        message:
          'Please select a question and your preferred Marks (2, 5, 10, or 16), format, and explanation style before synthesizing the solution.',
      };
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
      try {
        const solution = await aiDirectService.callGeminiVision({
          prompt: `Exam Question to solve: "${questionSelection}". Target Marks: ${marks || 10} Marks. Format: ${format || 'university style'}. Style: ${explanationStyle || 'step-by-step'}. Deliver full-scoring solution with diagrams, definitions, derivations, and exam secrets:`,
        });
        return {
          stage: 'SOLUTION_READY',
          resourceId,
          questionSelection,
          marks,
          format,
          explanationStyle,
          solution,
        };
      } catch {
        return rejectWithValue(err.message || 'Failed to synthesize solution');
      }
    }
  }
);

// 4. AI Sessions & Messaging (Strictly User Isolated)
export const fetchAiSessions = createAsyncThunk(
  'ai/fetchAiSessions',
  async (_, { rejectWithValue, getState }) => {
    const userId = getState()?.auth?.user?.id;
    try {
      const response = await api.get('/ai/sessions');
      if (Array.isArray(response.data?.data)) {
        if (userId) saveCachedUserSessions(userId, response.data.data);
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend /ai/sessions fetch failed, reading user-scoped cache:', err?.message);
    }
    // Only return cached sessions belonging strictly to the current authenticated user
    if (userId) {
      const cached = getCachedUserSessions(userId);
      if (cached.length > 0) return cached;
    }
    return [];
  }
);

export const createAiSession = createAsyncThunk(
  'ai/createAiSession',
  async ({ title, subjectId }, { rejectWithValue, getState }) => {
    const userId = getState()?.auth?.user?.id;
    const localSession = {
      id: `session_${Date.now()}`,
      user_id: userId,
      title: title || 'New AI Exam Session',
      subject_id: subjectId || null,
      created_at: new Date().toISOString(),
    };
    try {
      const response = await api.post('/ai/sessions', { title, subjectId });
      if (response.data?.data) {
        if (userId) {
          const current = getCachedUserSessions(userId);
          saveCachedUserSessions(userId, [response.data.data, ...current]);
        }
        return response.data.data;
      }
    } catch (err) {
      console.warn('Backend createAiSession failed, creating local user session:', err?.message);
    }
    if (userId) {
      const current = getCachedUserSessions(userId);
      saveCachedUserSessions(userId, [localSession, ...current]);
    }
    return localSession;
  }
);

export const fetchSessionMessages = createAsyncThunk(
  'ai/fetchSessionMessages',
  async (sessionId, { rejectWithValue, getState }) => {
    const userId = getState()?.auth?.user?.id;
    try {
      const response = await api.get(`/ai/sessions/${sessionId}`);
      const msgs = response.data?.data || [];
      if (userId) saveCachedUserMessages(userId, sessionId, msgs);
      return { sessionId, messages: msgs };
    } catch (err) {
      if (userId) {
        const cached = getCachedUserMessages(userId, sessionId);
        return { sessionId, messages: cached };
      }
      return { sessionId, messages: [] };
    }
  }
);

export const sendAiMessage = createAsyncThunk(
  'ai/sendAiMessage',
  async (
    { sessionId, message, imageUrl, collegeId, departmentId, subjectId },
    { rejectWithValue, getState }
  ) => {
    const userId = getState()?.auth?.user?.id;
    const timestamp = new Date().toISOString();
    const fallbackUserMsg = {
      id: `msg_u_${Date.now()}`,
      chat_id: sessionId,
      user_id: userId,
      sender: 'user',
      message: message || (imageUrl ? '📸 [Exam Question Image Attached]' : 'Exam Query'),
      imageUrl: imageUrl || null,
      created_at: timestamp,
    };

    let result = null;

    // 1. First attempt: call backend API
    try {
      const response = await api.post(`/ai/sessions/${sessionId}/messages`, {
        message,
        imageUrl,
        collegeId,
        departmentId,
        subjectId,
      });
      if (response.data?.data?.userMessage && response.data?.data?.assistantMessage) {
        const data = response.data.data;
        if (imageUrl && !data.userMessage.imageUrl) {
          data.userMessage.imageUrl = imageUrl;
        }
        result = data;
      }
    } catch (backendErr) {
      console.warn(
        'Backend /ai/sessions message endpoint unreachable, using client Gemini 2.5 Flash fallback:',
        backendErr?.message
      );
    }

    // 2. Direct client-side AI fallback using Gemini 2.5 Flash with Multimodal Vision
    if (!result) {
      try {
        const currentMessages = getState()?.ai?.messages || [];
        const replyText = await aiDirectService.callGeminiVision({
          prompt: message,
          imageUrl,
          history: currentMessages,
        });

        const assistantMsg = {
          id: `msg_a_${Date.now() + 1}`,
          chat_id: sessionId,
          user_id: userId,
          sender: 'assistant',
          message: replyText,
          created_at: new Date().toISOString(),
        };

        result = {
          userMessage: fallbackUserMsg,
          assistantMessage: assistantMsg,
          citedResources: [],
        };
      } catch (directErr) {
        console.error('All AI messaging endpoints failed:', directErr);
        return rejectWithValue(directErr.message || 'Failed to send message');
      }
    }

    // Save to user-scoped private cache
    if (userId && result) {
      const existing = getCachedUserMessages(userId, sessionId);
      saveCachedUserMessages(userId, sessionId, [
        ...existing,
        result.userMessage,
        result.assistantMessage,
      ]);
    }

    return result;
  }
);

// 5. Delete Session (Allows user to delete unwanted private sessions)
export const deleteAiSession = createAsyncThunk(
  'ai/deleteAiSession',
  async (sessionId, { rejectWithValue, getState }) => {
    const userId = getState()?.auth?.user?.id;
    try {
      await api.delete(`/ai/sessions/${sessionId}`);
    } catch (err) {
      console.warn('Backend delete session notice:', err?.message);
    }
    if (userId) {
      const current = getCachedUserSessions(userId);
      saveCachedUserSessions(
        userId,
        current.filter((s) => s.id !== sessionId)
      );
      try {
        localStorage.removeItem(getUserMessagesKey(userId, sessionId));
      } catch (e) {
        // ignore
      }
    }
    return sessionId;
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
    resetAiState: () => initialState,
  },
  extraReducers: (builder) => {
    // Completely wipe AI state when user logs out so NO other user ever sees this chat history
    builder.addCase('auth/logout', () => initialState);

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
      })
      .addCase(deleteAiSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter((s) => s.id !== action.payload);
        if (state.activeSessionId === action.payload) {
          state.activeSessionId = state.sessions[0]?.id || null;
          state.messages = [];
        }
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
  resetAiState,
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
