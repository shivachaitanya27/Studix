import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Robust extraction of text from PDF buffers.
 * Uses pdf-parse with regex / stream fallback.
 * @param {Buffer} buffer 
 * @returns {Promise<string>} Extracted text or empty string
 */
export async function extractPdfText(buffer) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    return '';
  }

  // 1. Try pdf-parse
  try {
    const { PDFParse } = require('pdf-parse');
    if (typeof PDFParse === 'function') {
      const parser = new PDFParse({ data: buffer });
      if (typeof parser.getText === 'function') {
        const txt = await parser.getText();
        if (txt && txt.trim().length > 0) {
          return txt.trim();
        }
      }
    }
  } catch {
    // Fall back to stream extraction
  }

  // 2. Stream extraction fallback
  try {
    const raw = buffer.toString('latin1');
    const textBlocks = [];
    const tjMatches = raw.match(/\((.*?)\)\s*Tj/g);
    if (tjMatches && tjMatches.length > 0) {
      for (const m of tjMatches.slice(0, 800)) {
        const cleaned = m.replace(/\)\s*Tj$/, '').replace(/^\(/, '').trim();
        if (cleaned.length > 1) textBlocks.push(cleaned);
      }
    }

    const words = raw.match(/[a-zA-Z0-9.,;:?!'\"()\-/\s]{4,}/g);
    if (words) {
      const valid = words
        .filter(
          (w) =>
            w.trim().length > 3 &&
            !w.includes('/Type') &&
            !w.includes('/Pages') &&
            !w.includes('/Font') &&
            !w.includes('/Catalog')
        )
        .slice(0, 500);
      textBlocks.push(...valid);
    }

    return textBlocks.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
    return '';
  }
}

export default extractPdfText;
