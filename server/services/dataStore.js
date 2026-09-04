import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import {
  initialColleges,
  initialDepartments,
  initialSubjects,
  initialUsers,
  initialResources,
  initialBookmarks,
} from '../data/seedData.js';
import bcrypt from 'bcryptjs';

// In-memory runtime fallback tables
class MemoryStore {
  constructor() {
    this.colleges = [...initialColleges];
    this.departments = [...initialDepartments];
    this.subjects = [...initialSubjects];
    this.users = [...initialUsers];
    this.resources = [...initialResources];
    this.aiChats = [];
    this.aiMessages = [];
    this.bookmarks = [...initialBookmarks];
    this.notifications = [];
  }

  async getColleges() {
    return this.colleges.filter((c) => c.is_active);
  }

  async getCollegeById(id) {
    return this.colleges.find((c) => c.id === id) || null;
  }

  async getDepartments(collegeId) {
    if (!collegeId) return this.departments;
    return this.departments.filter((d) => d.college_id === collegeId);
  }

  async getDepartmentById(id) {
    return this.departments.find((d) => d.id === id) || null;
  }

  async getSubjects({ departmentId, year, semester }) {
    return this.subjects.filter((s) => {
      if (departmentId && s.department_id !== departmentId) return false;
      if (year && s.year !== parseInt(year, 10)) return false;
      if (semester && s.semester !== parseInt(semester, 10)) return false;
      return true;
    });
  }

  async getSubjectById(id) {
    return this.subjects.find((s) => s.id === id) || null;
  }

