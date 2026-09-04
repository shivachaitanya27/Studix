import crypto from 'crypto';
import { dataStore } from './dataStore.js';

export const duplicateDetectionService = {
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
   * Verifies whether the file has already been ingested.
   * @param {string} fileHash 
   * @returns {Promise<{ isDuplicate: boolean, existingResource: object|null }>}
   */
  async checkDuplicate(fileHash) {
    if (!fileHash) {
      throw new Error('File hash is required for duplicate check.');
    }

    const existingResource = await dataStore.findResourceByHash(fileHash);

    if (existingResource) {
      return {
        isDuplicate: true,
        existingResource,
      };
    }

    return {
      isDuplicate: false,
      existingResource: null,
    };
  },
};

export default duplicateDetectionService;
