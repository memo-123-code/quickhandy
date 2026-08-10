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
        data: { userId: user.id, balance: 0.0, currency: 'EGP' },
      });
      return NextResponse.json({ balance: newWallet.balance, currency: 'EGP' });
    }

    return NextResponse.json({
      balance: user.wallet.balance,
      currency: user.wallet.currency,
    });
  } catch (error) {
    console.error('Failed to fetch wallet balance:', error);
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
  }
}
