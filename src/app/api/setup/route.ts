import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@quickhandy.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: "Test user already exists", user: existingAdmin });
    }

    const hashedPassword = await bcrypt.hash("123", 10);

    const admin = await prisma.user.create({
      data: {
        name: "Admin",
        email: "admin@quickhandy.com",
        password: hashedPassword,
        role: "ADMIN",
        profile: {
          create: {
            phone: "+1234567890",
            skills: "[]",
          }
        }
      },
    });

    return NextResponse.json({ message: "Test user created successfully!", user: admin });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ message: "Error setting up test user" }, { status: 500 });
  }
}
