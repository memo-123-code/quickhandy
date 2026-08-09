import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // Poll for bookings that are PENDING and haven't been accepted yet
    // In a real app we'd filter by category or location match.
    const incomingBooking = await prisma.booking.findFirst({
      where: {
        status: "PENDING"
      },
      include: {
        client: {
          include: { profile: true }
        },
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (incomingBooking) {
      return NextResponse.json({
        id: incomingBooking.id,
        clientName: incomingBooking.client?.name || "Unknown Client",
        clientRating: 4.9, // Mocked rating since we don't have review aggregates yet
        clientPhone: incomingBooking.client?.profile?.phone || "N/A",
        category: incomingBooking.category?.name || "Service",
        description: incomingBooking.description,
        address: incomingBooking.address,
        distance: "1.2 km", // Mock distance
        clientCoords: { lat: 30.3071, lng: 31.7428 },
        providerCoords: { lat: 30.3015, lng: 31.7406 }
      });
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Failed to fetch incoming jobs:", error);
    return NextResponse.json({ error: "Failed to fetch incoming jobs" }, { status: 500 });
  }
}
