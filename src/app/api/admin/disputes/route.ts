import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const disputedBookings = await prisma.booking.findMany({
      where: { status: 'DISPUTED' },
      include: {
        client: true,
        provider: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedDisputes = disputedBookings.map((b: any) => ({
      id: b.id,
      clientName: b.client.name || b.client.email?.split("@")[0] || "Client",
      providerName: b.provider?.name || b.provider?.email?.split("@")[0] || "Provider",
      reason: b.description || "No reason provided",
      status: "OPEN",
      priority: "HIGH",
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedDisputes);
  } catch (error) {
    console.error('Failed to fetch disputes:', error);
    return NextResponse.json({ error: 'Failed to fetch disputes' }, { status: 500 });
  }
}
