/**
 * Client College Email Validation Utility
 * Enforces institutional email addresses and rejects personal consumer webmails.
 */

const BLOCKED_PERSONAL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'zoho.com',
  'mail.com',
  'gmx.com',
  'yandex.com',
]);

export function isCollegeEmail(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }

  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];

  // 1. Explicitly reject popular personal email services
  if (BLOCKED_PERSONAL_DOMAINS.has(domain)) {
    return false;
  }

  // 2. Validate educational / institutional top-level and second-level domains
  const validEduPatterns = [
    /\.edu$/i,
    /\.edu\.[a-z]{2}$/i,
    /\.ac\.[a-z]{2}$/i,
    /\.res\.in$/i,
    /\.ernet\.in$/i,
    /\.ac$/i,
    /college/i,
    /univ/i,
    /institute/i,
  ];

  const isEdu = validEduPatterns.some((pattern) => pattern.test(domain));

  if (domain === 'studix.edu') return true;

  return isEdu;
}

export function getCollegeEmailErrorMessage() {
  return 'Please use your official college/university email address (e.g. yourname@college.edu or @university.ac.in). Personal Gmail/Yahoo accounts are not permitted.';
}
