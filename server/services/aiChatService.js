import { dataStore } from './dataStore.js';
import { ragService } from './ragService.js';

export const aiChatService = {
  // Create private chat session
  async createSession(userId, title, subjectId) {
    return dataStore.createAiChat({
      userId,
      title: title || 'New AI Exam Session',
      subjectId,
    });
  },

  // Get all chat sessions for user (RLS enforced)
  async getUserSessions(userId) {
    return dataStore.getAiChats(userId);
  },

  // Get messages for a session (RLS enforced)
  async getSessionMessages(chatId, userId) {
    const chat = await dataStore.getAiChatById(chatId, userId);
    if (!chat) {
      const err = new Error('Chat session not found.');
      err.status = 404;
      throw err;
    }
    return dataStore.getAiMessages(chatId, userId);
  },

  // Delete chat session
  async deleteSession(chatId, userId) {
    return dataStore.deleteAiChat(chatId, userId);
  },

  // Send message and get multi-turn AI response with repository grounding
  async sendMessage({ chatId, userId, message, collegeId, departmentId, subjectId }) {
    if (!message || !message.trim()) {
      const err = new Error('Message cannot be empty.');
      err.status = 400;
      throw err;
    }

    // 1. Verify ownership
    const chat = await dataStore.getAiChatById(chatId, userId);
    if (!chat) {
      const err = new Error('Session not found or access denied.');
      err.status = 404;
      throw err;
    }

    // 2. Persist user message
    const userMessage = await dataStore.createAiMessage({
      chatId,
      userId,
      sender: 'user',
      message: message.trim(),
    });

    // 3. Fetch recent conversation history
    const history = await dataStore.getAiMessages(chatId, userId);

    // 4. Grounding: Fetch repository resources
    const effectiveSubjectId = subjectId || chat.subject_id;
    const matchedResources = await dataStore.getResources({
      collegeId,
      departmentId,
      subjectId: effectiveSubjectId,
      search: message,
    });

    let contextSnippet = '';
    if (matchedResources && matchedResources.length > 0) {
      contextSnippet = matchedResources
        .slice(0, 3)
        .map(
          (r, i) =>
            `[Source ${i + 1}: ${r.title}]: ${
              r.ocr_extracted_text || 'Core exam material'
            }`
        )
        .join('\n\n');
    }

    // 5. Construct conversation payload for Gemini
    const geminiMessages = [
      {
        role: 'system',
        content:
          'You are Studix Multi-Turn Exam AI Assistant, powered by Gemini 2.0 Flash. 🎓✨\n' +
          'Deliver deeply structured, attractive, high-scoring responses tailored for university engineering scholars.\n\n' +
          'UNIVERSITY EXAM MARK-ALLOCATION RULES:\n' +
          '- 📝 **Part-A (2 Marks Format)**: Provide concise, high-yield answers: 1 exact textbook definition, core formula/equation (if applicable), followed by 2 crisp bullet points. Maximum 4-6 lines so students score 2/2 in minimum time.\n' +
          '- 🎯 **Part-B (10 / 16 Marks Format)**: Deliver an elaborate, full-score answer with:\n' +
          '  1. 📌 **Executive Overview & Definition**\n' +
          '  2. ⚙️ **Detailed Mechanism / Architecture with ASCII or Tabular Diagram**\n' +
          '  3. 📊 **Key Characteristics or Comparison Table**\n' +
          '  4. 💡 **Numerical/Real-World Example or Step-by-Step Derivation**\n' +
          '  5. 🏆 **High-Scoring Examiner Tips**\n\n' +
          'FORMATTING RULES:\n' +
          '- Use `***` (three asterisks on their own line) to separate major sections. The frontend will render this as an attractive highlighted banner with sparkles!\n' +
          '- 🔑 **Bold Key Technical Terms** and write formulas in clear code/latex style.\n' +
          '- ✨ **Tasteful Emojis**: Use intuitive emojis (🎓, 💡, ⚡, 📌, 🚀, 🔍, 📝, 🎯, ⚙️, 🧠, 📊) generously to make concepts stand out.\n' +
          '- 📚 Ground answers in campus repository context whenever available.',
      },
    ];

    if (contextSnippet) {
      geminiMessages.push({
        role: 'system',
        content: `Relevant Campus Repository Documents:\n${contextSnippet}`,
      });
    }

    // Append last 6 turns of history
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      geminiMessages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message,
      });
    }

    let aiReplyText = '';
    try {
      aiReplyText = await ragService.callGemini(geminiMessages, 0.3);
    } catch (err) {
      console.warn('AI chat generation fallback:', err.message);
      aiReplyText =
        `### Studix Academic Assistant\n\nI have reviewed your query regarding "${message}".\n\n` +
        `**Key Concepts**:\n` +
        `1. Review university past papers for this topic under **Repository -> Previous Papers**.\n` +
        `2. For high-mark questions (10/16 marks), be sure to include definitions, standard block diagrams, and comparative analysis.`;
    }

    // 6. Persist assistant message
    const assistantMessage = await dataStore.createAiMessage({
      chatId,
      userId,
      sender: 'assistant',
      message: aiReplyText,
    });

    return {
      userMessage,
      assistantMessage,
      citedResources: (matchedResources || []).slice(0, 3),
    };
  },
};

export default aiChatService;
