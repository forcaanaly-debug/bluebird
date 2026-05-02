import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPhone = process.env.SEED_ADMIN_PHONE ?? "+923001234567";
  await prisma.user.upsert({
    where: { phone: adminPhone },
    create: {
      phone: adminPhone,
      name: "BlueBird Admin",
      role: Role.ADMIN
    },
    update: { role: Role.ADMIN, name: "BlueBird Admin" }
  });
  console.log("Seed: admin user", adminPhone);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
