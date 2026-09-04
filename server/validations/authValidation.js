import { body, validationResult } from 'express-validator';
import { isCollegeEmail, getCollegeEmailErrorMessage } from '../utils/emailValidation.js';



// Middleware to handle validation errors
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0]?.msg || 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

export const signupValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .custom((email) => {
      if (!isCollegeEmail(email)) {
        throw new Error(getCollegeEmailErrorMessage());
      }
      return true;
    })
    .normalizeEmail(),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 150 })
    .withMessage('Full name cannot exceed 150 characters'),
  body('collegeId')
    .optional({ nullable: true })
    .isString(),
  body('departmentId')
    .optional({ nullable: true })
    .isString(),
  body('year')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 4 })
    .withMessage('Academic year must be between 1 and 4'),
  body('sem')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  validateRequest
];

export const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

export const forgotPasswordValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  validateRequest
];

export const resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  validateRequest
];

export const onboardingValidation = [
  body('collegeId')
    .optional({ nullable: true }),
  body('departmentId')
    .notEmpty()
    .withMessage('Department selection is required'),
  body('academicYear')
    .isInt({ min: 1, max: 4 })
    .withMessage('Academic year must be between 1 and 4'),
  body('semester')
    .isInt({ min: 1, max: 8 })
    .withMessage('Semester must be between 1 and 8'),
  validateRequest
];
