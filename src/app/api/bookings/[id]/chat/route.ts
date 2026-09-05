import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const messages = await (prisma as any).chatMessage.findMany({
      where: { bookingId: params.id },
      orderBy: { createdAt: 'asc' }
    });
    
    // Map to frontend expected format
    const formattedMessages = messages.map((msg: any) => {
      // Map role to lower case sender expected by frontend: 'client', 'provider', 'system'
      const sender = msg.senderRole === 'CLIENT' ? 'client' : 
                     msg.senderRole === 'PROVIDER' ? 'provider' : 'system';
                     
      return {
        id: msg.id,
        sender,
        text: msg.text,
        time: msg.createdAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    });

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    return NextResponse.json({ error: 'Failed to fetch chat messages' }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { senderId, senderRole, text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    // --- Smart AI Filter for Platform Leakage (Server-Side) ---
    const phoneRegex = /(?:\+?20)?(?:0)?1[0125]\d{8}/;
    const keywordRegex = /(واتساب|واتس|تليفون|رقم|كاش|cash|whatsapp|phone)/i;
    
    let maskedText = text;
    const hasViolation = phoneRegex.test(maskedText) || keywordRegex.test(maskedText);
    
    if (hasViolation) {
      maskedText = maskedText.replace(phoneRegex, '[ممنوع مشاركة الأرقام]');
      maskedText = maskedText.replace(keywordRegex, '[كلمة محظورة]');
    }

    // Save the user's message (masked if needed)
    await (prisma as any).chatMessage.create({
      data: {
        bookingId: params.id,
        senderId,
        senderRole,
        text: maskedText,
        isViolation: hasViolation
      }
    });

    // If violation, auto-inject a System Bot message immediately
    if (hasViolation) {
      await (prisma as any).chatMessage.create({
        data: {
          bookingId: params.id,
          senderId: 'SYSTEM',
          senderRole: 'SYSTEM',
          text: '🚨 روبوت الحماية: يرجى عدم مشاركة بيانات التواصل لضمان حقوقك وتجنب إيقاف الحساب وفقاً لسياسة التطبيق.',
          isViolation: false
        }
      });
    }

    return NextResponse.json({ success: true, hasViolation });
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return NextResponse.json({ error: 'Failed to send chat message' }, { status: 500 });
  }
}
