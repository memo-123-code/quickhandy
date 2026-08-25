import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: { select: { phone: true, city: true } }
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: { select: { phone: true, rating: true } }
          }
        },
        category: true,
        quotes: {
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true,
                profile: { select: { rating: true } }
              }
            }
          }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Failed to fetch booking status:', error);
    return NextResponse.json({ error: 'Failed to fetch booking status' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, handymanLat, handymanLng } = body;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (handymanLat !== undefined) dataToUpdate.handymanLat = handymanLat;
    if (handymanLng !== undefined) dataToUpdate.handymanLng = handymanLng;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: 'No data to update' }, { status: 400 });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: dataToUpdate,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: { select: { phone: true, city: true } }
          }
        },
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            profile: { select: { phone: true, rating: true } }
          }
        },
        category: true,
      }
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Failed to update booking status:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
