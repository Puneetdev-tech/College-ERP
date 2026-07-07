import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database transaction cleanup (removing test orders and issue logs)...");

  // Delete records in dependency order
  const stepsDeleted = await prisma.approvalStep.deleteMany();
  console.log(`Deleted ${stepsDeleted.count} approval step entries.`);

  const ordersDeleted = await prisma.order.deleteMany();
  console.log(`Deleted ${ordersDeleted.count} order entries.`);

  const issuesDeleted = await prisma.issueLog.deleteMany();
  console.log(`Deleted ${issuesDeleted.count} issue log entries.`);

  const notificationsDeleted = await prisma.notification.deleteMany();
  console.log(`Deleted ${notificationsDeleted.count} notification entries.`);

  console.log("Database transaction cleanup completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during transaction cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
