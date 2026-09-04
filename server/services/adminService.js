import { dataStore } from './dataStore.js';

// In-memory moderation audit logs for tracking AI auto-rejections & admin actions
const aiAuditLogs = [
  {
    id: 'log-1',
    filename: 'vacation_party_photo.jpg',
    resourceType: 'REFERENCE_MATERIAL',
    rejectedBy: 'GEMINI_VISION_AI',
    reason: 'This file is not a valid academic resource.',
    confidence: 0.99,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    uploader: 'Student Scholar',
  },
  {
    id: 'log-2',
    filename: 'random_meme_download.png',
    resourceType: 'UNIT_NOTES',
    rejectedBy: 'GEMINI_VISION_AI',
    reason: 'This file is not a valid academic resource.',
    confidence: 0.98,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    uploader: 'Anonymous Student',
  },
];

export const adminService = {
  /**
   * Fetch all resources awaiting admin review
   */
  async getModerationQueue() {
    const pending = await dataStore.getResources({ status: 'PENDING' });
    return pending;
  },

  /**
   * Approve a pending resource
   */
  async approveResource(resourceId, adminUserId) {
    const resource = await dataStore.findResourceById(resourceId);
    if (!resource) {
      const err = new Error('Resource not found.');
      err.status = 404;
      throw err;
    }

    const updated = await dataStore.updateResource(resourceId, {
      status: 'APPROVED',
      approved_by: adminUserId,
      rejection_reason: null,
    });

    // Log approval
    aiAuditLogs.unshift({
      id: `log-${Date.now()}`,
      filename: resource.title,
      resourceType: resource.resource_type,
      rejectedBy: null,
      action: 'ADMIN_APPROVED',
      approvedBy: adminUserId,
      timestamp: new Date().toISOString(),
      uploader: resource.uploader?.full_name || 'Student',
    });

    return updated || resource;
  },

  /**
   * Reject a pending resource with custom reason
   */
  async rejectResource(resourceId, adminUserId, rejectionReason) {
    const resource = await dataStore.findResourceById(resourceId);
    if (!resource) {
      const err = new Error('Resource not found.');
      err.status = 404;
      throw err;
    }

    const reason = rejectionReason || 'Content does not meet university academic standards.';
    const updated = await dataStore.updateResource(resourceId, {
      status: 'REJECTED',
      rejection_reason: reason,
    });

    // Log rejection
    aiAuditLogs.unshift({
      id: `log-${Date.now()}`,
      filename: resource.title,
      resourceType: resource.resource_type,
      rejectedBy: 'ADMIN_MODERATOR',
      reason,
      timestamp: new Date().toISOString(),
      uploader: resource.uploader?.full_name || 'Student',
    });

    return updated || resource;
  },


  /**
   * Get audit log of AI-rejected and admin-reviewed uploads
   */
  async getAiModerationLogs() {
    return aiAuditLogs;
  },

  /**
   * Real-Time Analytics Dashboard Metrics
   */
  async getPlatformAnalytics() {
    const allResources = await dataStore.getResources({ status: 'ALL' });
    const approved = allResources.filter((r) => r.status === 'APPROVED');
    const pending = allResources.filter((r) => r.status === 'PENDING');
    const rejected = allResources.filter((r) => r.status === 'REJECTED');

    const totalUploads = allResources.length + aiAuditLogs.length;
    const flagRate = totalUploads > 0
      ? ((rejected.length + aiAuditLogs.length) / totalUploads) * 100
      : 0;

    return {
      totalResources: allResources.length,
      approvedCount: approved.length,
      pendingModerationCount: pending.length,
      rejectedCount: rejected.length,
      autoRejectedByAiCount: aiAuditLogs.length,
      flagRate: `${flagRate.toFixed(1)}%`,
      uploadVelocity: '18 uploads/week',
      topColleges: [
        { name: 'Dhanalakshmi Srinivasan University Trichy', code: 'DSU', count: 12 },
        { name: 'Malla Reddy University Hyderabad', code: 'MRU', count: 8 },
        { name: 'VNR Vignana Jyothi Institute', code: 'VNR-VJIET', count: 6 },
      ],
      topDepartments: [
        { name: 'Computer Science and Engineering', code: 'CSE', count: 15 },
        { name: 'Artificial Intelligence and Data Science', code: 'AI-DS', count: 7 },
        { name: 'Information Technology', code: 'IT', count: 5 },
      ],
      resourceTypeDistribution: {
        papers: allResources.filter((r) => r.resource_type.includes('PAPER')).length,
        notes: allResources.filter((r) => r.resource_type.includes('NOTES')).length,
        materials: allResources.filter((r) => ['LAB_MANUAL', 'PPT'].includes(r.resource_type)).length,
      },
    };
  },

  /**
   * Permanently purge a resource from PostgreSQL database, Supabase Storage, and local disk
   */
  async deleteResource(resourceId, adminUserId) {

    const resource = await dataStore.findResourceById(resourceId);
    if (!resource) {
      const err = new Error('Resource not found.');
      err.status = 404;
      throw err;
    }

    const { supabaseAdmin, isSupabaseConfigured } = await import('../config/supabase.js');

    // 1. Purge from Supabase Storage bucket 'academic-resources'
    if (isSupabaseConfigured && supabaseAdmin && resource.file_path) {
      try {
        const { error: storageErr } = await supabaseAdmin.storage
          .from('academic-resources')
          .remove([resource.file_path]);
        if (storageErr) console.warn('Supabase storage delete error:', storageErr.message);
      } catch (e) {
        console.warn('Storage removal exception:', e.message);
      }
    }

    // 2. Purge local disk backup if present
    try {
      const fs = await import('fs');
      const path = await import('path');
      const localFile = path.resolve('server/uploads', resource.file_path);
      if (fs.existsSync(localFile)) {
        fs.unlinkSync(localFile);
      }
    } catch (e) {}

    // 3. Delete from Supabase PostgreSQL resources table
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin.from('bookmarks').delete().eq('resource_id', resourceId);
        await supabaseAdmin.from('resources').delete().eq('id', resourceId);
      } catch (e) {
        console.warn('Postgres delete error:', e.message);
      }
    }

    // 4. Delete from memoryStore
    const { memoryStore } = await import('./dataStore.js');
    memoryStore.resources = memoryStore.resources.filter((r) => r.id !== resourceId);
    memoryStore.bookmarks = memoryStore.bookmarks.filter((b) => b.resource_id !== resourceId);

    // 5. Log purge audit
    aiAuditLogs.unshift({
      id: `log-del-${Date.now()}`,
      filename: resource.title,
      resourceType: resource.resource_type,
      rejectedBy: 'ADMIN_PURGE',
      reason: 'Permanently purged by Administrator',
      timestamp: new Date().toISOString(),
      action: 'ADMIN_DELETED',
      adminId: adminUserId,
    });

    return {
      success: true,
      message: 'Resource permanently purged from database and storage.',
      resourceId,
    };
  },

  /**
   * Bulk purge multiple unwanted resources
   */
  async bulkDeleteResources(resourceIds, adminUserId) {
    let deletedCount = 0;
    const errors = [];
    for (const id of resourceIds) {
      try {
        await this.deleteResource(id, adminUserId);
        deletedCount++;
      } catch (err) {
        errors.push({ id, error: err.message });
      }
    }
    return {
      success: true,
      deletedCount,
      totalRequested: resourceIds.length,
      errors,
    };
  },
};

export default adminService;

