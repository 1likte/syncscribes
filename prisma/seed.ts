import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Antalya1250.", 10);

  await prisma.user.upsert({
    where: { username: "chefyunuskalkan" },
    update: {
      password: passwordHash,
      role: "OWNER",
      email: "chefyunuskalkan@example.com",
      subscriptionStatus: "ACTIVE",
      firstName: "Chef",
      lastName: "Yunus"
    },
    create: {
      username: "chefyunuskalkan",
      email: "chefyunuskalkan@example.com",
      password: passwordHash,
      role: "OWNER",
      firstName: "Chef",
      lastName: "Yunus",
      subscriptionStatus: "ACTIVE"
    },
  });

  console.log("✅ OWNER account seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
