/**
 * Server College Email Validation Utility
 * Exclusively permits Dhanalakshmi Srinivasan University (@dsuniversity.ac.in) accounts
 * and the authorized super administrator (vshivachaitanya7@gmail.com).
 */

export const ALLOWED_UNIVERSITY_DOMAIN = 'dsuniversity.ac.in';
export const SUPER_ADMIN_EMAIL = 'vshivachaitanya7@gmail.com';

export function isCollegeEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }

  const cleanEmail = email.toLowerCase().trim();

  // Allow designated Super Administrator
  if (cleanEmail === SUPER_ADMIN_EMAIL) {
    return true;
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];

  // Strictly enforce @dsuniversity.ac.in
  return domain === ALLOWED_UNIVERSITY_DOMAIN;
}

export function getCollegeEmailErrorMessage() {
  return 'Registration and login are restricted exclusively to official Dhanalakshmi Srinivasan University accounts (@dsuniversity.ac.in).';
}

export function extractDomain(email) {
  if (!email || !email.includes('@')) return '';
  return email.toLowerCase().trim().split('@')[1] || '';
}

/**
 * Infer campus metadata - strictly Dhanalakshmi Srinivasan University (DSU)
 */
export function inferCampusInfo(email) {
  const domain = extractDomain(email);
  if (!domain) return null;

  const cleanEmail = (email || '').toLowerCase().trim();
  const isAllowed = isCollegeEmail(cleanEmail);

  return {
    domain: domain === 'gmail.com' && cleanEmail === SUPER_ADMIN_EMAIL ? ALLOWED_UNIVERSITY_DOMAIN : domain,
    campusName: 'Dhanalakshmi Srinivasan University (DSU Trichy)',
    campusCode: 'DSU',
    isRecognized: isAllowed,
  };
}

