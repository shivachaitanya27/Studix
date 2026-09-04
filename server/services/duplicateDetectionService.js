import crypto from 'crypto';
import { dataStore } from './dataStore.js';
import { extractPdfText } from '../utils/pdfExtractor.js';

export const DUPLICATE_DOCUMENT_MESSAGE =
  'Thanks fors Helping to Your friends,but Your friend is already this ,be frist next time than your friend';

/**
 * Normalizes text by removing non-alphanumeric characters and extra spaces for exact matching.
 */
function cleanTextForMatching(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Extracts normalized word tokens (length >= 3).
 */
function getWordTokens(text) {
  if (!text) return [];
  return (text.toLowerCase().match(/[a-z0-9]{3,}/g) || []).filter(
    (w) => !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(w)
  );
}

/**
 * Generates sliding 3-word n-gram shingles.
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
 * 1. Normalized exact match / substring containment
 * 2. Jaccard similarity of 3-word shingles
 * 3. Word token overlap
 */
export function calculateDocumentSimilarity(textA, textB) {
  if (!textA || !textB) return 0;

  const cleanA = cleanTextForMatching(textA);
  const cleanB = cleanTextForMatching(textB);

  // Both must have meaningful content
  if (cleanA.length < 35 || cleanB.length < 35) return 0;

  // 1. Exact normalized match
  if (cleanA === cleanB) return 1.0;

  // Substring containment for long text snippets
  const minLen = Math.min(cleanA.length, cleanB.length);
  const maxLen = Math.max(cleanA.length, cleanB.length);
  const ratio = minLen / maxLen;

  if (ratio > 0.65) {
    const probe = cleanA.length < cleanB.length ? cleanA : cleanB;
    const target = cleanA.length < cleanB.length ? cleanB : cleanA;
    // Check if substantial continuous block matches
    const checkLength = Math.min(probe.length, 180);
    if (target.includes(probe.substring(0, checkLength))) {
      return 0.95;
    }
  }

  // 2. Token & Shingle similarity
  const wordsA = getWordTokens(textA);
  const wordsB = getWordTokens(textB);

  if (wordsA.length < 6 || wordsB.length < 6) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);

  let wordMatches = 0;
  for (const w of setA) {
    if (setB.has(w)) wordMatches++;
  }

  const wordUnion = setA.size + setB.size - wordMatches;
  const wordJaccard = wordUnion > 0 ? wordMatches / wordUnion : 0;
  const wordContainment =
    Math.min(setA.size, setB.size) > 0
      ? wordMatches / Math.min(setA.size, setB.size)
      : 0;

  // Bigram shingles (2-word phrases)
  const shinglesA = getShingles(wordsA, 2);
  const shinglesB = getShingles(wordsB, 2);

  let bigramMatches = 0;
  for (const s of shinglesA) {
    if (shinglesB.has(s)) bigramMatches++;
  }

  const bigramContainment =
    Math.min(shinglesA.size, shinglesB.size) > 0
      ? bigramMatches / Math.min(shinglesA.size, shinglesB.size)
      : 0;

  // A document sharing >= 70% core academic vocabulary and key phrases is a duplicate
  const compositeScore = Math.max(
    wordContainment * 0.7 + bigramContainment * 0.3,
    wordJaccard
  );

  return compositeScore;
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
   * @returns {Promise<{ isDuplicate: boolean, existingResource: object|null, reason: string|null, similarity?: number }>}
   */
  async checkDuplicate(params) {
    const fileHash = typeof params === 'string' ? params : params?.fileHash;
    const buffer = params?.buffer;
    let extractedText = params?.extractedText;

    if (!fileHash) {
      throw new Error('File hash is required for duplicate check.');
    }

    // 1. Check direct cryptographic SHA-256 hash match
    // (Note: even if the user renamed the file, the hash of the buffer is IDENTICAL!)
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
    // (Handles re-printed, re-saved, or metadata-altered PDFs with different names)
    if (!extractedText && buffer && Buffer.isBuffer(buffer)) {
      try {
        extractedText = await extractPdfText(buffer);
      } catch (extractErr) {
        console.warn('PDF text extraction error during duplicate check:', extractErr.message);
      }
    }

    if (extractedText && extractedText.trim().length >= 35) {
      const allResources = (await dataStore.getResources({ status: 'APPROVED' })) || [];

      for (const res of allResources) {
        const existingText = res.ocr_extracted_text || '';
        if (existingText && existingText.trim().length >= 35) {
          const similarity = calculateDocumentSimilarity(extractedText, existingText);
          if (similarity >= 0.70) {
            console.log(
              `🔍 Content duplicate detected! Similarity: ${(similarity * 100).toFixed(1)}% with "${res.title}"`
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
