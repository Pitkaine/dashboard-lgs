import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcryptjs.hash("LGSadmin2026", 12);

  const user = await prisma.user.upsert({
    where: { email: "peter@lesgarssympas.com" },
    update: {},
    create: {
      email: "peter@lesgarssympas.com",
      password: hashedPassword,
      name: "Peter",
      role: "admin",
    },
  });

  console.log("Admin user created/verified:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
