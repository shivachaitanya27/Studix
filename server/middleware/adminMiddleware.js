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
  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Administrator privileges required.',
    });
  }

  next();
};

export default adminMiddleware;
