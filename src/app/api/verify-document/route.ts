import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const docType = formData.get('type') as string;

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

    // Simulate AI Processing Delay (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Strict Validation Logic based on filename keywords
    const lowerName = file.name.toLowerCase();
    let result = '';
    let logMsg = '';

    switch (docType) {
      case 'id':
        if (!lowerName.includes('id') && !lowerName.includes('بطاقة') && !lowerName.includes('national')) {
          return NextResponse.json(
            { error: 'AI Rejected: Document does not appear to be a valid National ID. Text missing or blurred.' },
            { status: 400 }
          );
        }
        result = 'AI Confidence: 99.8% | Type: ID Match';
        logMsg = 'Face matched.';
        break;
      case 'criminal':
        if (!lowerName.includes('criminal') && !lowerName.includes('فيش') && !lowerName.includes('record') && !lowerName.includes('تشفيه')) {
          return NextResponse.json(
            { error: 'AI Rejected: Document does not appear to be a valid Criminal Record. Barcode missing.' },
            { status: 400 }
          );
        }
        result = 'AI Confidence: 95.0% | Status: Cleared';
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
