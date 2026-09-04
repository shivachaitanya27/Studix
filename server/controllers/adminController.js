import { adminService } from '../services/adminService.js';

export const adminController = {
  // GET /api/v1/admin/moderation/queue
  async getModerationQueue(req, res) {
    try {
      const queue = await adminService.getModerationQueue();
      return res.status(200).json({
        success: true,
        data: queue,
        count: queue.length,
      });
    } catch (error) {
      console.error('Moderation queue error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve moderation queue.',
      });
    }
  },

  // POST /api/v1/admin/moderation/:id/approve
  async approve(req, res) {
    try {
      const approved = await adminService.approveResource(
        req.params.id,
        req.user.id
      );
      return res.status(200).json({
        success: true,
        message: 'Resource verified and approved for public repository.',
        data: approved,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Approval failed.',
      });
    }
  },

  // POST /api/v1/admin/moderation/:id/reject
  async reject(req, res) {
    try {
      const { rejectionReason } = req.body;
      const rejected = await adminService.rejectResource(
        req.params.id,
        req.user.id,
        rejectionReason
      );
      return res.status(200).json({
        success: true,
        message: 'Resource rejected and student notified.',
        data: rejected,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Rejection failed.',
      });
    }
  },

  // GET /api/v1/admin/moderation/logs
  async getAiLogs(req, res) {
    try {
      const logs = await adminService.getAiModerationLogs();
      return res.status(200).json({
        success: true,
        data: logs,
        count: logs.length,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch AI moderation logs.',
      });
    }
  },

  // GET /api/v1/admin/analytics
  async getAnalytics(req, res) {
    try {
      const analytics = await adminService.getPlatformAnalytics();
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch platform analytics.',
      });
    }
  },

  // DELETE /api/v1/admin/resources/:id
  async deleteResource(req, res) {

    try {
      const result = await adminService.deleteResource(
        req.params.id,
        req.user.id
      );
      return res.status(200).json(result);
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to delete resource.',
      });
    }
  },
};

export default adminController;

