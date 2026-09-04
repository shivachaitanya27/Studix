import { resourceService } from '../services/resourceService.js';

export const resourceController = {
  // POST /api/v1/resources/upload
  async upload(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded. Please provide a document file.',
        });
      }

      const {
        title,
        resourceType,
        subjectId,
        subjectName,
        collegeId,
        departmentId,
        year,
        semester,
      } = req.body;

      const result = await resourceService.uploadResource({
        file,
        title,
        resourceType,
        subjectId,
        subjectName,
        collegeId,
        departmentId,
        year,
        semester,
        user: req.user,
      });


      return res.status(201).json({
        success: true,
        message: 'Resource verified by AI & uploaded successfully!',
        data: result,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Failed to upload resource.',
        rejectionReason: error.rejectionReason || null,
        existingResource: error.existingResource || null,
      });
    }
  },

  // GET /api/v1/resources
  async getResources(req, res) {
    try {
      const {
        collegeId,
        departmentId,
        subjectId,
        year,
        semester,
        resourceType,
        search,
        status,
      } = req.query;

      let effectiveCollegeId = collegeId;

      // Strict multi-tenant isolation: Students can only view their own college's resources
      if (req.user && req.user.role === 'STUDENT') {
        if (req.user.college_id) {
          if (collegeId && collegeId !== req.user.college_id) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Cross-college repository access is strictly prohibited.',
            });
          }
          effectiveCollegeId = req.user.college_id;
        }
      }

      // If no college is determined (unauthenticated or unonboarded non-admin), prevent global data leakage
      if (!effectiveCollegeId && req.user?.role !== 'ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
          message: 'Please select a university to view its repository.',
        });
      }

      const resources = await resourceService.getResources({
        collegeId: effectiveCollegeId,
        departmentId,
        subjectId,
        year,
        semester,
        resourceType,
        search,
        status,
      });

      return res.status(200).json({
        success: true,
        data: resources,
        count: resources.length,
      });
    } catch (error) {
      console.error('Fetch resources error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve repository resources.',
      });
    }
  },


  // GET /api/v1/resources/:id
  async getResourceById(req, res) {
    try {
      const resource = await resourceService.getResourceById(req.params.id);
      return res.status(200).json({
        success: true,
        data: resource,
      });
    } catch (error) {
      const status = error.status || 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Resource not found.',
      });
    }
  },

  // POST /api/v1/resources/:id/bookmark
  async toggleBookmark(req, res) {
    try {
      const result = await resourceService.toggleBookmark(
        req.user.id,
        req.params.id
      );
      return res.status(200).json({
        success: true,
        message: result.isBookmarked
          ? 'Resource added to bookmarks!'
          : 'Resource removed from bookmarks.',
        data: result,
      });
    } catch (error) {
      console.error('Bookmark toggle error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to toggle bookmark.',
      });
    }
  },

  // GET /api/v1/resources/user/bookmarks
  async getUserBookmarks(req, res) {
    try {
      const bookmarks = await resourceService.getUserBookmarks(req.user.id);
      return res.status(200).json({
        success: true,
        data: bookmarks,
        count: bookmarks.length,
      });
    } catch (error) {
      console.error('Fetch bookmarks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve bookmarks.',
      });
    }
  },
};

export default resourceController;
