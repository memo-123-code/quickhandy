import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // ── 1. Service Categories ──────────────────────────────────────────
  const categories = [
    { name: "Plumbing", icon: "Droplet" },
    { name: "Electrical", icon: "Zap" },
    { name: "Carpentry", icon: "Hammer" },
    { name: "HVAC", icon: "Snowflake" },
    { name: "Painter", icon: "Paintbrush" },
    { name: "Tile Setter", icon: "LayoutGrid" },
    { name: "Home Appliance Repair", icon: "WashingMachine" },
    { name: "Blacksmith / Welder", icon: "Anvil" },
    { name: "Gypsum Board", icon: "Layers" },
    { name: "Satellite Dish Tech", icon: "Satellite" },
    { name: "Cleaning Services", icon: "Sparkles" },
    { name: "Moving & Packing", icon: "Truck" },
    { name: "Aluminum & Glass", icon: "AppWindow" },
    { name: "Pest Control", icon: "Bug" },
    { name: "Security & CCTV", icon: "Cctv" },
  ];

  for (const cat of categories) {
    await prisma.serviceCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Service categories seeded");

  // ── 2. Hash shared password ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash("Test@1234", 10);

  // ── 3. Admin User ───────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@quickhandy.com" },
    update: {},
    create: {
      name: "QuickHandy Admin",
      email: "admin@quickhandy.com",
      password: hashedPassword,
      role: "ADMIN",
      profile: {
        create: {
          phone: "+20-100-000-0001",
          bio: "Platform Administrator",
          city: "Cairo",
          isVerified: true,
        },
      },
      wallet: {
        create: {
          balance: 0,
          currency: "EGP",
        },
      },
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // ── 4. Client User ──────────────────────────────────────────────────
  const client = await prisma.user.upsert({
    where: { email: "client@quickhandy.com" },
    update: {},
    create: {
      name: "Test Client",
      email: "client@quickhandy.com",
      password: hashedPassword,
      role: "CLIENT",
      profile: {
        create: {
          phone: "+20-100-000-0002",
          bio: "Test client account",
          city: "Zagazig",
          isVerified: true,
        },
      },
      wallet: {
        create: {
          balance: 500.0,
          currency: "EGP",
        },
      },
    },
  });
  console.log(`✅ Client user: ${client.email}`);

  // ── 5. Provider User ────────────────────────────────────────────────
  const provider = await prisma.user.upsert({
    where: { email: "provider@quickhandy.com" },
    update: {},
    create: {
      name: "Test Provider",
      email: "provider@quickhandy.com",
      password: hashedPassword,
      role: "PROVIDER",
      profile: {
        create: {
          phone: "+20-100-000-0003",
          bio: "Certified plumber and electrician with 5 years experience",
          city: "10th of Ramadan",
          isVerified: true,
          rating: 4.8,
          totalJobs: 42,
          hourlyRate: 150.0,
          skills: JSON.stringify(["Plumbing", "Electrical", "HVAC"]),
        },
      },
      wallet: {
        create: {
          balance: 1200.0,
          currency: "EGP",
        },
      },
    },
  });
  console.log(`✅ Provider user: ${provider.email}`);

  console.log("\n🎉 Seed complete! Test credentials:");
  console.log("   admin@quickhandy.com   / Test@1234  (role: ADMIN)");
  console.log("   client@quickhandy.com  / Test@1234  (role: CLIENT)");
  console.log("   provider@quickhandy.com / Test@1234  (role: PROVIDER)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
