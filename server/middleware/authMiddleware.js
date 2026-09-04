import jwt from 'jsonwebtoken';
import { supabaseClient, isSupabaseConfigured } from '../config/supabase.js';
import { dataStore } from '../services/dataStore.js';

const JWT_SECRET = process.env.JWT_SECRET || 'studix_enterprise_jwt_super_secure_secret_2026';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];

    let userId = null;
    let userEmail = null;

    // First try Supabase Auth verification if configured
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
          userEmail = user.email;
        }
      } catch (err) {
        // Fallback to local token verification
      }
    }

    // If not verified via Supabase, verify with local JWT secret
    if (!userId) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
        userEmail = decoded.email;
      } catch (jwtErr) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired authentication token.'
        });
      }
    }

    // Fetch user details from database
    const user = await dataStore.findUserById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authentication error.'
    });
  }
};

export const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    let userId = null;

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data: { user }, error } = await supabaseClient.auth.getUser(token);
        if (!error && user) {
          userId = user.id;
        }
      } catch (err) {}
    }

    if (!userId) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (jwtErr) {}
    }

    if (userId) {
      const user = await dataStore.findUserById(userId);
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    next();
  } catch (err) {
    next();
  }
};

export default authMiddleware;

