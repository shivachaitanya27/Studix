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

  // Send message and get multi-turn AI response with repository grounding & multimodal image analysis
  async sendMessage({ chatId, userId, message, imageUrl, collegeId, departmentId, subjectId }) {
    if ((!message || !message.trim()) && !imageUrl) {
      const err = new Error('Please enter a message or attach an exam image to analyze.');
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

    const effectiveText = (message && message.trim())
      ? message.trim()
      : (imageUrl ? 'Analyze this uploaded question paper / diagram and solve it step-by-step.' : 'Query');

    // 2. Persist user message in history
    const userMessage = await dataStore.createAiMessage({
      chatId,
      userId,
      sender: 'user',
      message: effectiveText,
    });

    // 3. Fetch recent conversation history (excluding the current turn which we construct below)
    const allHistory = await dataStore.getAiMessages(chatId, userId);
    const historyBeforeCurrent = allHistory.filter((h) => h.id !== userMessage.id).slice(-5);

    // 4. Grounding: Fetch repository resources
    const effectiveSubjectId = subjectId || chat.subject_id;
    const matchedResources = await dataStore.getResources({
      collegeId,
      departmentId,
      subjectId: effectiveSubjectId,
      search: effectiveText,
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

    // 5. Construct conversation payload for Gemini (supports text & multimodal image analysis)
    const geminiMessages = [
      {
        role: 'system',
        content:
          'You are Studix Multi-Turn Exam AI Assistant, powered by Gemini 2.0 / 2.5 Flash with multimodal vision capabilities. 🎓✨\n' +
          'Deliver deeply structured, attractive, high-scoring responses tailored for university engineering scholars.\n\n' +
          'MULTIMODAL IMAGE VISION & ANALYSIS INSTRUCTIONS:\n' +
          '- When an image is provided, examine it with supreme detail:\n' +
          '  1. 🔍 **Transcribe / State**: Extract the exact text, question numbers, equations, or circuit/system diagrams shown in the image.\n' +
          '  2. 📐 **Diagram Recognition**: If it is an architecture, ER diagram, state machine, or network topology, identify all nodes, components, and data flows.\n' +
          '  3. ⚡ **Step-by-Step Solution**: Provide the definitive university exam solution with formulas, substitutions, derivations, and final calculated answers.\n' +
          '  4. 🏆 **High-Yield Exam Tips**: Mention common student mistakes and how examiners award step marks.\n\n' +
          'UNIVERSITY EXAM MARK-ALLOCATION RULES:\n' +
          '- 📝 **Part-A (2 Marks Format)**: Concise, high-yield answers: 1 exact definition, core formula/equation, 2 crisp bullet points.\n' +
          '- 🎯 **Part-B (10 / 16 Marks Format)**: Deliver an elaborate, full-score answer with Overview, Mechanism/ASCII Diagram, Comparison Table, and Real-World Engineering Example.\n\n' +
          'FORMATTING RULES:\n' +
          '- Use `***` on its own line to separate major sections.\n' +
          '- 🔑 **Bold Key Technical Terms** and write formulas in clear code/latex style.\n' +
          '- ✨ **Tasteful Emojis**: Use intuitive emojis (🎓, 💡, ⚡, 📌, 🚀, 🔍, 📝, 🎯, ⚙️, 🧠, 📊) to make concepts stand out.',
      },
    ];

    if (contextSnippet) {
      geminiMessages.push({
        role: 'system',
        content: `Relevant Campus Repository Documents:\n${contextSnippet}`,
      });
    }

    // Append prior history turns
    for (const h of historyBeforeCurrent) {
      geminiMessages.push({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.message,
      });
    }

    // Append the active user turn: Multimodal with image_url if image is attached!
    if (imageUrl) {
      geminiMessages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: `[IMAGE INSPECTION & SOLVER REQUEST]\n${effectiveText}\n\nPlease inspect the image carefully, extract the questions/diagrams/equations, and provide the complete high-scoring step-by-step exam solution:`,
          },
          {
            type: 'image_url',
            image_url: {
              url: imageUrl,
            },
          },
        ],
      });
    } else {
      geminiMessages.push({
        role: 'user',
        content: effectiveText,
      });
    }

    let aiReplyText = '';
    try {
      aiReplyText = await ragService.callGemini(geminiMessages, 0.3);
    } catch (err) {
      console.warn('AI chat generation fallback:', err.message);
      aiReplyText =
        `### Studix Academic Assistant\n\nI have reviewed your query regarding "${effectiveText}".\n\n` +
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
