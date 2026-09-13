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

    // --- Commission Engine & Fund Release Logic ---
    if (status === "COMPLETED" && updatedBooking.providerId && updatedBooking.estimatedCost) {
      const providerId = updatedBooking.providerId;
      const jobTotal = updatedBooking.estimatedCost;
      
      // We need to know the payment method. For this MVP, let's assume we can get it from the request body or default to CASH if not provided.
      // Alternatively, the booking schema could store it. Since Prisma schema doesn't have paymentMethod on Booking currently,
      // we'll extract it from the PATCH body, defaulting to "CASH".
      const paymentMethod = body.paymentMethod || "CASH";

      const COMMISSION_RATE = 0.13;
      const platformFee = jobTotal * COMMISSION_RATE;
      const providerEarnings = jobTotal - platformFee;

      await prisma.$transaction(async (tx) => {
        // Ensure provider wallet exists
        const providerWallet = await tx.wallet.upsert({
          where: { userId: providerId },
          update: {},
          create: { 
            userId: providerId, 
            availableBalance: 0,
            lifetimeEarnings: 0, 
            currency: "EGP" 
          }
        });

        if (paymentMethod === "CREDIT_CARD") {
          // Money is with platform. Provider gets earnings added to wallet.
          await tx.wallet.update({
            where: { id: providerWallet.id },
            data: { 
              availableBalance: { increment: providerEarnings },
              lifetimeEarnings: { increment: providerEarnings }
            }
          });

          // Log provider payment
          await tx.transaction.create({
            data: {
              walletId: providerWallet.id,
              bookingId: updatedBooking.id,
              type: "PAYMENT",
              amount: providerEarnings,
              status: "COMPLETED",
              payoutMethod: "CREDIT_CARD", // Using this field to store payment source
            }
          });
        } else if (paymentMethod === "CASH") {
          // Provider took full cash from client. Deduct only the platform fee.
          // availableBalance can go negative, representing debt.
          await tx.wallet.update({
            where: { id: providerWallet.id },
            data: { 
              availableBalance: { decrement: platformFee },
              lifetimeEarnings: { increment: providerEarnings } // They still earned this amount
            }
          });
        }

        // Log Commission Transaction
        await tx.transaction.create({
          data: {
            walletId: providerWallet.id,
            bookingId: updatedBooking.id,
            type: "COMMISSION_FEE", // Using COMMISSION string but our schema expects COMMISSION
            amount: -platformFee,
            status: "COMPLETED",
            payoutMethod: "SYSTEM_DEDUCTION"
          }
        });
        
        // Increment provider's totalJobs
        await tx.profile.update({
          where: { userId: providerId },
          data: { totalJobs: { increment: 1 } }
        });
      });
    }

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Failed to update booking status:', error);
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
  }
}
