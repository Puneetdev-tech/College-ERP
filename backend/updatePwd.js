import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.update({
    where: { email: "admin@rjit.edu.in" },
    data: { password: hashedPassword }
  });
  console.log("Admin password updated to 'admin123'");
}
main().catch(console.error).finally(() => prisma.$disconnect());
