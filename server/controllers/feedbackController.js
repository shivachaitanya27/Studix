import { dataStore } from '../services/dataStore.js';

export const feedbackController = {
  // POST /api/v1/feedback
  async submitFeedback(req, res) {
    try {
      const user = req.user || null;
      const { rating, tags, comment, collegeName, departmentName, guestName, guestEmail } = req.body;

      if (!rating || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid rating from 1 to 5 stars.',
        });
      }

      const feedback = await dataStore.createFeedback({
        userId: user?.id || null,
        userName: user?.full_name || guestName || 'First-time Student',
        userEmail: user?.email || guestEmail || '',
        collegeName: collegeName || user?.colleges?.name || user?.college?.name || '',
        departmentName: departmentName || user?.departments?.name || user?.department?.name || '',
        rating: Number(rating),
        tags: Array.isArray(tags) ? tags : [],
        comment: (comment || '').trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Thank you for your valuable feedback! It helps us improve Studix.',
        data: feedback,
      });
    } catch (error) {
      console.error('Submit feedback error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to record feedback.',
      });
    }
  },

  // GET /api/v1/feedback/admin (Admin only)
  async getAdminFeedbacks(req, res) {
    try {
      const feedbacks = await dataStore.getAllFeedbacks();

      const total = feedbacks.length;
      const sum = feedbacks.reduce((acc, f) => acc + (Number(f.rating) || 0), 0);
      const avgRating = total > 0 ? (sum / total).toFixed(1) : 0;

      // Rating distribution
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      const tagCounts = {};

      feedbacks.forEach((f) => {
        const r = Math.round(Number(f.rating) || 5);
        if (distribution[r] !== undefined) distribution[r]++;
        if (Array.isArray(f.tags)) {
          f.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            total,
            avgRating: Number(avgRating),
            distribution,
            popularTags: Object.entries(tagCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([tag, count]) => ({ tag, count })),
          },
          feedbacks,
        },
      });
    } catch (error) {
      console.error('Get admin feedbacks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve feedback data.',
      });
    }
  },
};
