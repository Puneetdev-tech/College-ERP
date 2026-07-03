import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database cleanup...");

  // Delete records in dependency order
  const stepsDeleted = await prisma.approvalStep.deleteMany();
  console.log(`Deleted ${stepsDeleted.count} approval step entries.`);

  const ordersDeleted = await prisma.order.deleteMany();
  console.log(`Deleted ${ordersDeleted.count} order entries.`);

  const issuesDeleted = await prisma.issueLog.deleteMany();
  console.log(`Deleted ${issuesDeleted.count} issue log entries.`);

  const notificationsDeleted = await prisma.notification.deleteMany();
  console.log(`Deleted ${notificationsDeleted.count} notification entries.`);

  const itemsDeleted = await prisma.inventoryItem.deleteMany();
  console.log(`Deleted ${itemsDeleted.count} inventory item entries.`);

  const maintenanceHistoryDeleted = await prisma.maintenanceHistory.deleteMany();
  console.log(`Deleted ${maintenanceHistoryDeleted.count} maintenance history entries.`);

  const maintenanceUnitsDeleted = await prisma.maintenanceUnit.deleteMany();
  console.log(`Deleted ${maintenanceUnitsDeleted.count} maintenance unit entries.`);

  console.log("Database clean up completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during database cleanup:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
