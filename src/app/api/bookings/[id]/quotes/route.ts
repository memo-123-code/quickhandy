import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: bookingId } = params;

    const quotes = await prisma.quote.findMany({
      where: { bookingId },
      include: {
        provider: {
          select: {
            name: true,
            image: true,
            profile: {
              select: { rating: true }
            }
          }
        }
      }
    });

    // Transform into the format expected by the frontend
    const formattedQuotes = quotes.map(quote => ({
      id: quote.id,
      price: quote.price,
      status: quote.status,
      provider: {
        name: quote.provider.name || "Unknown Provider",
        rating: quote.provider.profile?.rating || 5.0,
        reviews: 0,
        vehicle: "Standard Vehicle",
        phone: "",
        photoUrl: quote.provider.image || "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&h=100&fit=crop&crop=faces"
      }
    }));

    return NextResponse.json(formattedQuotes);
  } catch (error) {
    console.error("Failed to fetch quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}
