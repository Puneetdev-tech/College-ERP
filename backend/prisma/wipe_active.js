import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Starting System Reset: Wiping active data to 0...");

  // 1. Wipe all active transactions
  await prisma.issueLog.deleteMany({});
  await prisma.approvalStep.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.maintenanceHistory.deleteMany({});
  await prisma.maintenanceUnit.deleteMany({});
  await prisma.stockAdjustment.deleteMany({});
  await prisma.notification.deleteMany({});

  // 2. Wipe active inventory items (Starts system at 0 stock)
  await prisma.inventoryItem.deleteMany({});

  console.log("✅ Active system successfully reset to 0 data.");
  console.log("✅ Legacy tables (inventory_items, sanitary_items, electrical_items) were IGNORED and are SAFE.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
