const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { email: "user@gmail.com" },

    update: {},
    create: {
      name: "User",
      email: "user@gmail.com",
      password: await bcrypt.hash("111111", 10),
    },
  });

  console.log("Created user:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
