import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const subcategories = await prisma.inventorySubcategory.findMany({
    include: { category: true }
  });
  console.log("Current subcategories in DB:");
  console.log(JSON.stringify(subcategories, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
