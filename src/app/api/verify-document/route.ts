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

    // Return dynamic mock OCR data based on document type
    let result = '';
    let logMsg = '';

    switch (docType) {
      case 'id':
        result = 'AI Confidence: 99.8% | Type: ID Match';
        logMsg = 'Face matched.';
        break;
      case 'criminal':
        result = 'AI Confidence: 95.0% | Status: Cleared';
        logMsg = 'No infractions found.';
        break;
      case 'certs':
        result = 'AI Confidence: 94.2% | Verified';
        logMsg = 'Genuine Document Detected.';
        break;
      default:
        result = 'AI Confidence: 85.0% | Status: Unknown';
        logMsg = 'Document analyzed successfully.';
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
