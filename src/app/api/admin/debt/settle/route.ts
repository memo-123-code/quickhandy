import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    if (wallet.availableBalance >= 0) {
      return NextResponse.json({ error: 'User does not have a negative balance' }, { status: 400 });
    }

    // Settle debt by adding the exact negative amount back to zero it out
    const debtAmount = Math.abs(wallet.availableBalance);
    
    await prisma.$transaction(async (tx) => {
      // Zero out availableBalance
      await tx.wallet.update({
        where: { userId },
        data: { availableBalance: 0 }
      });

      // Record the settlement transaction
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'MANUAL_DEBT_SETTLEMENT',
          amount: debtAmount,
          status: 'COMPLETED',
          payoutMethod: 'MANUAL_CASH'
        }
      });
    });

    return NextResponse.json({ success: true, message: 'Debt settled successfully' });
  } catch (error) {
    console.error('Failed to settle debt:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
