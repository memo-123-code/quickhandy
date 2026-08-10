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
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Poll for bookings that are PENDING and not yet accepted
    const incomingBooking = await prisma.booking.findFirst({
      where: { status: 'PENDING' },
      include: {
        client: { include: { profile: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (incomingBooking) {
      return NextResponse.json({
        id: incomingBooking.id,
        clientName: incomingBooking.client?.name || 'Unknown Client',
        clientRating: 4.9,
        clientPhone: incomingBooking.client?.profile?.phone || 'N/A',
        category: incomingBooking.category?.name || 'Service',
        description: incomingBooking.description,
        address: incomingBooking.address,
        distance: '< 5 km',
        clientCoords: { lat: 30.3071, lng: 31.7428 },
        providerCoords: { lat: 30.3015, lng: 31.7406 },
      });
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error('Failed to fetch incoming jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch incoming jobs' }, { status: 500 });
  }
}
