import crypto from 'crypto';
import { dataStore } from './dataStore.js';
import { extractPdfText } from '../utils/pdfExtractor.js';

export const DUPLICATE_DOCUMENT_MESSAGE =
  'Thanks fors Helping to Your friends,but Your friend is already this ,be frist next time than your friend';

// Standard university boilerplate words that appear on nearly ALL exam papers
const BOILERPLATE_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'this', 'that', 'from', 'into', 'which',
  'department', 'college', 'university', 'engineering', 'examination',
  'question', 'paper', 'marks', 'time', 'hours', 'minutes', 'semester',
  'year', 'branch', 'section', 'regulations', 'roll', 'number', 'name',
  'date', 'instructions', 'answer', 'all', 'questions', 'max', 'note',
  'part', 'unit', 'btech', 'mtech', 'autonomous', 'institution', 'page',
  'total', 'signature', 'invigilator', 'scheme', 'code', 'series', 'hall',
  'ticket', 'student', 'faculty', 'evaluated', 'maximum', 'duration',
  'candidates', 'permitted', 'calculator', 'tables', 'handbook'
]);

/**
 * Normalizes text by removing non-alphanumeric characters and extra spaces for exact matching.
 */
function cleanTextForMatching(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts normalized academic keywords excluding common exam boilerplate words.
 */
function getAcademicWords(text) {
  if (!text) return [];
  return (text.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter(
    (w) => !BOILERPLATE_STOPWORDS.has(w)
  );
}

/**
 * Generates sliding 3-word n-gram shingles from academic keywords.
 */
function getShingles(words, n = 3) {
  if (!words || words.length < n) return new Set(words);
  const shingles = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    shingles.add(words.slice(i, i + n).join(' '));
  }
  return shingles;
}

/**
 * Calculates similarity between two text strings using:
 * 1. Normalized exact match (1.0)
 * 2. Continuous substantial substring match (>= 220 chars and ratio >= 0.8)
 * 3. 3-word n-gram Jaccard similarity on core academic content (excluding boilerplate)
 */
export function calculateDocumentSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  const cleanA = cleanTextForMatching(textA);
  const cleanB = cleanTextForMatching(textB);

  // Both must have substantial text content (>= 150 chars) to avoid false positives on tiny snippets
  if (cleanA.length < 150 || cleanB.length < 150) return 0;

  // 1. Exact normalized text match
  if (cleanA === cleanB) return 1.0;

  const wordsA = getAcademicWords(textA);
  const wordsB = getAcademicWords(textB);

  // Both must contain at least 15 unique non-boilerplate academic words
  if (wordsA.length < 15 || wordsB.length < 15) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let wordMatches = 0;
  for (const w of setA) {
    if (setB.has(w)) wordMatches++;
  }

  const wordUnion = setA.size + setB.size - wordMatches;
  const wordJaccard = wordUnion > 0 ? wordMatches / wordUnion : 0;

  // 2-word phrase shingles on academic vocabulary
  const shinglesA = getShingles(wordsA, 2);
  const shinglesB = getShingles(wordsB, 2);

  let matchCount = 0;
  for (const s of shinglesA) {
    if (shinglesB.has(s)) matchCount++;
  }

  const bigramUnion = shinglesA.size + shinglesB.size - matchCount;
  const bigramJaccard = bigramUnion > 0 ? matchCount / bigramUnion : 0;

  // 3. Substantial continuous substring match (>= 200 characters)
  const minLen = Math.min(cleanA.length, cleanB.length);
  const maxLen = Math.max(cleanA.length, cleanB.length);
  const ratio = minLen / maxLen;

  if (ratio >= 0.80) {
    const probe = cleanA.length < cleanB.length ? cleanA : cleanB;
    const target = cleanA.length < cleanB.length ? cleanB : cleanA;
    const probeChunk = probe.substring(0, Math.min(probe.length, 250));
    if (probeChunk.length >= 200 && target.includes(probeChunk)) {
      return 0.95;
    }
  }

  return Math.max(wordJaccard * 0.5 + bigramJaccard * 0.5, wordJaccard);
}

