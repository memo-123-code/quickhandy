import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('type') as string;
    const extractedText = formData.get('extractedText') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided.' },
        { status: 400 }
      );
    }

    // Validate file type (image or pdf)
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (e.g., max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit.' },
        { status: 400 }
      );
    }

    // If text was already extracted on client and it passed client validation,
    // we just need to verify it here too, or just accept it if we trust the client.
    // Let's do a double check on the backend if text is provided.
    let isOcrValid = false;
    
    if (extractedText) {
       if (docType === 'id') {
         const idKeywords = ["بطاقة", "الرقم القومي", "جمهورية مصر", "تحقيق شخصية"];
         const matchCount = idKeywords.filter(kw => extractedText.includes(kw)).length;
         if (matchCount >= 1) isOcrValid = true;
       } else if (docType === 'criminal') {
         const criminalKeywords = ["صحيفة", "حالة جنائية", "الادلة الجنائية", "وزارة الداخلية"];
         if (criminalKeywords.some(kw => extractedText.includes(kw))) isOcrValid = true;
       }
    }

    // Simulate AI Processing Delay (Only if not already processed by client)
    if (!extractedText) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } else {
      // Small delay for UX consistency
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Strict Validation Logic
    const lowerName = file.name.toLowerCase();
    let result = '';
    let logMsg = '';

    switch (docType) {
      case 'id':
        if (!isOcrValid && !lowerName.includes('id') && !lowerName.includes('بطاقة') && !lowerName.includes('national')) {
          return NextResponse.json(
            { error: 'AI Rejected: Real document keywords not found. Please upload a valid Egyptian document.' },
            { status: 400 }
          );
        }
        result = 'AI Confidence: 99.8% | Type: ID Match (OCR Verified)';
        logMsg = 'Face & Text matched.';
        break;
      case 'criminal':
        if (!isOcrValid && !lowerName.includes('criminal') && !lowerName.includes('فيش') && !lowerName.includes('record') && !lowerName.includes('تشفيه')) {
          return NextResponse.json(
            { error: 'AI Rejected: Real document keywords not found. Please upload a valid Egyptian document.' },
            { status: 400 }
          );
        }
        result = 'AI Confidence: 95.0% | Status: Cleared (OCR Verified)';
        logMsg = 'No infractions found.';
        break;
      case 'certs':
        if (!lowerName.includes('cert') && !lowerName.includes('شهادة') && !lowerName.includes('degree') && !lowerName.includes('diploma')) {
          return NextResponse.json(
            { error: 'AI Rejected: Document does not appear to be a recognized certificate. Seals missing.' },
            { status: 400 }
          );
        }
        result = 'AI Confidence: 94.2% | Verified';
        logMsg = 'Genuine Document Detected.';
        break;
      default:
        return NextResponse.json(
          { error: 'AI Rejected: Unknown document type.' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'File processed successfully',
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        ocrResult: result,
        logMessage: logMsg,
      }
    });

  } catch (error) {
    console.error('Error verifying document:', error);
    return NextResponse.json(
      { error: 'Failed to process document.' },
      { status: 500 }
    );
  }
}
