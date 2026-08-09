import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.quote.update({
      where: { id: params.id },
      data: { status: "REJECTED" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to decline quote:", error);
    return NextResponse.json({ error: "Failed to decline quote" }, { status: 500 });
  }
}
