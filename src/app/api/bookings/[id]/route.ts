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
