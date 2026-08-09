import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const quote = await prisma.quote.update({
      where: { id: params.id },
      data: { status: "ACCEPTED" }
    });
    
    // Also update the booking
    await prisma.booking.update({
      where: { id: quote.bookingId },
      data: { status: "ACCEPTED", providerId: quote.providerId, estimatedCost: quote.price }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to accept quote:", error);
    return NextResponse.json({ error: "Failed to accept quote" }, { status: 500 });
  }
}
