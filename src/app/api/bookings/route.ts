import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // For demo purposes, we fallback to a dummy client ID
    let clientId = 'client-1'; 
    
    // Find or create the dummy client if they don't exist
    let existingClient = await prisma.user.findUnique({ where: { id: clientId } });
    if (!existingClient) {
      existingClient = await prisma.user.create({
        data: { id: clientId, name: "Test Client", email: "client@test.com", role: "CLIENT" }
      });
    }

    const body = await req.json();
    const { serviceType, locationLat, locationLng, address, problemDescription, scheduledAt } = body;

    // Find or create service category
    let category = await prisma.serviceCategory.findUnique({ where: { name: serviceType } });
    if (!category) {
      category = await prisma.serviceCategory.create({
        data: { name: serviceType, isActive: true }
      });
    }

    const booking = await prisma.booking.create({
      data: {
        clientId,
        categoryId: category.id,
        description: problemDescription,
        address: address || "Unknown",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: "PENDING",
      }
    });

    return NextResponse.json({ success: true, bookingId: booking.id, id: booking.id }, { status: 201 });
  } catch (error) {
    console.error("Failed to create booking:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