  async createSubject({ departmentId, name, code, year, semester }) {
    const newSubject = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      department_id: departmentId || null,
      name,
      code: code || name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 6) || 'SUB',
      year: parseInt(year, 10) || 1,
      semester: parseInt(semester, 10) || 1,
      created_at: new Date().toISOString(),
    };
    this.subjects.push(newSubject);
    return newSubject;
  }


  findUserByEmail(email) {
    if (!email) return null;
    const targetEmail = email.toLowerCase().trim();
    return (
      this.users.find((u) => u.email && u.email.toLowerCase().trim() === targetEmail) || null
    );
  }

  findUserById(id) {
    if (!id) return null;
    return this.users.find((u) => u.id === id) || null;
  }


  async createUser(userData) {
    const existing = await this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('User already exists with this email');
    }
    const newUser = {
      id: userData.id || `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email.toLowerCase(),
      password_hash: userData.password
        ? await bcrypt.hash(userData.password, 10)
        : null,
      full_name: userData.fullName || userData.full_name,
      role: userData.role || 'STUDENT',
      college_id: userData.collegeId || userData.college_id || null,
      department_id: userData.departmentId || userData.department_id || null,
      academic_year: userData.academicYear || userData.academic_year || null,
      semester: userData.semester || null,
      created_at: new Date().toISOString(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(id, updates) {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) {
      const newUser = { id, ...updates, updated_at: new Date().toISOString() };
      this.users.push(newUser);
      return newUser;
    }
    this.users[idx] = {
      ...this.users[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.users[idx];
  }


  // --- Phase 2: Resources & Bookmarks ---
  async findResourceByHash(fileHash) {
    return this.resources.find((r) => r.file_hash === fileHash) || null;
  }

  async findResourceById(id) {
    const res = this.resources.find((r) => r.id === id);
    if (!res) return null;
    return this.enrichResource(res);
  }

  enrichResource(r) {
    const subject = this.subjects.find((s) => s.id === r.subject_id);
    const uploader = this.users.find((u) => u.id === r.uploaded_by);
    return {
      ...r,
      subject: subject ? { id: subject.id, name: subject.name, code: subject.code } : null,
      uploader: uploader ? { id: uploader.id, full_name: uploader.full_name } : null,
    };
  }

  async createResource(resourceData) {
    const newRes = {
      id: resourceData.id || `r-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      college_id: resourceData.college_id,
      department_id: resourceData.department_id,
      subject_id: resourceData.subject_id,
      year: parseInt(resourceData.year, 10),
      semester: parseInt(resourceData.semester, 10),
      title: resourceData.title,
      resource_type: resourceData.resource_type,
      file_url: resourceData.file_url,
      file_path: resourceData.file_path,
      file_hash: resourceData.file_hash,
      ocr_extracted_text: resourceData.ocr_extracted_text || null,
      uploaded_by: resourceData.uploaded_by,
      status: resourceData.status || 'APPROVED',
      approved_by: resourceData.approved_by || null,
      rejection_reason: resourceData.rejection_reason || null,
      created_at: new Date().toISOString(),
    };
    this.resources.unshift(newRes);
    return this.enrichResource(newRes);
  }

  async findResourceById(id) {
    const res = this.resources.find((r) => r.id === id);
    return res ? this.enrichResource(res) : null;
  }

  async updateResource(id, updateData) {
    const idx = this.resources.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.resources[idx] = { ...this.resources[idx], ...updateData };
    return this.enrichResource(this.resources[idx]);
  }

  async getResources(filters = {}) {
    let list = this.resources.map((r) => this.enrichResource(r));

    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    } else {
      list = list.filter((r) => r.status === 'APPROVED');
    }

    if (filters.collegeId) {
      list = list.filter((r) => r.college_id === filters.collegeId);
    }
    if (filters.departmentId) {
      list = list.filter((r) => r.department_id === filters.departmentId);
    }
    if (filters.subjectId) {
      list = list.filter((r) => r.subject_id === filters.subjectId);
    }
    if (filters.year) {
      list = list.filter((r) => r.year === parseInt(filters.year, 10));
    }
    if (filters.semester) {
      list = list.filter((r) => r.semester === parseInt(filters.semester, 10));
    }
    if (filters.resourceType) {
      list = list.filter((r) => r.resource_type === filters.resourceType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subject?.name?.toLowerCase().includes(q) ||
          r.subject?.code?.toLowerCase().includes(q) ||
          r.resource_type.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async toggleBookmark(userId, resourceId) {
    const idx = this.bookmarks.findIndex(
      (b) => b.user_id === userId && b.resource_id === resourceId
    );
    if (idx !== -1) {
      this.bookmarks.splice(idx, 1);
      return { isBookmarked: false };
    }
    const newBookmark = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      resource_id: resourceId,
      created_at: new Date().toISOString(),
    };
    this.bookmarks.push(newBookmark);
    return { isBookmarked: true, bookmark: newBookmark };
  }

  async getUserBookmarks(userId) {
    const userBookmarkRecords = this.bookmarks.filter((b) => b.user_id === userId);
    const resourceIds = userBookmarkRecords.map((b) => b.resource_id);
    const bookmarkedResources = this.resources
      .filter((r) => resourceIds.includes(r.id))
      .map((r) => ({
        ...this.enrichResource(r),
        isBookmarked: true,
      }));
    return bookmarkedResources;
  }

  // --- Phase 3: AI Chats & Messages (RLS Enforced) ---
  async createAiChat({ userId, title, subjectId }) {
    const newChat = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      title: title || 'New AI Session',
      subject_id: subjectId || null,
      created_at: new Date().toISOString(),
    };
    this.aiChats.unshift(newChat);
    return newChat;
  }

  async getAiChats(userId) {
    return this.aiChats.filter((c) => c.user_id === userId);
  }

  async getAiChatById(chatId, userId) {
    const chat = this.aiChats.find((c) => c.id === chatId);
    if (!chat) return null;
    if (chat.user_id !== userId) {
      const err = new Error('Access denied to private AI chat session.');
      err.status = 403;
      throw err;
    }
    return chat;
  }

  async deleteAiChat(chatId, userId) {
    const idx = this.aiChats.findIndex(
      (c) => c.id === chatId && c.user_id === userId
    );
    if (idx !== -1) {
      this.aiChats.splice(idx, 1);
      this.aiMessages = this.aiMessages.filter((m) => m.chat_id !== chatId);
      return true;
    }
    return false;
  }

  async createAiMessage({ chatId, userId, sender, message }) {
    await this.getAiChatById(chatId, userId); // verify ownership
    const newMsg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chat_id: chatId,
      sender,
      message,
      created_at: new Date().toISOString(),
    };
    this.aiMessages.push(newMsg);
    return newMsg;
  }

  async getAiMessages(chatId, userId) {
    await this.getAiChatById(chatId, userId); // verify ownership
    return this.aiMessages.filter((m) => m.chat_id === chatId);
  }

  async toggleBookmark(userId, resourceId) {
    const existingIndex = this.bookmarks.findIndex(
      (b) => b.user_id === userId && (b.resource_id === resourceId || b.id === resourceId)
    );
    if (existingIndex !== -1) {
      this.bookmarks.splice(existingIndex, 1);
      return { resourceId, isBookmarked: false };
    } else {
      const newBm = {
        id: `bm-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        user_id: userId,
        resource_id: resourceId,
        created_at: new Date().toISOString(),
      };
      this.bookmarks.unshift(newBm);
      return { resourceId, isBookmarked: true };
    }
  }

  async getUserBookmarks(userId) {
    const userBm = this.bookmarks.filter((b) => b.user_id === userId);
    const bookmarkedResourceIds = new Set(userBm.map((b) => b.resource_id || b.id));
    const fullResources = this.resources.filter((r) => bookmarkedResourceIds.has(r.id));
    return fullResources.map((r) => {
      const subject = this.subjects.find((s) => s.id === r.subject_id);
      return {
        ...r,
        isBookmarked: true,
        subject: subject ? { id: subject.id, name: subject.name, code: subject.code } : null,
      };
    });
  }
}


export const memoryStore = new MemoryStore();

// Unified Data Access Layer
export const dataStore = {
  // Colleges
  async getColleges() {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('colleges')
          .select('*')
          .eq('is_active', true)
          .order('name');
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local data store for colleges:', err.message);
      }
    }
    return memoryStore.getColleges();
  },

  async getCollegeById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('colleges')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local data store for college details');
      }
    }
    return memoryStore.getCollegeById(id);
  },

  // Departments
  async getDepartments(collegeId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('departments').select('*').order('name');
        if (collegeId) query = query.eq('college_id', collegeId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local data store for departments:', err.message);
      }
    }
    return memoryStore.getDepartments(collegeId);
  },

  async getDepartmentById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('departments')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local data store for department details');
      }
    }
    return memoryStore.getDepartmentById(id);
  },

  // Subjects
  async getSubjects(filters) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin.from('subjects').select('*').order('name');
        if (filters.departmentId) query = query.eq('department_id', filters.departmentId);
        if (filters.year) query = query.eq('year', parseInt(filters.year, 10));
        if (filters.semester) query = query.eq('semester', parseInt(filters.semester, 10));
        const { data, error } = await query;
        if (!error && data && data.length > 0) return data;
      } catch (err) {
        console.warn('Falling back to local data store for subjects:', err.message);
      }
    }
    return memoryStore.getSubjects(filters);
  },

  async getSubjectById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('subjects')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('Falling back to local data store for subject details');
      }
    }
    return memoryStore.getSubjectById(id);
  },

  async createSubject(subjectData) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('subjects')
          .insert([
            {
              department_id: subjectData.departmentId || subjectData.department_id || null,
              name: subjectData.name,
              code:
                subjectData.code ||
                subjectData.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 6) ||
                'SUB',
              year: parseInt(subjectData.year, 10) || 1,
              semester: parseInt(subjectData.semester, 10) || 1,
            },
          ])
          .select()
          .single();
        if (!error && data) {
          memoryStore.subjects.push(data);
          return data;
        }
      } catch (err) {
        console.warn('Falling back to local data store for creating subject:', err.message);
      }
    }
    return memoryStore.createSubject(subjectData);
  },


  // Users
  async findUserByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();
    let pgUser = null;
    let authUser = null;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .select(`
            *,
            colleges:college_id (id, name, code, domain),
            departments:department_id (id, name, code)
          `)
          .eq('email', cleanEmail)
          .maybeSingle();
        if (!error && data) pgUser = data;

        const userId = pgUser?.id;
        if (userId) {
          const authResult = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }));
          if (authResult?.data?.user) authUser = authResult.data.user;
        }
      } catch (err) {
        console.warn('Falling back to local store to find user by email:', err.message);
      }
    }
    const memUser = memoryStore.findUserByEmail(cleanEmail);
    if (!pgUser && !memUser && !authUser) return null;

    const resolvedAvatar =
      pgUser?.avatar_url ||
      authUser?.user_metadata?.avatar_url ||
      memUser?.avatar_url ||
      null;

    const userObj = {
      ...(memUser || {}),
      ...(pgUser || {}),
      avatar_url: resolvedAvatar,
    };

    if (memUser && resolvedAvatar && !memUser.avatar_url) {
      memUser.avatar_url = resolvedAvatar;
    }

    return userObj;
  },

  async findUserById(id) {
    if (!id) return null;
    let pgUser = null;
    let authUser = null;

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const [pgResult, authResult] = await Promise.all([
          supabaseAdmin
            .from('users')
            .select(`
              *,
              colleges:college_id (id, name, code, domain),
              departments:department_id (id, name, code)
            `)
            .eq('id', id)
            .maybeSingle(),
          supabaseAdmin.auth.admin.getUserById(id).catch(() => ({ data: null })),
        ]);
        if (!pgResult.error && pgResult.data) pgUser = pgResult.data;
        if (authResult?.data?.user) authUser = authResult.data.user;
      } catch (err) {
        console.warn('Falling back to local store to find user by id:', err.message);
      }
    }
    const memUser = memoryStore.findUserById(id);
    if (!pgUser && !memUser && !authUser) return null;

    const resolvedAvatar =
      pgUser?.avatar_url ||
      authUser?.user_metadata?.avatar_url ||
      memUser?.avatar_url ||
      null;

    const userObj = {
      ...(memUser || {}),
      ...(pgUser || {}),
      avatar_url: resolvedAvatar,
    };

    if (memUser && resolvedAvatar && !memUser.avatar_url) {
      memUser.avatar_url = resolvedAvatar;
    }

    return userObj;
  },


  async createUser(userData) {
    const userId = userData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    const pgRecord = {
      id: userId,
      email: userData.email.toLowerCase(),
      full_name: userData.fullName || userData.full_name || 'Student',
      role: userData.role || 'STUDENT',
      college_id: userData.collegeId || userData.college_id || null,
      department_id: userData.departmentId || userData.department_id || null,
      academic_year: userData.academicYear || userData.academic_year || null,
      semester: userData.semester || null,
    };

    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert([pgRecord])
          .select()
          .maybeSingle();
        if (!error && data) {
          try {
            await memoryStore.createUser({ ...userData, id: data.id });
          } catch (e) {
            // Already cached
          }
          return data;
        }
      } catch (err) {
        console.warn('Could not insert to Supabase users table, persisting locally:', err.message);
      }
    }
    return memoryStore.createUser({ ...userData, id: userId });
  },


  async updateUser(id, updates) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        if (updates.avatar_url) {
          try {
            await supabaseAdmin.auth.admin.updateUserById(id, {
              user_metadata: { avatar_url: updates.avatar_url }
            });
          } catch (e) {
            console.warn('Supabase Auth metadata update warning:', e.message);
          }
        }

        // Try updating Supabase users table with all updates
        const { error: pgErr } = await supabaseAdmin
          .from('users')
          .update(updates)
          .eq('id', id);

        // If error occurred (e.g. column avatar_url does not exist in users table), retry without avatar_url
        if (pgErr && updates.avatar_url) {
          const { avatar_url, ...pgUpdates } = updates;
          if (Object.keys(pgUpdates).length > 0) {
            await supabaseAdmin
              .from('users')
              .update(pgUpdates)
              .eq('id', id);
          }
        }
      } catch (err) {
        console.warn('Could not update in Supabase, updating locally:', err.message);
      }
    }
    return memoryStore.updateUser(id, updates);
  },


  // --- Phase 2: Resources & Bookmarks ---
  async findResourceByHash(fileHash) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('resources')
          .select('*')
          .eq('file_hash', fileHash)
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall back to memory
      }
    }
    return memoryStore.findResourceByHash(fileHash);
  },

  async findResourceById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('resources')
          .select(`
            *,
            subject:subject_id (id, name, code),
            uploader:uploaded_by (id, full_name)
          `)
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.findResourceById(id);
  },

  async createResource(resourceData) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let validUploadedBy = null;
        if (resourceData.uploaded_by) {
          const { data: userRow } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('id', resourceData.uploaded_by)
            .maybeSingle();
          if (userRow) validUploadedBy = userRow.id;
        }

        let validSubjectId = null;
        if (resourceData.subject_id) {
          const { data: subRow } = await supabaseAdmin
            .from('subjects')
            .select('id')
            .eq('id', resourceData.subject_id)
            .maybeSingle();
          if (subRow) validSubjectId = subRow.id;
        }

        const pgPayload = {
          ...resourceData,
          id: (resourceData.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resourceData.id))
            ? resourceData.id
            : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : undefined),
          uploaded_by: validUploadedBy,
          subject_id: validSubjectId,
          approved_by: validUploadedBy && resourceData.approved_by ? validUploadedBy : null,
        };

        const { data, error } = await supabaseAdmin
          .from('resources')
          .insert([pgPayload])
          .select(`
            *,
            subject:subject_id (id, name, code),
            uploader:uploaded_by (id, full_name)
          `)
          .maybeSingle();

        if (!error && data) {
          try {
            await memoryStore.createResource(data);
          } catch (e) {}
          return data;
        }
      } catch (err) {
        console.warn('Could not insert to Supabase resources table, persisting locally:', err.message);
      }
    }
    return memoryStore.createResource(resourceData);
  },

  async getResources(filters = {}) {
    let supabaseResources = [];
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        let query = supabaseAdmin
          .from('resources')
          .select(`
            *,
            subject:subject_id (id, name, code),
            uploader:uploaded_by (id, full_name)
          `)
          .order('created_at', { ascending: false });

        if (filters.status) query = query.eq('status', filters.status);
        else query = query.eq('status', 'APPROVED');

        if (filters.collegeId) query = query.eq('college_id', filters.collegeId);
        if (filters.departmentId) query = query.eq('department_id', filters.departmentId);
        if (filters.subjectId) query = query.eq('subject_id', filters.subjectId);
        if (filters.year) query = query.eq('year', parseInt(filters.year, 10));
        if (filters.semester) query = query.eq('semester', parseInt(filters.semester, 10));
        if (filters.resourceType) query = query.eq('resource_type', filters.resourceType);

        const { data, error } = await query;
        if (!error && data && Array.isArray(data)) {
          supabaseResources = data;
        }
      } catch (err) {
        console.warn('Falling back to local data store for resources:', err.message);
      }
    }

    const localResources = await memoryStore.getResources(filters);
    const combined = [...supabaseResources];
    for (const item of localResources) {
      if (!combined.some((c) => c.id === item.id || (c.title && c.title === item.title))) {
        combined.push(item);
      }
    }

    return combined;
  },


  async findResourceById(id) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('resources')
          .select(`
            *,
            subject:subject_id (id, name, code),
            uploader:uploaded_by (id, full_name)
          `)
          .eq('id', id)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.findResourceById(id);
  },

  async updateResource(id, updateData) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('resources')
          .update(updateData)
          .eq('id', id)
          .select(`
            *,
            subject:subject_id (id, name, code),
            uploader:uploaded_by (id, full_name)
          `)
          .maybeSingle();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.updateResource(id, updateData);
  },


  async toggleBookmark(userId, resourceId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: existing, error: selectErr } = await supabaseAdmin
          .from('bookmarks')
          .select('*')
          .eq('user_id', userId)
          .eq('resource_id', resourceId)
          .maybeSingle();

        if (!selectErr) {
          if (existing) {
            await supabaseAdmin
              .from('bookmarks')
              .delete()
              .eq('id', existing.id);
            return { isBookmarked: false };
          } else {
            const { error: insErr } = await supabaseAdmin
              .from('bookmarks')
              .insert([{ user_id: userId, resource_id: resourceId }]);
            if (!insErr) {
              return { isBookmarked: true };
            }
          }
        }
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.toggleBookmark(userId, resourceId);
  },

  async getUserBookmarks(userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('bookmarks')
          .select(`
            *,
            resource:resource_id (
              *,
              subject:subject_id (id, name, code),
              uploader:uploaded_by (id, full_name)
            )
          `)
          .eq('user_id', userId);

        if (!error && data && data.length > 0) {
          return data.map((b) => ({ ...b.resource, isBookmarked: true }));
        }
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.getUserBookmarks(userId);
  },


  // --- Phase 3: AI Chats & Messages (RLS Enforced) ---
  async createAiChat({ userId, title, subjectId }) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('ai_chats')
          .insert([{ user_id: userId, title, subject_id: subjectId }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.createAiChat({ userId, title, subjectId });
  },

  async getAiChats(userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('ai_chats')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.getAiChats(userId);
  },

  async getAiChatById(chatId, userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('ai_chats')
          .select('*')
          .eq('id', chatId)
          .eq('user_id', userId)
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.getAiChatById(chatId, userId);
  },

  async deleteAiChat(chatId, userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('ai_chats')
          .delete()
          .eq('id', chatId)
          .eq('user_id', userId);
        return true;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.deleteAiChat(chatId, userId);
  },

  async createAiMessage({ chatId, userId, sender, message }) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        // RLS will check ownership
        const { data, error } = await supabaseAdmin
          .from('ai_messages')
          .insert([{ chat_id: chatId, sender, message }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.createAiMessage({ chatId, userId, sender, message });
  },

  async getAiMessages(chatId, userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('ai_messages')
          .select('*')
          .eq('chat_id', chatId)
          .order('created_at', { ascending: true });
        if (!error && data) return data;
      } catch (err) {
        // Fall back
      }
    }
    return memoryStore.getAiMessages(chatId, userId);
  },

  // Bookmarks
  async toggleBookmark(userId, resourceId) {
    let isBookmarked = false;
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data: existing } = await supabaseAdmin
          .from('bookmarks')
          .select('id')
          .eq('user_id', userId)
          .eq('resource_id', resourceId)
          .maybeSingle();

        if (existing) {
          await supabaseAdmin
            .from('bookmarks')
            .delete()
            .eq('user_id', userId)
            .eq('resource_id', resourceId);
          isBookmarked = false;
        } else {
          await supabaseAdmin
            .from('bookmarks')
            .insert({ user_id: userId, resource_id: resourceId });
          isBookmarked = true;
        }
      } catch (err) {
        console.warn('Supabase toggleBookmark notice:', err.message);
      }
    }
    // Also sync local memoryStore
    const memResult = await memoryStore.toggleBookmark(userId, resourceId);
    return { resourceId, isBookmarked: isBookmarked !== undefined ? isBookmarked : memResult.isBookmarked };
  },

  async getUserBookmarks(userId) {
    if (isSupabaseConfigured && supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from('bookmarks')
          .select(`
            resource_id,
            resources:resource_id (
              *,
              colleges:college_id (id, name, code),
              departments:department_id (id, name, code),
              subjects:subject_id (id, name, code)
            )
          `)
          .eq('user_id', userId);

        if (!error && data && data.length > 0) {
          return data
            .filter((b) => b.resources)
            .map((b) => ({
              ...b.resources,
              isBookmarked: true,
              subject: b.resources.subjects,
              college: b.resources.colleges,
              department: b.resources.departments,
            }));
        }
      } catch (err) {
        console.warn('Supabase getUserBookmarks notice:', err.message);
      }
    }
    return memoryStore.getUserBookmarks(userId);
  },
};


