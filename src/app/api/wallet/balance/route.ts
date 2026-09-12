import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { wallet: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create wallet if it doesn't exist
    if (!user.wallet) {
      const newWallet = await prisma.wallet.create({
        data: { userId: user.id, availableBalance: 0.0, pendingBalance: 0.0, lifetimeEarnings: 0.0, currency: 'EGP' },
      });
      return NextResponse.json({ 
        balance: newWallet.availableBalance, 
        pending: newWallet.pendingBalance,
        lifetime: newWallet.lifetimeEarnings,
        currency: newWallet.currency 
      });
    }

    return NextResponse.json({
      balance: user.wallet.availableBalance,
      pending: user.wallet.pendingBalance,
      lifetime: user.wallet.lifetimeEarnings,
      currency: user.wallet.currency,
    });
  } catch (error) {
    console.error('Failed to fetch wallet balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
