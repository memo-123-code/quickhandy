import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession();

    // Require authenticated user
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      serviceType,
      locationLat,
      locationLng,
      address,
      problemDescription,
      imageUrl,
      isEmergency,
      scheduleDate,
      scheduleTime,
    } = body;

    if (!problemDescription?.trim()) {
      return NextResponse.json({ error: 'Problem description is required' }, { status: 400 });
    }

    // Find or create service category
    let category = await prisma.serviceCategory.findUnique({ where: { name: serviceType } });
    if (!category) {
      category = await prisma.serviceCategory.create({
        data: { name: serviceType || 'General', isActive: true },
      });
    }

    // Compute scheduled time
    let scheduledAt = new Date(); // default to now for emergency
    if (!isEmergency && scheduleDate && scheduleTime) {
      scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    }

    const booking = await prisma.booking.create({
      data: {
        clientId: user.id,
        categoryId: category.id,
        description: problemDescription,
        imageUrl: imageUrl || null,
        address: address || 'Not specified',
        scheduledAt,
        status: 'PENDING',
      },
    });

    return NextResponse.json(
      { success: true, bookingId: booking.id, id: booking.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
