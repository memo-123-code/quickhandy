import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, price, providerId = "provider-1" } = body;

    const quote = await prisma.quote.create({
      data: {
        bookingId,
        providerId,
        price: parseFloat(price),
        status: "PENDING"
      }
    });

    return NextResponse.json({ success: true, quoteId: quote.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to submit quote:", error);
    return NextResponse.json({ error: "Failed to submit quote" }, { status: 500 });
  }
}
