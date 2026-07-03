import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing subcategories...");

  // Delete Electronics/Cables under Stationary category
  const delStationary = await prisma.inventorySubcategory.deleteMany({
    where: {
      categoryId: "stationary",
      name: "Electronics/Cables"
    }
  });
  console.log(`Deleted ${delStationary.count} Electronics/Cables subcategory entries.`);

  // Delete Hardware/Fittings under Sanitory category
  const delSanitory = await prisma.inventorySubcategory.deleteMany({
    where: {
      categoryId: "sanitory",
      name: "Hardware/Fittings"
    }
  });
  console.log(`Deleted ${delSanitory.count} Hardware/Fittings subcategory entries.`);

  console.log("Subcategory deletion completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during deletion:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
