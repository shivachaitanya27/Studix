import { academicService } from '../services/academicService.js';

export const academicController = {
  // GET /api/v1/academic/colleges
  async getColleges(req, res) {
    try {
      const colleges = await academicService.getColleges();
      return res.status(200).json({
        success: true,
        data: colleges
      });
    } catch (error) {
      console.error('Fetch colleges error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve colleges list.'
      });
    }
  },

  // GET /api/v1/academic/departments/:collegeId?
  async getDepartments(req, res) {
    try {
      const collegeId = req.params.collegeId || req.query.collegeId || null;
      const departments = await academicService.getDepartments(collegeId);
      return res.status(200).json({
        success: true,
        data: departments
      });
    } catch (error) {
      console.error('Fetch departments error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve departments list.'
      });
    }
  },

  // GET /api/v1/academic/subjects
  async getSubjects(req, res) {
    try {
      const { departmentId, year, semester } = req.query;
      const subjects = await academicService.getSubjects({
        departmentId,
        year,
        semester
      });

      return res.status(200).json({
        success: true,
        data: subjects
      });
    } catch (error) {
      console.error('Fetch subjects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve subjects list.'
      });
    }
  },

  // POST /api/v1/academic/onboarding
  async saveOnboarding(req, res) {
    try {
      const { collegeId, departmentId, academicYear, semester } = req.body;
      const userId = req.user.id;

      const result = await academicService.saveOnboarding({
        userId,
        collegeId,
        departmentId,
        academicYear,
        semester
      });

      return res.status(200).json({
        success: true,
        message: 'Academic context successfully configured!',
        data: result
      });
    } catch (error) {
      console.error('Onboarding save error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to save academic context.'
      });
    }
  }
};

export default academicController;
