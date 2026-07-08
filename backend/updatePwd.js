import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const email = "admin@rjit.edu.in";
  
  // Find user
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } }
  });

  if (!user) {
    console.log(`User ${email} not found. Creating a new admin user...`);
    await prisma.user.create({
      data: {
        name: "Admin User",
        email: email,
        password: hashedPassword,
        role: "Admin",
        status: "Active",
        permissions: ["Dashboard", "Inventory", "Place Order", "Receive Order", "Issue Stock", "Analytics", "Reports", "Notifications", "Users", "Settings", "Maintenance", "Backup"]
      }
    });
    console.log(`Admin user created with password 'admin123'`);
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });
    console.log(`Admin password updated to 'admin123'`);
  }
  
  // List all users for verification
  const allUsers = await prisma.user.findMany();
  console.log("Current Users in Database:", allUsers.map(u => ({ email: u.email, role: u.role, status: u.status })));
}

main()
  .catch((e) => {
    console.error("Prisma script error:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
