import { ragService } from '../services/ragService.js';
import { aiChatService } from '../services/aiChatService.js';

export const aiController = {
  // POST /api/v1/ai/repository-search
  async repositorySearch(req, res) {
    try {
      const { query, collegeId, departmentId, subjectId } = req.body;
      const userCollegeId = collegeId || req.user?.college_id;
      const userDeptId = departmentId || req.user?.department_id;

      const result = await ragService.repositoryAwareSearch({
        query,
        collegeId: userCollegeId,
        departmentId: userDeptId,
        subjectId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Repository search error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Repository-aware search failed.',
      });
    }
  },

  // POST /api/v1/ai/paper-analysis
  async paperAnalysis(req, res) {
    try {
      const {
        resourceId,
        questionSelection,
        marks,
        format,
        explanationStyle,
      } = req.body;

      const result = await ragService.analyzePaperAndSolve({
        resourceId,
        questionSelection,
        marks: marks ? parseInt(marks, 10) : 10,
        format,
        explanationStyle,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Paper analysis error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Paper analysis failed.',
      });
    }
  },

  // GET /api/v1/ai/sessions
  async getSessions(req, res) {
    try {
      const sessions = await aiChatService.getUserSessions(req.user.id);
      return res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch AI sessions.',
      });
    }
  },

  // POST /api/v1/ai/sessions
  async createSession(req, res) {
    try {
      const { title, subjectId } = req.body;
      const session = await aiChatService.createSession(
        req.user.id,
        title,
        subjectId
      );
      return res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to initialize AI session.',
      });
    }
  },

  // GET /api/v1/ai/sessions/:id
  async getSessionMessages(req, res) {
    try {
      const messages = await aiChatService.getSessionMessages(
        req.params.id,
        req.user.id
      );
      return res.status(200).json({
        success: true,
        data: messages,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to fetch session messages.',
      });
    }
  },

  // POST /api/v1/ai/sessions/:id/messages
  async sendMessage(req, res) {
    try {
      const { message, collegeId, departmentId, subjectId } = req.body;
      const result = await aiChatService.sendMessage({
        chatId: req.params.id,
        userId: req.user.id,
        message,
        collegeId: collegeId || req.user.college_id,
        departmentId: departmentId || req.user.department_id,
        subjectId,
      });

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to send message.',
      });
    }
  },

  // DELETE /api/v1/ai/sessions/:id
  async deleteSession(req, res) {
    try {
      await aiChatService.deleteSession(req.params.id, req.user.id);
      return res.status(200).json({
        success: true,
        message: 'Session deleted successfully.',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete session.',
      });
    }
  },
};

export default aiController;
