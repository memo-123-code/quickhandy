import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Mock user for now since we don't have session configured
    const userId = "provider-1";

    let wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      // Find or create dummy user
      let existingUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: { id: userId, name: "Test Provider", role: "PROVIDER" }
        });
      }

      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 100.0 // Starting balance for testing
        }
      });
    }

    return NextResponse.json({ balance: wallet.balance });
  } catch (error) {
    console.error("Failed to fetch wallet balance:", error);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}
