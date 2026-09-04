import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dataStore } from './dataStore.js';
import { duplicateDetectionService } from './duplicateDetectionService.js';
import { openRouterService } from './openRouterService.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../uploads/academic-resources');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure Supabase Storage bucket exists
const STORAGE_BUCKET = 'academic-resources';
if (isSupabaseConfigured && supabaseAdmin) {
  supabaseAdmin.storage.getBucket(STORAGE_BUCKET).then(({ data, error }) => {
    if (error || !data) {
      supabaseAdmin.storage.createBucket(STORAGE_BUCKET, { public: true }).then(({ error: createErr }) => {
        if (!createErr) console.log(`📦 Supabase Storage bucket [${STORAGE_BUCKET}] initialized successfully.`);
      });
    }
  });
}

export const resourceService = {

  /**
   * Complete Resource Ingestion Pipeline:
   * 1. Ingests file buffer
   * 2. Calculates SHA-256 cryptographic hash & checks for duplicates
   * 3. Calls OpenRouter Gemini inspection to verify academic validity
   * 4. Persists approved resource
   */
  async uploadResource({
    file,
    title,
    resourceType,
    subjectId,
    subjectName,
    collegeId,
    departmentId,
    year,
    semester,
    user,
  }) {

    if (!file || !file.buffer) {
      const err = new Error('File payload is missing.');
      err.status = 400;
      throw err;
    }

    // 1. Calculate SHA-256 hash & enforce duplicate rejection
    const fileHash = duplicateDetectionService.calculateHash(file.buffer);
    const { isDuplicate, existingResource } =
      await duplicateDetectionService.checkDuplicate(fileHash);


    if (isDuplicate) {
      const err = new Error(
        `Duplicate file detected! This document has already been uploaded as "${existingResource.title}".`
      );
      err.status = 409;
      err.existingResource = existingResource;
      throw err;
    }

    // 2. OpenRouter Gemini Inspection & Text Extraction
    const inspection = await openRouterService.inspectDocument({
      buffer: file.buffer,
      filename: file.originalname,
      mimetype: file.mimetype,
      resourceType,
    });

    // 3. Reject non-academic files immediately
    if (!inspection.isApproved) {
      const err = new Error(
        inspection.rejectionReason || 'This file is not a valid academic resource.'
      );
      err.status = 422;
      err.rejectionReason = inspection.rejectionReason;
      throw err;
    }

    // 4. Resolve Academic Context
    let resolvedCollegeId = collegeId || user.college_id;
    let resolvedDeptId = departmentId || user.department_id;
    let resolvedYear = year ? parseInt(year, 10) : user.academic_year;
    let resolvedSem = semester ? parseInt(semester, 10) : user.semester;

    // Resolve subject: By subjectId or user-typed custom subjectName
    let resolvedSubjectId = subjectId || null;

    if (resolvedSubjectId) {
      const subject = await dataStore.getSubjectById(resolvedSubjectId);
      if (subject) {
        resolvedDeptId = resolvedDeptId || subject.department_id;
        resolvedYear = resolvedYear || subject.year;
        resolvedSem = resolvedSem || subject.semester;
      }
    } else if (subjectName && subjectName.trim()) {
      const cleanName = subjectName.trim().replace(/^\[.*?\]\s*/, '');
      const existingSubjects = await dataStore.getSubjects({
        departmentId: resolvedDeptId,
      });
      const match = (existingSubjects || []).find(
        (s) =>
          s.name.toLowerCase() === cleanName.toLowerCase() ||
          cleanName.toLowerCase().includes(s.name.toLowerCase()) ||
          (s.code && cleanName.toLowerCase().includes(s.code.toLowerCase()))
      );

      if (match) {
        resolvedSubjectId = match.id;
        resolvedDeptId = resolvedDeptId || match.department_id;
        resolvedYear = resolvedYear || match.year;
        resolvedSem = resolvedSem || match.semester;
      } else {
        try {
          const generatedCode =
            cleanName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 6) || 'SUB';
          const newSub = await dataStore.createSubject({
            departmentId: resolvedDeptId,
            name: cleanName,
            code: generatedCode,
            year: resolvedYear || 1,
            semester: resolvedSem || 1,
          });
          if (newSub) resolvedSubjectId = newSub.id;
        } catch (subErr) {
          console.warn('Dynamic subject creation fallback:', subErr.message);
        }
      }
    }


    // 5. Persist file: Upload directly to Supabase Storage bucket 'academic-resources'
    const safeBase = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const savedFileName = `${Date.now()}-${safeBase}`;
    const storageFilePath = `${resolvedCollegeId || 'general'}/${resolvedDeptId || 'common'}/${savedFileName}`;

    let fileUrl = null;
    let finalFilePath = storageFilePath;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: uploadData, error: uploadErr } = await supabaseAdmin.storage
          .from(STORAGE_BUCKET)
          .upload(storageFilePath, file.buffer, {
            contentType: file.mimetype || 'application/pdf',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(STORAGE_BUCKET)
            .getPublicUrl(storageFilePath);

          if (publicUrlData?.publicUrl) {
            fileUrl = publicUrlData.publicUrl;
            finalFilePath = storageFilePath;
            console.log(`✅ Uploaded to Supabase Storage: ${fileUrl}`);
          }
        } else if (uploadErr) {
          console.warn('Supabase storage upload error:', uploadErr.message);
        }
      } catch (storageException) {
        console.warn('Supabase storage exception:', storageException.message);
      }
    }

    // Local disk backup
    const fullDiskPath = path.join(uploadsDir, savedFileName);
    await fs.promises.writeFile(fullDiskPath, file.buffer);

    if (!fileUrl) {
      const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
      fileUrl = `${serverUrl}/uploads/academic-resources/${savedFileName}`;
      finalFilePath = `academic-resources/${savedFileName}`;
    }

    // 6. Persist resource in database with full extracted text
    const newResource = await dataStore.createResource({
      college_id: resolvedCollegeId,
      department_id: resolvedDeptId,
      subject_id: resolvedSubjectId,
      year: resolvedYear || 1,

      semester: resolvedSem || 1,
      title: title || file.originalname,
      resource_type: resourceType || 'REFERENCE_MATERIAL',
      file_url: fileUrl,
      file_path: finalFilePath,
      file_hash: fileHash,
      ocr_extracted_text: inspection.extractedText || inspection.metadata?.summary || null,
      uploaded_by: user.id,
      status: 'APPROVED',
      approved_by: user.role === 'ADMIN' ? user.id : null,
      rejection_reason: null,
    });

    return {
      resource: newResource,
      inspection,
    };
  },

  async getResources(filters) {
    return dataStore.getResources(filters);
  },

  async getResourceById(id) {
    const resource = await dataStore.findResourceById(id);
    if (!resource) {
      const err = new Error('Resource not found.');
      err.status = 404;
      throw err;
    }
    return resource;
  },

  async toggleBookmark(userId, resourceId) {
    return dataStore.toggleBookmark(userId, resourceId);
  },

  async getUserBookmarks(userId) {
    return dataStore.getUserBookmarks(userId);
  },
};

export default resourceService;
