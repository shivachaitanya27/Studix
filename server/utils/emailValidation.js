/**
 * College Email Validation Utility
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

  // Also accept pre-seeded test institution domain 'studix.edu'
  if (domain === 'studix.edu') return true;

  return isEdu;
}

export function getCollegeEmailErrorMessage() {
  return 'Registration is restricted to official college/university email addresses (e.g., yourname@college.edu or @university.ac.in). Personal Gmail/Yahoo accounts are not permitted.';
}

export function extractDomain(email) {
  if (!email || !email.includes('@')) return '';
  return email.toLowerCase().trim().split('@')[1] || '';
}

/**
 * Infer campus metadata from the educational email domain
 * e.g. @college.ac.in -> College Campus (COLLEGE)
 * e.g. @dsuniversity.ac.in -> Dhanalakshmi Srinivasan University (DSU)
 */
export function inferCampusInfo(email) {
  const domain = extractDomain(email);
  if (!domain) return null;

  if (domain === 'dsuniversity.ac.in' || domain.includes('dsuniversity') || domain.includes('dsu.edu')) {
    return {
      domain,
      campusName: 'Dhanalakshmi Srinivasan University Trichy',
      campusCode: 'DSU',
      isRecognized: true,
    };
  }

  // Parse generic institutional domains e.g. college.ac.in, nitw.ac.in, srm.edu.in
  const parts = domain.split('.');
  const primaryName = parts[0] || 'Campus';
  const formattedCode = primaryName.toUpperCase().slice(0, 8);
  const formattedName =
    primaryName.charAt(0).toUpperCase() +
    primaryName.slice(1).replace(/[-_]/g, ' ') +
    ' Campus / College';

  return {
    domain,
    campusName: formattedName,
    campusCode: formattedCode,
    isRecognized: isCollegeEmail(email),
  };
}
