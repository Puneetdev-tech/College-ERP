import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const user = await prisma.user.findFirst({
    where: { email: "admin@rjit.edu.in" }
  });

  if (!user) {
    console.log("Error: User admin@rjit.edu.in not found in the database!");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
  console.log("Admin password updated to 'admin123'");
}
main().catch(console.error).finally(() => prisma.$disconnect());
