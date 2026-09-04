/**
 * Admin Role-Based Access Control Middleware
 * Restricts endpoint access strictly to users with role ADMIN or SUPER_ADMIN
 */
export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in.',
    });
  }

  const role = req.user.role?.toUpperCase();
  const email = (req.user.email || '').toLowerCase().trim();
  const AUTHORIZED_ADMIN_EMAIL = 'vshivachaitanya7@gmail.com';

  if ((role !== 'ADMIN' && role !== 'SUPER_ADMIN') || email !== AUTHORIZED_ADMIN_EMAIL) {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Only authorized administrator (vshivachaitanya7@gmail.com) can access the admin panel.',
    });
  }

  next();
};

export default adminMiddleware;
