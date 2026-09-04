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

  // POST /api/v1/admin/resources/bulk-delete
  async bulkDelete(req, res) {
    try {
      const { resourceIds } = req.body;
      if (!Array.isArray(resourceIds) || resourceIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an array of resourceIds to clean.',
        });
      }
      const result = await adminService.bulkDeleteResources(
        resourceIds,
        req.user.id
      );
      return res.status(200).json({
        success: true,
        message: `Successfully purged ${result.deletedCount} unwanted files from repository.`,
        data: result,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Bulk delete failed.',
      });
    }
  },

  // POST /api/v1/admin/resources/stream-delete
  async deleteStream(req, res) {
    try {
      const { collegeId, departmentId, academicYear, semester } = req.body;
      const result = await adminService.deleteStreamResources(
        { collegeId, departmentId, academicYear, semester },
        req.user.id
      );
      return res.status(200).json({
        success: true,
        message: `Successfully purged ${result.deletedCount} files from the selected stream.`,
        data: result,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to delete stream files.',
      });
    }
  },

  // PATCH /api/v1/admin/resources/:id/stream
  async updateStream(req, res) {
    try {
      const { departmentId, academicYear, semester, title, subjectName } = req.body;
      const updated = await adminService.updateResourceStream(
        req.params.id,
        { departmentId, academicYear, semester, title, subjectName },
        req.user.id
      );
      return res.status(200).json({
        success: true,
        message: 'Resource stream updated successfully.',
        data: updated,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to update resource stream.',
      });
    }
  },
};

export default adminController;


