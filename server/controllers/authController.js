import fs from 'fs';
import path from 'path';
import { authService } from '../services/authService.js';
import { dataStore } from '../services/dataStore.js';
import { isCollegeEmail } from '../utils/emailValidation.js';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';

export const authController = {


  // POST /api/v1/auth/signup
  async signup(req, res) {
    try {
      const { email, password, fullName, collegeId, departmentId, year, sem } = req.body;
      const result = await authService.signup({
        email,
        password,
        fullName,
        collegeId,
        departmentId,
        year,
        sem
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully!',
        data: result
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create account.'
      });
    }
  },

  // POST /api/v1/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      return res.status(200).json({
        success: true,
        message: 'Login successful!',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        message: error.message || 'Authentication failed.'
      });
    }
  },

  // POST /api/v1/auth/forgot-password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to process password reset request.'
      });
    }
  },

  // GET /api/v1/auth/me
  async getMe(req, res) {
    try {
      const userProfile = await authService.getUserProfile(req.user.id);
      return res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user profile.'
      });
    }
  },

  // PUT /api/v1/auth/profile
  async updateProfile(req, res) {
    try {
      const allowedUpdates = ['full_name', 'avatar_url', 'college_id', 'department_id', 'academic_year', 'semester', 'notifications', 'upload_preferences'];
      const updates = {};
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          updates[key] = req.body[key];
        }
      }

      // Handle convenience aliases for semester and year updates
      if (req.body.year !== undefined && updates.academic_year === undefined) {
        updates.academic_year = parseInt(req.body.year, 10);
      }
      if (req.body.sem !== undefined && updates.semester === undefined) {
        updates.semester = parseInt(req.body.sem, 10);
      }
      if (updates.academic_year !== undefined) {
        updates.academic_year = parseInt(updates.academic_year, 10);
      }
      if (updates.semester !== undefined) {
        updates.semester = parseInt(updates.semester, 10);
      }

      const updatedUser = await authService.updateProfile(req.user.id, updates);
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: updatedUser
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile.'
      });
    }
  },

  // POST /api/v1/auth/avatar
  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Please select an image file to upload.'
        });
      }

      const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      const serverUrl = process.env.SERVER_URL || `${protocol}://${host}`;
      let avatarUrl = `${serverUrl}/uploads/avatars/${req.file.filename}`;

      // 1. If Supabase is configured, upload to Supabase Storage for high-availability cloud access
      if (isSupabaseConfigured && supabaseAdmin && req.file.path) {
        try {
          const fileBuffer = fs.readFileSync(req.file.path);
          const ext = path.extname(req.file.filename) || '.jpg';
          const storagePath = `avatars/${req.user.id}/avatar-${Date.now()}${ext}`;

          const { error: uploadErr } = await supabaseAdmin.storage
            .from('academic-resources')
            .upload(storagePath, fileBuffer, {
              contentType: req.file.mimetype || 'image/jpeg',
              upsert: true,
            });

          if (!uploadErr) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('academic-resources')
              .getPublicUrl(storagePath);

            if (publicUrlData?.publicUrl) {
              avatarUrl = publicUrlData.publicUrl;
            }
          } else {
            console.warn('Supabase storage upload notice:', uploadErr.message);
          }
        } catch (storageErr) {
          console.warn('Avatar cloud storage notice (using local avatar URL):', storageErr.message);
        }
      }

      // 2. Persist avatar URL to user profile & Supabase Auth user_metadata
      if (isSupabaseConfigured && supabaseAdmin && req.user?.id) {
        try {
          await supabaseAdmin.auth.admin.updateUserById(req.user.id, {
            user_metadata: { avatar_url: avatarUrl }
          });
        } catch (authMetaErr) {
          console.warn('Supabase auth metadata update notice:', authMetaErr.message);
        }
      }

      const updatedProfile = await authService.updateProfile(req.user.id, {
        avatar_url: avatarUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Profile photo updated successfully!',
        data: {
          avatar_url: avatarUrl,
          user: updatedProfile
        }
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile photo.'
      });
    }
  },

  // POST /api/v1/auth/change-password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.'
        });
      }

      const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(error.status || 400).json({
        success: false,
        message: error.message || 'Failed to update password.'
      });
    }
  },

  // POST /api/v1/auth/logout
  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  },

  // POST /api/v1/auth/google/callback
  async googleCallback(req, res) {
    try {
      const { user: oauthUser } = req.body;
      if (!oauthUser || !oauthUser.email) {
        return res.status(400).json({
          success: false,
          message: 'Valid Google user information is required.',
        });
      }

      const email = oauthUser.email.toLowerCase().trim();
      // Google OAuth authenticates user directly
      let existingUser = await dataStore.findUserByEmail(email);




      if (!existingUser) {
        const fullName =
          oauthUser.user_metadata?.full_name ||
          oauthUser.user_metadata?.name ||
          email.split('@')[0];
        const avatarUrl =
          oauthUser.user_metadata?.avatar_url ||
          oauthUser.user_metadata?.picture ||
          null;

        existingUser = await dataStore.createUser({
          id: oauthUser.id,
          email,
          fullName,
          role: 'STUDENT',
          avatar_url: avatarUrl,
        });
      }

      const token = authService.generateToken(existingUser);

      return res.status(200).json({
        success: true,
        message: 'Google authentication successful.',
        data: {
          user: existingUser,
          token,
        },
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to authenticate with Google.',
      });
    }
  },
};

export default authController;


