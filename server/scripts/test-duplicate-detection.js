import { duplicateDetectionService, DUPLICATE_DOCUMENT_MESSAGE, calculateDocumentSimilarity } from '../services/duplicateDetectionService.js';
import { resourceService } from '../services/resourceService.js';
import { dataStore } from '../services/dataStore.js';

async function runDuplicateTests() {
  console.log('🧪 Starting Duplicate PDF Analysis Tests...\n');

  const testId = Date.now();
  const sampleTextA = `
    MID TERM EXAMINATION - EMBEDDED REAL TIME SYSTEMS [Batch-${testId}]
    Department of Embedded Systems and Robotics
    Time: 75 Minutes  Max Marks: 40
    Q1. Contrast ARM Cortex-M3 vs Cortex-M4 architectures regarding DSP instructions.
    Q2. Formulate rate monotonic scheduling algorithms for periodic real-time tasks.
    Q3. Explain priority inversion and priority ceiling protocol solutions in RTOS.
  `;

  const sampleTextB_SameContentDifferentFormatting = `
    MID-TERM EXAMINATION EMBEDDED REAL-TIME SYSTEMS [Batch-${testId}]
    Department of Embedded Systems & Robotics
    Time: 75 Minutes | Maximum Marks: 40
    Question 1: Contrast ARM Cortex-M3 vs Cortex-M4 architectures with respect to DSP instructions.
    Question 2: Formulate rate monotonic scheduling algorithms for periodic real time tasks.
    Question 3: Explain priority inversion problem and priority ceiling protocol in RTOS kernels.
  `;

  const sampleTextC_DifferentDoc = `
    FINAL EXAMINATION - DIGITAL SIGNAL PROCESSING [Batch-${testId}]
    Department of Signal Processing and Communications
    Q1. Derive Radix-2 Decimation-In-Time Fast Fourier Transform (DIT-FFT) butterfly diagrams.
    Q2. Design a digital Chebyshev Type I lowpass filter with bilinear transformation.
  `;

  const simMatch = calculateDocumentSimilarity(sampleTextA, sampleTextB_SameContentDifferentFormatting);
  const simDiff = calculateDocumentSimilarity(sampleTextA, sampleTextC_DifferentDoc);

  console.log(`📊 Similarity between same document with different formatting: ${(simMatch * 100).toFixed(1)}%`);
  console.log(`📊 Similarity between two completely different documents: ${(simDiff * 100).toFixed(1)}%`);

  if (simMatch < 0.70) {
    throw new Error(`Expected high similarity for same content, got ${simMatch}`);
  }
  if (simDiff > 0.40) {
    throw new Error(`Expected low similarity for different content, got ${simDiff}`);
  }
  console.log('✅ Similarity algorithm passed!\n');

  // Test 2: Uploading original resource
  const mockUser = {
    id: 'test-user-1',
    college_id: 'c1000000-0000-0000-0000-000000000001',
    department_id: 'd1000000-0000-0000-0000-000000000001',
    academic_year: 3,
    semester: 5,
    role: 'STUDENT',
  };

  const pdfHeader = '%PDF-1.4\n';
  const originalBuffer = Buffer.from(pdfHeader + sampleTextA);

  console.log('1️⃣ Uploading original document as "cn_mid1_exam_official.pdf"...');
  const uploadResult1 = await resourceService.uploadResource({
    file: {
      originalname: 'cn_mid1_exam_official.pdf',
      mimetype: 'application/pdf',
      buffer: originalBuffer,
    },
    title: 'Computer Networks Mid 1 Exam 2025',
    resourceType: 'MID_1',
    subjectName: 'Computer Networks',
    user: mockUser,
  });

  console.log(`✅ Original uploaded successfully: ID = ${uploadResult1.resource.id}`);

  // Test 3: Uploading SAME document with DIFFERENT file name
  console.log('\n2️⃣ Attempting upload of SAME document with DIFFERENT name "my_friends_notes_cn.pdf"...');
  let duplicateCaught1 = false;
  try {
    await resourceService.uploadResource({
      file: {
        originalname: 'my_friends_notes_cn.pdf', // Different name!
        mimetype: 'application/pdf',
        buffer: originalBuffer, // Identical buffer
      },
      title: 'CN Notes For Friends',
      resourceType: 'MID_1',
      subjectName: 'Computer Networks',
      user: { ...mockUser, id: 'test-user-2' }, // Different user (friend)
    });
  } catch (err) {
    duplicateCaught1 = true;
    console.log(`🛡️ Blocked! Status: ${err.status}`);
    console.log(`💬 Message: "${err.message}"`);
    if (err.message !== DUPLICATE_DOCUMENT_MESSAGE) {
      throw new Error(`Expected exact message "${DUPLICATE_DOCUMENT_MESSAGE}", got "${err.message}"`);
    }
  }

  if (!duplicateCaught1) {
    throw new Error('Failed to block duplicate upload with different file name!');
  }
  console.log('✅ Duplicate blocked with exact user-requested message!\n');

  // Test 4: Uploading re-exported document (different buffer & hash, different name, but same text content)
  console.log('3️⃣ Attempting upload of re-exported document with DIFFERENT name & DIFFERENT hash...');
  const resavedBuffer = Buffer.from(pdfHeader + '%Re-printed by Student B\n' + sampleTextB_SameContentDifferentFormatting);
  let duplicateCaught2 = false;

  try {
    await resourceService.uploadResource({
      file: {
        originalname: 'resaved_cn_paper_copy.pdf', // Different name & hash!
        mimetype: 'application/pdf',
        buffer: resavedBuffer,
      },
      title: 'CN Paper Copy',
      resourceType: 'MID_1',
      subjectName: 'Computer Networks',
      user: { ...mockUser, id: 'test-user-3' },
    });
  } catch (err) {
    duplicateCaught2 = true;
    console.log(`🛡️ Content duplicate blocked! Status: ${err.status}`);
    console.log(`💬 Message: "${err.message}"`);
    if (err.message !== DUPLICATE_DOCUMENT_MESSAGE) {
      throw new Error(`Expected exact message "${DUPLICATE_DOCUMENT_MESSAGE}", got "${err.message}"`);
    }
  }

  if (!duplicateCaught2) {
    throw new Error('Failed to block content duplicate upload with different file name and hash!');
  }
  console.log('✅ Semantic content duplicate blocked with exact user-requested message!\n');

  console.log('🎉 ALL DUPLICATE PDF ANALYSIS TESTS PASSED SUCCESSFULLY!');
}

runDuplicateTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
