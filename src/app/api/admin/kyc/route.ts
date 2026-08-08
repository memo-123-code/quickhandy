import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { documentId, status, notes } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json(
        { error: "Document ID and verification status are required." },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be APPROVED or REJECTED." },
        { status: 400 }
      );
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: documentId },
      data: {
        isVerified: status === "APPROVED",
      },
      include: {
        user: true
      }
    });

    return NextResponse.json({
      message: `KYC document has been ${status.toLowerCase()}.`,
      document: { id: documentId, status, notes },
      provider: {
        id: updatedProfile.id,
        name: updatedProfile.user.name,
        isVerified: updatedProfile.isVerified,
      }
    });
  } catch (error: any) {
    console.error("[API_ADMIN_KYC_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
