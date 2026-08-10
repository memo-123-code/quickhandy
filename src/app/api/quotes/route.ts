import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    let providerId = "provider-1";

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user) {
        providerId = user.id;
      }
    }

    const body = await req.json();
    const { bookingId, price } = body;

    if (!bookingId || !price) {
      return NextResponse.json({ error: "Booking ID and price are required" }, { status: 400 });
    }

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
