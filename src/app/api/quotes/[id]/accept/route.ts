import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Fetch Quote & Booking to know the Price and Client
    const quote = await prisma.quote.findUnique({
      where: { id: params.id },
      include: { booking: true }
    });

    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    // 2. Escrow System: Deduct amount from Client's Wallet
    const clientWallet = await prisma.wallet.findUnique({
      where: { userId: quote.booking.clientId }
    });

    if (!clientWallet || clientWallet.balance < quote.price) {
      return NextResponse.json({ 
        error: "Insufficient funds. Please top up your wallet to accept this quote." 
      }, { status: 400 });
    }

    // Use a Prisma Transaction to ensure atomic deduction and status update
    await prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { id: clientWallet.id },
        data: { balance: { decrement: quote.price } }
      });

      // Record Escrow Transaction
      await tx.transaction.create({
        data: {
          walletId: clientWallet.id,
          bookingId: quote.bookingId,
          type: "PAYMENT", // Escrow hold
          amount: -quote.price,
          status: "COMPLETED"
        }
      });

      // Update Quote & Booking
      await tx.quote.update({
        where: { id: params.id },
        data: { status: "ACCEPTED" }
      });

      await tx.booking.update({
        where: { id: quote.bookingId },
        data: { status: "ACCEPTED", providerId: quote.providerId, estimatedCost: quote.price }
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to accept quote:", error);
    return NextResponse.json({ error: "Failed to accept quote" }, { status: 500 });
  }
}