export const duplicateDetectionService = {
  DUPLICATE_MESSAGE: DUPLICATE_DOCUMENT_MESSAGE,

  /**
   * Computes a cryptographic SHA-256 hash for a given file buffer.
   * @param {Buffer} buffer 
   * @returns {string} Hexadecimal SHA-256 hash
   */
  calculateHash(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error('Valid file buffer is required to calculate SHA-256 hash.');
    }
    return crypto.createHash('sha256').update(buffer).digest('hex');
  },

  /**
   * Verifies whether the file has already been uploaded by:
   * 1. Cryptographic SHA-256 hash check (catches identical files uploaded with DIFFERENT names)
   * 2. PDF / Document text semantic analysis & content similarity comparison
   *
   * @param {object} params
   * @param {string} params.fileHash - Precomputed SHA-256 hash
   * @param {Buffer} [params.buffer] - File buffer for PDF text analysis
   * @param {string} [params.extractedText] - Pre-extracted document text
   * @param {string} [params.departmentId] - Department context filter
   * @param {string} [params.subjectId] - Subject context filter
   * @returns {Promise<{ isDuplicate: boolean, existingResource: object|null, reason: string|null, similarity?: number }>}
   */
  async checkDuplicate(params) {
    const fileHash = typeof params === 'string' ? params : params?.fileHash;
    const buffer = params?.buffer;
    let extractedText = params?.extractedText;
    const departmentId = params?.departmentId;
    const subjectId = params?.subjectId;

    if (!fileHash) {
      throw new Error('File hash is required for duplicate check.');
    }

    // 1. Check direct cryptographic SHA-256 hash match
    // (If the file is identical, even with a different name, SHA-256 hash is 100% identical!)
    const existingByHash = await dataStore.findResourceByHash(fileHash);
    if (existingByHash) {
      return {
        isDuplicate: true,
        existingResource: existingByHash,
        reason: 'HASH_MATCH',
        similarity: 1.0,
      };
    }

    // 2. Semantic text/content duplicate analysis
    // (Only triggers when text is substantial >= 150 chars to avoid false positives on regular files)
    if (!extractedText && buffer && Buffer.isBuffer(buffer)) {
      try {
        extractedText = await extractPdfText(buffer);
      } catch (extractErr) {
        console.warn('PDF text extraction error during duplicate check:', extractErr.message);
      }
    }

    if (extractedText && extractedText.trim().length >= 150) {
      const filters = { status: 'APPROVED' };
      if (departmentId) filters.departmentId = departmentId;
      if (subjectId) filters.subjectId = subjectId;

      let candidateResources = (await dataStore.getResources(filters)) || [];
      // If no resources in specific subject, search department
      if (candidateResources.length === 0 && departmentId) {
        candidateResources = (await dataStore.getResources({ status: 'APPROVED', departmentId })) || [];
      }
      if (candidateResources.length === 0) {
        candidateResources = (await dataStore.getResources({ status: 'APPROVED' })) || [];
      }

      for (const res of candidateResources) {
        const existingText = res.ocr_extracted_text || '';
        if (existingText && existingText.trim().length >= 150) {
          const similarity = calculateDocumentSimilarity(extractedText, existingText);
          // Only trigger if similarity is high (>= 75%) indicating true duplicate document
          if (similarity >= 0.75) {
            console.log(
              `🔍 High content similarity duplicate detected: ${(similarity * 100).toFixed(1)}% with "${res.title}"`
            );
            return {
              isDuplicate: true,
              existingResource: res,
              reason: 'CONTENT_SIMILARITY',
              similarity,
            };
          }
        }
      }
    }

    return {
      isDuplicate: false,
      existingResource: null,
      reason: null,
    };
  },
};

export default duplicateDetectionService;
